import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { getProfile, getSnapshots, getWorkoutLogs, getMealLogs, getStreakDays, getTotalCaloriesBurned, getAISummary, saveProfile, saveSnapshot } from "../../services/userProfile";
import { useNavigate } from "react-router-dom";

const ProgressTracker = () => {
  const navigate = useNavigate();
  const authData = localStorage.getItem("auth");
  const auth = authData ? JSON.parse(authData) : null;
  const userId = auth?.user?._id || auth?.user?.id || "local-user";
  const userName = auth?.user?.name || "Athlete";

  const [profile, setProfile] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalCals, setTotalCals] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [newWeight, setNewWeight] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfile(userId));
    setSnapshots(getSnapshots(userId));
    setWorkouts(getWorkoutLogs(userId));
    setStreak(getStreakDays(userId));
    setTotalCals(getTotalCaloriesBurned(userId));
    setAiSummary(getAISummary(userId));
  }, [userId]);

  const firstSnap = snapshots[0];
  const latestSnap = snapshots[snapshots.length - 1];

  const weightChange = firstSnap && latestSnap && firstSnap.weight !== latestSnap.weight
    ? (latestSnap.weight - firstSnap.weight).toFixed(1)
    : null;

  const joinedDate = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A";
  const daysSinceJoin = profile?.joinedAt ? Math.floor((Date.now() - new Date(profile.joinedAt)) / 86400000) : 0;

  const weeklyWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now - d) / 86400000;
    return diff <= 7;
  }).length;

  const monthlyWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const levelOrder = ["Beginner", "Intermediate", "Athlete"];
  const currentLevelIdx = levelOrder.indexOf(profile?.fitnessLevel || "Beginner");
  const firstLevelIdx = levelOrder.indexOf(firstSnap?.fitnessLevel || "Beginner");
  const levelImproved = currentLevelIdx > firstLevelIdx;

  const handleLogWeight = () => {
    if (!newWeight) return;
    const updated = saveProfile(userId, { weight: parseFloat(newWeight) });
    saveSnapshot(userId, { ...updated });
    setProfile(updated);
    setSnapshots(getSnapshots(userId));
    setSaved(true);
    setNewWeight("");
    setTimeout(() => setSaved(false), 2000);
  };

  const bmi = profile?.weight && profile?.height
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : null;

  const fitnessLevelColors = { Beginner: "text-green-400", Intermediate: "text-blue-400", Athlete: "text-yellow-400" };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              📊 YOUR PROGRESS JOURNEY
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Hey {userName}!{" "}
              <span className="bg-gradient-to-r from-[#f15377] to-purple-500 bg-clip-text text-transparent">
                Look How Far You&apos;ve Come
              </span>
            </h1>
            <p className="text-gray-400">Member since {joinedDate} · {daysSinceJoin} days on your journey</p>
          </div>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Day Streak", value: `${streak}🔥`, sub: "consecutive days active", color: "from-orange-500/20 to-red-900/10", border: "border-orange-500/30" },
              { label: "Workouts (Month)", value: monthlyWorkouts, sub: `${weeklyWorkouts} this week`, color: "from-blue-500/20 to-blue-900/10", border: "border-blue-500/30" },
              { label: "Calories Burned", value: totalCals > 0 ? `${totalCals.toLocaleString()}` : "—", sub: "total from workouts", color: "from-[#f15377]/20 to-red-900/10", border: "border-[#f15377]/30" },
              { label: "Current BMI", value: bmi || "—", sub: bmi ? (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese") : "Update weight", color: "from-green-500/20 to-green-900/10", border: "border-green-500/30" },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5 text-center`}>
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-gray-300">{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Before vs Now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Weight Journey */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">⚖️ Weight Journey</h3>
              {snapshots.length >= 2 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-gray-400 text-xs mb-1">When You Joined</div>
                      <div className="text-3xl font-bold text-white">{firstSnap?.weight}<span className="text-sm text-gray-400"> kg</span></div>
                    </div>
                    <div className="text-4xl">→</div>
                    <div className="text-center">
                      <div className="text-gray-400 text-xs mb-1">Current</div>
                      <div className="text-3xl font-bold text-white">{profile?.weight || latestSnap?.weight}<span className="text-sm text-gray-400"> kg</span></div>
                    </div>
                  </div>
                  {weightChange !== null && (
                    <div className={`text-center py-2 rounded-xl ${parseFloat(weightChange) < 0 ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}>
                      <span className="font-bold">{parseFloat(weightChange) < 0 ? "↓" : "↑"} {Math.abs(weightChange)} kg {parseFloat(weightChange) < 0 ? "lost" : "gained"}</span>
                    </div>
                  )}
                  {/* Mini timeline */}
                  <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                    {snapshots.map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-1">
                        <span>{new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        <span className="text-white font-semibold">{s.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-3">Log your weight regularly to see your journey</div>
                  <div className="text-gray-400 text-sm">Current: <span className="text-white font-bold">{profile?.weight || "—"} kg</span></div>
                </div>
              )}

              {/* Log today's weight */}
              <div className="mt-4 flex gap-2">
                <input type="number" placeholder="Log today's weight (kg)" value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#f15377]" />
                <button onClick={handleLogWeight}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? "bg-green-500 text-white" : "bg-[#f15377] text-white hover:bg-[#d63a5e]"}`}>
                  {saved ? "✓ Saved!" : "Log"}
                </button>
              </div>
            </div>

            {/* Fitness Level Progress */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">💪 Fitness Level Progress</h3>
              <div className="flex flex-col gap-4">
                {["Beginner", "Intermediate", "Athlete"].map((level, i) => {
                  const isCurrent = profile?.fitnessLevel === level;
                  const isFirst = firstSnap?.fitnessLevel === level && level !== profile?.fitnessLevel;
                  const isPast = levelOrder.indexOf(level) < currentLevelIdx;
                  return (
                    <div key={level} className={`flex items-center gap-4 p-3 rounded-xl border ${isCurrent ? "border-[#f15377] bg-[#f15377]/10" : isPast ? "border-green-500/30 bg-green-500/5" : "border-gray-700"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCurrent ? "bg-[#f15377]" : isPast ? "bg-green-500" : "bg-gray-700"}`}>
                        {isPast || isCurrent ? "✓" : "○"}
                      </div>
                      <div>
                        <div className={`font-bold ${isCurrent ? "text-[#f15377]" : isPast ? "text-green-400" : "text-gray-500"}`}>{level}</div>
                        {isCurrent && <div className="text-xs text-gray-400">Your current level</div>}
                        {isFirst && <div className="text-xs text-gray-400">Where you started</div>}
                        {isPast && <div className="text-xs text-green-400">✨ Surpassed!</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {levelImproved && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                  <span className="text-green-400 font-bold text-sm">🎉 You leveled up! Amazing progress!</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile + Sports */}
          {profile && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8">
              <h3 className="text-white font-bold text-lg mb-4">🏅 Your Fitness Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Goal", value: profile.goal || "—", emoji: "🎯" },
                  { label: "Diet", value: profile.diet || "—", emoji: "🥗" },
                  { label: "Height", value: profile.height ? `${profile.height} cm` : "—", emoji: "📐" },
                  { label: "Weight", value: profile.weight ? `${profile.weight} kg` : "—", emoji: "⚖️" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="text-white font-bold text-sm">{item.value}</div>
                    <div className="text-gray-400 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
              {profile.sports?.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-400 text-sm mb-2">Your Sports:</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.sports.map(s => (
                      <span key={s} className="text-xs px-3 py-1 bg-[#f15377]/15 border border-[#f15377]/30 text-[#f15377] rounded-full font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-white font-bold text-lg">Your AI Fitness Summary</h3>
                  <p className="text-gray-400 text-xs">Generated on {new Date(aiSummary.generatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{aiSummary.text}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/main")} className="bg-gradient-to-r from-[#f15377] to-purple-600 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-transform">
              🏠 Back to Dashboard
            </button>
            <button onClick={() => navigate("/nutrition")} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-transform">
              🥗 Nutrition Hub
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressTracker;
