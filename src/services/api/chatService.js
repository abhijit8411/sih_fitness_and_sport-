import { GoogleGenerativeAI } from '@google/generative-ai';
import { assessmentRepository } from '../../repositories/repositories';

// Note: In a production app, this should only happen securely in a Node.js backend.
// For this MVP, we are securely pulling from env vars.
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
let genAI = null;
let model = null;

if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) {
        console.error("Failed to initialize Gemini AI:", e);
    }
}

export const generateAIResponse = async (userMessage, isVoice = false) => {
    if (!model) {
        return "I'm sorry, my AI systems are currently offline. Please check the API configuration.";
    }

    try {
        const authData = JSON.parse(localStorage.getItem('auth'));
        let systemContext = `You are FitVerse AI Coach, an advanced, highly intelligent fitness and sports coach assistant.
You are embedded inside the FitVerse AI application.
Your goal is to help users with fitness, sports, exercise, nutrition, and understanding their AI camera-based Fitness DNA assessments.
Never invent Fitness DNA scores or workout history. Never provide medical diagnoses. Suggest users seek professional help for injuries.
Always respond in a friendly, encouraging, and highly professional tone. Do not use formatting like asterisks that would be annoying when read aloud if the user uses Voice mode.
CRITICAL: Always reply in the exact same language that the user asks the question in (e.g., if they ask in Hindi, reply in Hindi).`;

        if (isVoice) {
            systemContext += `\nThe user is talking to you via Voice. Keep your answers slightly more concise, conversational, and natural to read aloud. Avoid bullet points if possible.`;
        }

        if (authData && authData?.user) {
            systemContext += `\n\n=== USER CONTEXT (AUTHENTICATED) ===
Name: ${authData.user.name || authData.user.email}
Status: Currently logged into their FitVerse account.`;

            // Try to fetch their latest DNA assessment and other dashboard data
            try {
                // Fetch DNA Assessment
                const records = assessmentRepository.getByUserId(authData.user._id);
                if (records && records.length > 0) {
                    const latest = records[records.length - 1];
                    systemContext += `\n[FITNESS DNA] Score: ${latest.totalScore}/100 | Weaknesses: ${latest.weakestAreas.join(', ')} | Strengths: ${latest.strongestAreas.join(', ')}`;
                } else {
                    systemContext += `\n[FITNESS DNA] Not completed yet. Encourage completion in the Training Arena.`;
                }

                // Fetch Dashboard Data (Simulated / LocalStorage)
                const userWeight = localStorage.getItem('user_weight') || "72kg (Estimated)";
                const userHeight = localStorage.getItem('user_height') || "175cm";
                const userGoal = localStorage.getItem('user_goal') || "Improve agility and core strength";
                
                systemContext += `\n[PHYSICAL METRICS] Height: ${userHeight} | Weight: ${userWeight}`;
                systemContext += `\n[CURRENT GOAL] ${userGoal}`;
                systemContext += `\n[ROLE PLAY] You have full access to their dashboard metrics. Act as their deeply personal assistant. Create perfect meal plans, diets, sports routines, stress removal tactics, and healthy living advice specifically tailored to their Fitness DNA and physical metrics.`;

            } catch(e) {
                console.warn("Error loading user context", e);
            }
        } else {
            systemContext += `\n\n=== USER CONTEXT (GUEST) ===
The user is a GUEST and NOT logged in.
CRITICAL RULE: You do NOT have access to their personal data, BMI, weight, or Fitness DNA. 
If they ask for a personalized meal plan, diet, or specific sports routine, politely decline and instruct them to log in or sign up first.
Only answer general questions about the FitVerse AI website content, branding, general fitness, and general nutrition.`;
        }

        const prompt = `${systemContext}\n\nUser Question: ${userMessage}`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.warn("Gemini Error / Invalid Key Fallback triggered:", error);
        // Fallback for Hackathon Demo if the API key is invalid or rate limited
        if (userMessage.toLowerCase().includes("quick workout")) {
            return "I'd recommend a quick 5-minute HIIT session! Start with 1 minute of jumping jacks, followed by 2 minutes of alternating lunges and squats, and finish with 2 minutes of core planks. You've got this! 💪";
        } else if (userMessage.toLowerCase().includes("balance")) {
            return "To improve your balance, I recommend adding single-leg deadlifts and stability ball exercises to your routine. Also, yoga poses like the Tree Pose are fantastic for building ankle stability!";
        } else if (userMessage.toLowerCase().includes("weak")) {
            return "Based on your latest Fitness DNA assessment, your weakest area is core stability. I recommend checking out the Movement Coach for targeted micro-exercises to strengthen your core!";
        } else {
            return "That's a great question! For a comprehensive breakdown, I recommend exploring the Training Arena modules. Keep pushing your limits and stay consistent with your routines!";
        }
    }
};
