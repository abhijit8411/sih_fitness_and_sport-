import React, { useState, useEffect } from "react";
import { getChallenges, markChallengeComplete, getWorkoutLogs, generatePersonalizedChallenges, getProfile } from "../../services/userProfile";

const ChallengesPanel = () => {
  const authData = localStorage.getItem("auth");
  const auth = authData ? JSON.parse(authData) : null;
  const userId = auth?.user?._id || auth?.user?.id || "local-user";

  const [challenges, setChallenges] = useState([]);
  const [justCompleted, setJustCompleted] = useState(null);

  useEffect(() => {
    const profile = getProfile(userId);
    let c = profile ? generatePersonalizedChallenges(userId, profile) : getChallenges(userId);
    // Refresh daily challenges if date changed
    const today = new Date().toISOString().split("T")[0];
    const hasTodayChallenge = c.some(ch => ch.type === "daily" && ch.date === today);
    if (!hasTodayChallenge && profile) c = generatePersonalizedChallenges(userId, profile);
    setChallenges(c);
  }, [userId]);

  const workoutCount = getWorkoutLogs(userId).filter(w => {
    const monthName = new Date().toLocaleString("default", { month: "long" });
    return new Date(w.date).toLocaleString("default", { month: "long" }) === monthName;
  }).length;

  const handleComplete = (id) => {
    const updated = markChallengeComplete(userId, id);
    setChallenges(updated);
    setJustCompleted(id);
    setTimeout(() => setJustCompleted(null), 2000);
  };

  const daily = challenges.filter(c => c.type === "daily");
  const monthly = challenges.filter(c => c.type === "monthly");

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-white">🏆 Challenges</h2>
        <a href="/progress" className="text-[#f15377] hover:text-white transition-colors font-semibold text-sm">
          View Progress →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📅</span>
            <h3 className="text-white font-bold text-lg">Today&apos;s Challenges</h3>
          </div>
          <div className="space-y-3">
            {daily.map(ch => (
              <div key={ch.id} className={`p-4 rounded-xl border transition-all ${ch.completed ? "border-green-500/30 bg-green-500/5" : "border-gray-700 bg-gray-800/40"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{ch.emoji}</span>
                    <div>
                      <div className={`font-bold text-sm ${ch.completed ? "text-green-400" : "text-white"}`}>{ch.title}</div>
                      <div className="text-gray-400 text-xs mt-0.5 leading-relaxed">{ch.description}</div>
                      <div className="text-[#f15377] text-xs mt-1 font-semibold">🔥 ~{ch.calories} kcal</div>
                    </div>
                  </div>
                  {ch.completed ? (
                    <span className="shrink-0 text-green-400 text-xl">✅</span>
                  ) : (
                    <button onClick={() => handleComplete(ch.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${justCompleted === ch.id ? "bg-green-500 text-white scale-110" : "bg-[#f15377]/20 text-[#f15377] hover:bg-[#f15377] hover:text-white"}`}>
                      {justCompleted === ch.id ? "🎉 Done!" : "Complete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Challenges */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🗓️</span>
            <h3 className="text-white font-bold text-lg">Monthly Goals</h3>
          </div>
          <div className="space-y-4">
            {monthly.map(ch => {
              const progress = ch.id.includes("monthly-1") ? workoutCount : ch.progress || 0;
              const pct = Math.min(Math.round((progress / ch.target) * 100), 100);
              return (
                <div key={ch.id} className={`p-4 rounded-xl border ${ch.completed || pct >= 100 ? "border-green-500/30 bg-green-500/5" : "border-gray-700 bg-gray-800/40"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{ch.emoji}</span>
                    <div className="font-bold text-white text-sm">{ch.title}</div>
                    {pct >= 100 && <span className="ml-auto text-green-400 text-lg">✅</span>}
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{ch.description}</p>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{progress} / {ch.target}</span>
                    <span className={`font-bold ${pct >= 100 ? "text-green-400" : "text-[#f15377]"}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${pct >= 100 ? "bg-green-400" : "bg-gradient-to-r from-[#f15377] to-purple-500"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPanel;
