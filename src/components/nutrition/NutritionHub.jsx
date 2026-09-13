import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAISummary } from "../../services/userProfile";

const meals = [
  { name: "Grilled Chicken Bowl", type: "Lunch", calories: 520, protein: 45, carbs: 38, fats: 14, emoji: "", tags: ["High Protein", "Low Fat"], color: "from-orange-500/20 to-orange-900/10", border: "border-orange-500/30" },
  { name: "Avocado & Egg Toast", type: "Breakfast", calories: 380, protein: 18, carbs: 30, fats: 22, emoji: "", tags: ["Healthy Fats", "Quick"], color: "from-green-500/20 to-green-900/10", border: "border-green-500/30" },
  { name: "Salmon with Quinoa", type: "Dinner", calories: 610, protein: 52, carbs: 45, fats: 18, emoji: "", tags: ["Omega-3", "Complete Protein"], color: "from-blue-500/20 to-blue-900/10", border: "border-blue-500/30" },
  { name: "Protein Smoothie", type: "Snack", calories: 290, protein: 28, carbs: 32, fats: 5, emoji: "", tags: ["Post-Workout", "Fast Absorbing"], color: "from-purple-500/20 to-purple-900/10", border: "border-purple-500/30" },
  { name: "Greek Yogurt & Berries", type: "Snack", calories: 220, protein: 15, carbs: 28, fats: 4, emoji: "", tags: ["Probiotics", "Antioxidants"], color: "from-pink-500/20 to-pink-900/10", border: "border-pink-500/30" },
  { name: "Lentil Soup", type: "Lunch", calories: 340, protein: 20, carbs: 50, fats: 6, emoji: "", tags: ["Plant Protein", "Fiber Rich"], color: "from-yellow-500/20 to-yellow-900/10", border: "border-yellow-500/30" },
];

const preworkout = [
  { food: "Banana", timing: "30 min before", reason: "Fast energy, easily digestible carbs" },
  { food: "Peanut Butter on Rice Cake", timing: "45 min before", reason: "Sustained energy with healthy fats" },
  { food: "Black Coffee", timing: "30 min before", reason: "Boosts performance and fat burning" },
];

const postworkout = [
  { food: "Chicken + Sweet Potato", timing: "30 min after", reason: "Muscle repair + glycogen replenishment" },
  { food: "Chocolate Milk", timing: "20 min after", reason: "Ideal protein:carb ratio for recovery" },
  { food: "Eggs on Toast", timing: "45 min after", reason: "Complete amino acids for muscle growth" },
];

const NutritionHub = () => {
  const navigate = useNavigate();
  const [water, setWater] = useState(4);
  const [calories, setCalories] = useState(1240);
  const totalWater = 8;
  const targetCalories = 2200;
  const caloriesPct = Math.min((calories / targetCalories) * 100, 100).toFixed(0);
  const [auth] = useAuth();
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    try {
      const uid = auth?.user?._id || auth?.user?.id || 'local-user';
      const s = getAISummary(uid);
      setAiSummary(s);
    } catch (e) { /* ignore */ }
  }, [auth?.user]);

  const macros = {
    protein: { current: 98, target: 150, color: "#f15377", label: "Protein" },
    carbs: { current: 145, target: 220, color: "#3b82f6", label: "Carbs" },
    fats: { current: 42, target: 65, color: "#f59e0b", label: "Fats" },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              NUTRITION HUB
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Fuel Your{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Performance
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Track your nutrition, discover healthy meals, and optimize your body for peak athletic performance.
            </p>
          </div>

          {aiSummary?.text && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl">
              <div className="text-gray-300 text-sm mb-2 font-semibold">AI Insights</div>
              <div className="text-sm text-gray-200 leading-relaxed max-h-40 overflow-auto">
                {aiSummary.text}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white text-lg">Calories Today</h3>
                <span className="text-xs text-gray-500">{calories} / {targetCalories} kcal</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700" style={{ width: `${caloriesPct}%` }} />
              </div>
              <p className="text-gray-400 text-sm">{targetCalories - calories} kcal remaining</p>
              <button onClick={() => setCalories(c => Math.min(c + 200, targetCalories + 500))} className="mt-4 w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 text-sm font-semibold rounded-xl py-2 transition-colors">
                + Add Meal
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-white text-lg mb-4">Macronutrients</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(macros).map(([key, m]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{m.label}</span>
                      <span className="text-white font-semibold">{m.current}g / {m.target}g</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min((m.current / m.target) * 100, 100)}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Hydration</h3>
                <span className="text-blue-400 font-bold">{water}/{totalWater} glasses</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {Array.from({ length: totalWater }).map((_, i) => (
                  <span key={i} onClick={() => setWater(i + 1)} className={`text-2xl cursor-pointer transition-all duration-200 hover:scale-110 select-none ${i < water ? "opacity-100" : "opacity-25"}`}>●</span>
                ))}
              </div>
              <button onClick={() => setWater(w => Math.min(w + 1, totalWater))} className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl py-2 transition-colors">
                + Drink a Glass
              </button>
              {water >= totalWater && <p className="text-green-400 text-xs mt-2 text-center font-semibold">Daily goal reached!</p>}
            </div>
          </div>

          <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Healthy Meal Ideas</h2>
              <span className="text-gray-500 text-sm">Curated for athletes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {meals.map((meal, i) => (
                <div key={i} className={`bg-gradient-to-br ${meal.color} border ${meal.border} rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{meal.type}</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{meal.emoji} {meal.name}</h3>
                    </div>
                    <span className="text-2xl font-bold text-white">{meal.calories}<span className="text-xs font-normal text-gray-400"> kcal</span></span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[["Protein", meal.protein], ["Carbs", meal.carbs], ["Fats", meal.fats]].map(([label, val]) => (
                      <div key={label} className="text-center bg-black/30 rounded-xl py-1.5">
                        <div className="text-white font-bold text-sm">{val}g</div>
                        <div className="text-gray-400 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {meal.tags.map((tag, j) => <span key={j} className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full">{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">Pre-Workout Fuel</h2>
              <p className="text-gray-400 text-sm mb-5">Eat these before training to maximize your performance</p>
              <div className="flex flex-col gap-4">
                {preworkout.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                    <div className="text-2xl">{item.food.split(" ")[0]}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{item.food.split(" ").slice(1).join(" ")}</div>
                      <div className="text-orange-400 text-xs font-semibold mb-0.5">{item.timing}</div>
                      <div className="text-gray-400 text-xs">{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">Post-Workout Recovery</h2>
              <p className="text-gray-400 text-sm mb-5">Eat these after training to recover faster and build muscle</p>
              <div className="flex flex-col gap-4">
                {postworkout.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <div className="text-2xl">{item.food.split(" ")[0]}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{item.food.split(" ").slice(1).join(" ")}</div>
                      <div className="text-green-400 text-xs font-semibold mb-0.5">{item.timing}</div>
                      <div className="text-gray-400 text-xs">{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Athlete Nutrition Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                { icon: "", title: "Meal Timing", tip: "Eat every 3-4 hours to keep metabolism active and muscles fueled." },
                { icon: "", title: "Protein First", tip: "Aim for 1.6-2.2g of protein per kg of bodyweight on training days." },
                { icon: "", title: "Sleep & Recover", tip: "A casein-rich snack before bed (like cottage cheese) fuels overnight muscle repair." },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="text-3xl">{tip.icon}</div>
                  <div>
                    <div className="text-white font-semibold mb-1">{tip.title}</div>
                    <div className="text-gray-400 text-sm">{tip.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => navigate("/combat")} className="bg-gradient-to-r from-[#f15377] to-purple-600 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              Go to Training Arena
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default NutritionHub;
