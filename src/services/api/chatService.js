import { GoogleGenerativeAI } from "@google/generative-ai";
import { assessmentRepository } from "../../repositories/repositories";
import { getProfile, getTodayWorkouts, getStreakDays, getChallenges, getWorkoutLogs } from "../userProfile";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
let genAI = null;
let model = null;

if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) { console.error("Failed to initialize Gemini AI:", e); }
}

const playBase64Audio = (b64, mime = 'audio/mpeg') => {
    try {
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(e => console.warn('Audio play failed', e));
        return audio;
    } catch (e) { console.warn('playBase64Audio error', e); return null; }
};

export const generateAIResponse = async (userMessage, isVoice = false) => {
    if (!model) return "My AI systems are offline. Please check the REACT_APP_GEMINI_API_KEY in your .env file.";
    try {
        const authData = JSON.parse(localStorage.getItem("auth"));
        const userId = authData?.user?._id || authData?.user?.id || "local-user";
        let ctx = `You are the Fitness & Sport AI Coach — an advanced, highly intelligent fitness, sports, and nutrition coach assistant embedded inside the Fitness & Sport application.\nYour goal: help users with fitness, sports, exercise, nutrition, progress tracking, daily/monthly challenges.\nNever invent data you do not have. Never provide medical diagnoses. Suggest professionals for injuries.\nAlways respond in a friendly, encouraging, deeply personal tone. CRITICAL: Reply in the SAME LANGUAGE the user writes in.`;
        if (isVoice) ctx += "\nVoice mode: be concise, conversational, no bullet points.";
        if (authData?.user) {
            const userName = authData.user.name || "Athlete";
            ctx += `\n\n=== USER: ${userName} ===`;
            try {
                const profile = getProfile(userId);
                if (profile) {
                    const bmi = profile.weight && profile.height ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : null;
                    ctx += `\n[PHYSICAL PROFILE]\nName: ${userName} | Weight: ${profile.weight||"?"}kg | Height: ${profile.height||"?"}cm${bmi?` | BMI: ${bmi}`:""}\nFitness Level: ${profile.fitnessLevel||"?"} | Goal: ${profile.goal||"?"} | Diet: ${profile.diet||"?"}\nSports: ${profile.sports?.join(", ")||"None set"} | Joined: ${profile.joinedAt?new Date(profile.joinedAt).toLocaleDateString():"?"}`;
                } else {
                    ctx += "\n[PROFILE] Not completed. Encourage user to visit /onboarding to set up their profile.";
                }
                const todayW = getTodayWorkouts(userId);
                const streak = getStreakDays(userId);
                const recent = getWorkoutLogs(userId).slice(-5);
                ctx += `\n[ACTIVITY]\nStreak: ${streak} days | Today workouts: ${todayW.length>0?todayW.map(w=>w.type||"workout").join(", "):"None yet"}\nRecent: ${recent.length>0?recent.map(w=>`${w.type||"workout"} (${new Date(w.date).toLocaleDateString()})`).join(", "):"No logs yet"}`;
                const challenges = getChallenges(userId);
                const pending = challenges.filter(c=>c.type==="daily"&&!c.completed).map(c=>c.title).join(", ");
                const done = challenges.filter(c=>c.type==="daily"&&c.completed).map(c=>c.title).join(", ");
                ctx += `\n[CHALLENGES]\nPending today: ${pending||"All done!"} | Completed: ${done||"None yet"}`;
                try {
                    const records = assessmentRepository.getByUserId(userId);
                    if (records?.length>0) { const l=records[records.length-1]; ctx+=`\n[FITNESS DNA] Score:${l.totalScore}/100 | Weak: ${l.weakestAreas.join(",")} | Strong: ${l.strongestAreas.join(",")}`; }
                } catch(e) {}
                ctx += `\n[ROLE] You have full access to this user's profile above. Be deeply personal. Use their actual weight, goal, sport, diet. If no workout today, encourage them. Celebrate completed challenges. Give sport-specific drills for their sports. Create meal plans matching their diet type.`;
            } catch (e) { console.warn("Error loading user context", e); }
        } else {
            ctx += "\n\n=== GUEST === Not logged in. Answer general questions only. For personal advice, ask them to log in.";
        }

        // If voice requested, try to use native audio generation if available.
        if (isVoice) {
            try {
                // Attempt SDK audio generation (APIs differ by SDK versions)
                if (model.generateAudio) {
                    const audioRes = await model.generateAudio({ input: `${ctx}\n\nUser: ${userMessage}`, voice: 'alloy' });
                    // assume audioRes contains base64 in audioRes.data or audioRes.audio
                    const b64 = audioRes?.audio || audioRes?.data || audioRes?.base64;
                    if (b64) { playBase64Audio(b64); }
                    // still produce text for display
                    if (audioRes?.transcript) return audioRes.transcript;
                }

                // Some SDKs provide a top-level audio creation utility
                if (genAI?.createAudio) {
                    const created = await genAI.createAudio({ model: 'gemini-audio-beta', input: `${ctx}\n\nUser: ${userMessage}` });
                    const b64 = created?.audio || created?.data || created?.base64;
                    if (b64) { playBase64Audio(b64); }
                    if (created?.text) return created.text;
                }
            } catch (e) {
                console.warn('Native Gemini audio failed, falling back to text+browser TTS', e);
            }
        }

        // Default: generate textual response
        const result = await model.generateContent(`${ctx}\n\nUser: ${userMessage}`);
        const text = typeof result.response.text === 'function' ? result.response.text() : result.response.text;

        // If voice requested but native audio not available, fallback to browser TTS
        if (isVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                const utter = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utter);
            } catch (e) { console.warn('Browser TTS failed', e); }
        }

        return text;
    } catch (error) {
        console.warn("Gemini Error — fallback:", error);
        const m = userMessage.toLowerCase();
        if (m.includes("workout")||m.includes("exercise")) return "Try this: 3 sets of 15 squats + 10 push-ups + 10 lunges. 15 minutes, maximum results! 💪";
        if (m.includes("meal")||m.includes("eat")||m.includes("food")) return "For your goal: Grilled chicken (200g) + brown rice (1 cup) + steamed veggies. Protein within 30 min after workout! 🥗";
        if (m.includes("challenge")) return "Your daily challenges are on the dashboard! Complete them to build streaks and track progress. 🏆";
        if (m.includes("progress")||m.includes("weight")) return "Visit your Progress page (/progress) to log weight and see your improvement journey! 📊";
        return "Great question! Complete your fitness profile at /onboarding to get fully personalized coaching. I am here to help you crush your goals! 💪🔥";
    }
};

export const generateProactiveGreeting = (userId, userName) => {
    try {
        const profile = getProfile(userId);
        const streak = getStreakDays(userId);
        const todayW = getTodayWorkouts(userId);
        const challenges = getChallenges(userId);
        const pending = challenges.filter(c=>c.type==="daily"&&!c.completed);
        if (!profile) return `Hey ${userName}! 👋 Complete your fitness profile to get personalized coaching just for you! Tap "Start Setup" to begin.`;
        if (todayW.length===0 && pending.length>0) return `Hey ${userName}! 💪 No workout yet today. Your challenge "${pending[0].title}" is waiting! ${streak>0?`Keep your ${streak}-day streak alive! 🔥`:"Start a streak today!"}`;
        if (todayW.length>0) return `Great work, ${userName}! 🎉 You have already logged ${todayW.length} workout(s) today. ${streak>1?`${streak}-day streak! 🔥`:""} Need a recovery tip or meal suggestion?`;
        if (streak>=7) return `Incredible, ${userName}! 🏆 ${streak} days of consistency! You are absolutely crushing it. What are we training today?`;
        return `Hey ${userName}! 👋 I know your profile — ${profile.fitnessLevel||"beginner"} level, goal: ${profile.goal||"get fit"}, sports: ${profile.sports?.[0]||"general fitness"}. How can I help today?`;
    } catch(e) { return `Hey ${userName}! 👋 Ready to crush your fitness goals today? Ask me anything!`; }
};
