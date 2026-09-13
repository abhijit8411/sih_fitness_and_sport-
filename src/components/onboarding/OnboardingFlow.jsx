import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile, setOnboarded, saveSnapshot, saveAISummary, generatePersonalizedChallenges } from "../../services/userProfile";
import { generateAIResponse } from "../../services/api/chatService";

const SPORTS = ["🏏 Cricket","⚽ Football","🏀 Basketball","🎾 Tennis","🏊 Swimming","🏃 Running","🧘 Yoga","🏋️ Gym / Weightlifting","🚴 Cycling","🥊 Boxing","🏐 Volleyball","🤸 Gymnastics"];
const GOALS = [
  { id: "weight_loss", label: "Weight Loss", emoji: "🔥", desc: "Burn fat & slim down" },
  { id: "muscle_gain", label: "Muscle Gain", emoji: "💪", desc: "Build strength & mass" },
  { id: "endurance", label: "Endurance", emoji: "🏃", desc: "Run farther, last longer" },
  { id: "flexibility", label: "Flexibility", emoji: "🧘", desc: "Improve mobility & yoga" },
  { id: "sports_perf", label: "Sports Performance", emoji: "🏆", desc: "Dominate your sport" },
  { id: "overall", label: "Overall Fitness", emoji: "⭐", desc: "Be fitter in every way" },
];
const DIET = [
  { id: "non_veg", label: "Non-Vegetarian", emoji: "🍗" },
  { id: "veg", label: "Vegetarian", emoji: "🥦" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "keto", label: "Keto", emoji: "🥩" },
];
const LEVELS = [
  { id: "Beginner", label: "Beginner", emoji: "🌱", desc: "Just starting out or returning after a long break" },
  { id: "Intermediate", label: "Intermediate", emoji: "⚡", desc: "Work out 2-4 times a week regularly" },
  { id: "Athlete", label: "Athlete", emoji: "🏆", desc: "Train intensely 5+ times a week" },
];

const TOTAL_STEPS = 5;

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const authData = localStorage.getItem("auth");
  const auth = authData ? JSON.parse(authData) : null;
  const userId = auth?.user?._id || auth?.user?.id || "local-user";
  const userName = auth?.user?.name || "Athlete";
  const userEmail = auth?.user?.email || "";

  const [form, setForm] = useState({
    weight: "", height: "", fitnessLevel: "", sports: [], goal: "", diet: "", allergies: "", medicalNotes: "",
  });

  const goNext = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 300);
  };
  const goBack = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 300);
  };

  const toggleSport = (sport) => {
    setForm(f => ({
      ...f,
      sports: f.sports.includes(sport) ? f.sports.filter(s => s !== sport) : [...f.sports, sport],
    }));
  };

  const generateSummary = async () => {
    setAiLoading(true);
    const profileSummary = `
User: ${userName}
Weight: ${form.weight}kg, Height: ${form.height}cm
BMI: ${(form.weight / ((form.height / 100) ** 2)).toFixed(1)}
Fitness Level: ${form.fitnessLevel}
Sports: ${form.sports.join(", ") || "None selected"}
Goal: ${form.goal}
Diet: ${form.diet}
    `;
    const prompt = `You are a professional fitness and sports coach. A new user just joined the Fitness & Sport app and completed their onboarding. Based on their profile below, generate a warm, personalized welcome summary with:
1. A brief analysis of their current fitness status (2-3 sentences)
2. Top 3 specific fitness tips tailored to their level and goal
3. Top 3 personalized meal/nutrition suggestions based on their diet type and goal  
4. One motivational sport-specific tip if they selected a sport
5. A short motivating closing statement
Keep it friendly, encouraging, and specific. Use emojis. Max 300 words.

Profile:
${profileSummary}`;

    try {
      const response = await generateAIResponse(prompt);
      setAiSummary(response);
      saveAISummary(userId, response);
    } catch (e) {
      const bmi = (form.weight / ((form.height / 100) ** 2)).toFixed(1);
      const fallback = `🎉 Welcome to Fitness & Sport, ${userName}!\n\nYour BMI is ${bmi}. As a ${form.fitnessLevel}, you're in a great position to ${form.goal.toLowerCase()}.\n\n💪 Fitness Tips:\n• Start with 3 sessions per week and gradually increase\n• Focus on compound exercises for maximum efficiency\n• Track your progress every 2 weeks\n\n🥗 Nutrition Tips:\n• Eat protein within 30 min after workouts\n• Stay hydrated — drink at least 8 glasses of water daily\n• Plan your meals in advance to stay on track\n\n🏆 You've got this! Consistency beats intensity. Let's build something great together!`;
      setAiSummary(fallback);
      saveAISummary(userId, fallback);
    }
    setAiLoading(false);
  };

  useEffect(() => {
    if (step === 5) generateSummary();
  }, [step]);

  const handleComplete = () => {
    const profileData = {
      ...form,
      name: userName,
      joinedAt: new Date().toISOString(),
      bmi: form.weight && form.height ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null,
    };
    saveProfile(userId, profileData);
    saveSnapshot(userId, profileData);
    generatePersonalizedChallenges(userId, profileData);
    setOnboarded(userId, userEmail);
    navigate("/main");
  };

  const canProceed = () => {
    if (step === 1) return form.weight && form.height;
    if (step === 2) return form.fitnessLevel;
    if (step === 3) return form.sports.length > 0;
    if (step === 4) return form.goal && form.diet;
    return true;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10">
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#f15377] to-purple-500 transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <div className={`w-full max-w-xl transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>

        {/* Step 1 — Physical Stats */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">📏</div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Physical Stats</h2>
              <p className="text-gray-400">We use this to calculate your BMI and personalize your plan</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">⚖️ Current Weight</label>
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <input type="number" placeholder="e.g. 70" value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    className="flex-1 bg-transparent text-white text-xl font-bold focus:outline-none placeholder-gray-600" />
                  <span className="text-gray-400 font-semibold">kg</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">📐 Current Height</label>
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <input type="number" placeholder="e.g. 175" value={form.height}
                    onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
                    className="flex-1 bg-transparent text-white text-xl font-bold focus:outline-none placeholder-gray-600" />
                  <span className="text-gray-400 font-semibold">cm</span>
                </div>
              </div>
              {form.weight && form.height && (
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{(form.weight / ((form.height / 100) ** 2)).toFixed(1)}</div>
                  <div className="text-blue-400 text-sm font-semibold">Your BMI</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {(() => { const bmi = form.weight / ((form.height / 100) ** 2); return bmi < 18.5 ? "Underweight — nutrition focus recommended" : bmi < 25 ? "Healthy range — great starting point!" : bmi < 30 ? "Slightly above range — manageable with training" : "Above range — structured plan will help greatly"; })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Fitness Level */}
        {step === 2 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">💪</div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Fitness Level</h2>
              <p className="text-gray-400">Be honest — this helps us set the right intensity for you</p>
            </div>
            <div className="space-y-4">
              {LEVELS.map(level => (
                <button key={level.id} onClick={() => setForm(f => ({ ...f, fitnessLevel: level.id }))}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${form.fitnessLevel === level.id ? "border-[#f15377] bg-[#f15377]/10" : "border-gray-700 bg-gray-800/50 hover:border-gray-500"}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{level.emoji}</span>
                    <div>
                      <div className="text-white font-bold text-lg">{level.label}</div>
                      <div className="text-gray-400 text-sm">{level.desc}</div>
                    </div>
                    {form.fitnessLevel === level.id && <span className="ml-auto text-[#f15377] text-2xl">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Sports */}
        {step === 3 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">🏅</div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Sports & Activities</h2>
              <p className="text-gray-400">Select all that you play or want to improve at</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map(sport => (
                <button key={sport} onClick={() => toggleSport(sport)}
                  className={`p-3 rounded-xl border text-sm font-semibold text-left transition-all ${form.sports.includes(sport) ? "border-[#f15377] bg-[#f15377]/15 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>
                  {sport}
                </button>
              ))}
            </div>
            {form.sports.length > 0 && <p className="text-green-400 text-sm text-center mt-4 font-semibold">✓ {form.sports.length} selected</p>}
          </div>
        )}

        {/* Step 4 — Goals & Diet */}
        {step === 4 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🎯</div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Goals & Diet</h2>
              <p className="text-gray-400">We'll tailor challenges and meal plans around these</p>
            </div>
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Primary Fitness Goal</label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => setForm(f => ({ ...f, goal: g.label }))}
                    className={`p-3 rounded-xl border text-left transition-all ${form.goal === g.label ? "border-[#f15377] bg-[#f15377]/15" : "border-gray-700 hover:border-gray-500"}`}>
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-white font-bold text-sm">{g.label}</div>
                    <div className="text-gray-400 text-xs">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Diet Type</label>
              <div className="grid grid-cols-2 gap-3">
                {DIET.map(d => (
                  <button key={d.id} onClick={() => setForm(f => ({ ...f, diet: d.label }))}
                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${form.diet === d.label ? "border-green-400 bg-green-400/10 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="font-semibold text-sm">{d.label}</span>
                    {form.diet === d.label && <span className="ml-auto text-green-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — AI Analysis */}
        {step === 5 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🤖</div>
              <h2 className="text-3xl font-bold text-white mb-2">Your AI Fitness Summary</h2>
              <p className="text-gray-400">Analyzing your profile to build your personalized plan...</p>
            </div>
            {aiLoading ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#f15377]/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#f15377] animate-spin"></div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">Generating your personalized plan with AI...</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 max-h-80 overflow-y-auto">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{aiSummary}</p>
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "BMI", value: form.weight && form.height ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : "-" },
                { label: "Level", value: form.fitnessLevel || "-" },
                { label: "Goal", value: form.goal ? form.goal.split(" ")[0] : "-" },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-white font-bold">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && step < 5 && (
            <button onClick={goBack} className="flex-1 py-4 rounded-2xl border border-gray-700 text-gray-300 font-bold hover:border-gray-500 transition-all">
              ← Back
            </button>
          )}
          {step < 4 && (
            <button onClick={goNext} disabled={!canProceed()}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#f15377] to-purple-600 text-white font-bold hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
              Continue →
            </button>
          )}
          {step === 4 && (
            <button onClick={goNext} disabled={!canProceed()}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#f15377] to-purple-600 text-white font-bold hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100">
              Analyze My Profile 🤖
            </button>
          )}
          {step === 5 && !aiLoading && (
            <button onClick={handleComplete}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-all text-lg">
              🚀 Start My Fitness Journey!
            </button>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Your data is stored locally on your device and used only to personalize your experience
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
