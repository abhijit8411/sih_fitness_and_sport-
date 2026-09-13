import Calendar from './components/Calendar'
import Navbar from './components/Navbar'
import { ProfileComponent } from './components/ProfileComponent'
import Routines from './components/Routines'
import Workouts from './components/Workouts'
import History from './components/History'
import BMICalculator from './components/BMICalculator'
import ChallengesPanel from './components/challenges/ChallengesPanel'
import './index.css'
import { useState, useEffect } from 'react'
import { getProfile, isOnboarded } from './services/userProfile'

const motivationalQuotes = [
  "💪 The only bad workout is the one that didn't happen.",
  "🔥 Push yourself, because no one else is going to do it for you.",
  "🏋️ Your body can stand almost anything. It's your mind you have to convince.",
  "⚡ The pain you feel today will be the strength you feel tomorrow.",
  "🎯 Don't limit your challenges — challenge your limits.",
  "🌟 Fitness is not about being better than someone else. It's about being better than you used to be.",
  "💥 Sweat is fat crying.",
  "🚀 The harder you work, the luckier you get.",
];

function Main() {
  const [quote, setQuote] = useState('');
  const [greeting, setGreeting] = useState('');
  const [fitnessProfile, setFitnessProfile] = useState(null);
  const [onboarded, setOnboardedState] = useState(true);
  const authData = localStorage.getItem('auth');
  const profile = authData ? JSON.parse(authData) : null;
  const userId = profile?.user?._id || profile?.user?.id || 'local-user';
  const userName = profile?.user?.name || 'Athlete';
  const userEmail = profile?.user?.email || '';

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    setFitnessProfile(getProfile(userId));
    setOnboardedState(isOnboarded(userId, userEmail));
  }, [userId, userEmail]);

  return (
    <>
      <Navbar />
      
      {/* Welcome Banner */}
      <div className='welcomeBanner'>
        <div className='welcomeContent'>
          <h1 className='welcomeGreeting'>{greeting}, <span className='welcomeName'>{userName}</span>! 👋</h1>
          <p className='welcomeQuote'>{quote}</p>
        </div>
      </div>

      <ProfileComponent />

      {/* Onboarding prompt for users who skipped */}
      {!onboarded && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-gradient-to-r from-purple-900/40 to-[#f15377]/20 border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📋</span>
              <div>
                <div className="text-white font-bold text-lg">Complete Your Fitness Profile</div>
                <div className="text-gray-400 text-sm">Get AI-personalized challenges, meal plans & sports coaching in 2 minutes.</div>
              </div>
            </div>
            <a href="/onboarding" className="shrink-0 bg-gradient-to-r from-purple-600 to-[#f15377] text-white font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform whitespace-nowrap">
              Start Setup →
            </a>
          </div>
        </div>
      )}
      
      {/* BMI Calculator Section */}
      <div className='bmiSection'>
        <BMICalculator />
      </div>

      {/* AI Workout Recommendation */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-[#f15377]/20 via-purple-900/20 to-blue-900/20 border border-[#f15377]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🤖</div>
            <div>
              <div className="text-xs font-bold text-[#f15377] uppercase tracking-widest mb-1">AI Today's Pick</div>
              <h3 className="text-xl font-bold text-white">Bicep Curls + Squats Combo</h3>
              <p className="text-gray-400 text-sm mt-1">Based on your level & time of day — 20 min · 180 kcal · Moderate intensity</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 bg-[#f15377]/20 text-[#f15377] rounded-full font-semibold">Strength</span>
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-semibold">Full Body</span>
              </div>
            </div>
          </div>
          <a href="/train/bicepCurls" className="shrink-0 bg-gradient-to-r from-[#f15377] to-purple-600 text-white font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform whitespace-nowrap">
            Start Now →
          </a>
        </div>
      </div>

      {/* Sports Performance Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sports Performance</h2>
          <a href="/combat" className="text-[#f15377] hover:text-white transition-colors flex items-center gap-2 font-semibold">
            Enter AI Arena <span className="text-xl">→</span>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform group-hover:text-blue-500">🏏</div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Cricket Metrics</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Track bowling arm speed, batting stance stability, and sprint acceleration between wickets.</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Speed</span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Stability</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform group-hover:text-green-500">⚽</div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Football Agility</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Analyze change of direction, explosive jumping power, and lower body injury risk markers.</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Agility</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Power</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform group-hover:text-orange-500">🏀</div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Basketball Vertical</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Measure true vertical jump height, landing mechanics, and defensive lateral quickness.</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">Vertical</span>
              <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">Mechanics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Food & Fuel Section */}
      <div className="max-w-6xl mx-auto px-6 py-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🍎 Food & Fuel</h2>
          <a href="/nutrition" className="text-green-400 hover:text-white transition-colors flex items-center gap-2 font-semibold">
            Full Nutrition Hub →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🍗", name: "Grilled Chicken", kcal: 520, tag: "High Protein", tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
            { emoji: "🥑", name: "Avocado Toast", kcal: 380, tag: "Healthy Fats", tagColor: "text-green-400 bg-green-500/10 border-green-500/20" },
            { emoji: "🐟", name: "Salmon & Quinoa", kcal: 610, tag: "Omega-3", tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { emoji: "🥤", name: "Protein Smoothie", kcal: 290, tag: "Post-Workout", tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          ].map((meal, i) => (
            <a key={i} href="/nutrition" className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 hover:-translate-y-1 transition-all duration-200 flex flex-col gap-2">
              <div className="text-4xl">{meal.emoji}</div>
              <div className="text-white font-bold text-sm">{meal.name}</div>
              <div className="text-gray-400 text-xs">{meal.kcal} kcal</div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border self-start ${meal.tagColor}`}>{meal.tag}</span>
            </a>
          ))}
        </div>
      </div>

      <ChallengesPanel />

      <Workouts />
      <Routines />
      <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6 items-stretch w-full'>
        <Calendar />
        <History />
      </div>

      {/* Progress Quick Link */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📊</span>
            <div>
              <div className="text-white font-bold text-lg">Your Progress Journey</div>
              <div className="text-gray-400 text-sm">Track weight, fitness level improvements & achievement milestones</div>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="/progress" className="bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors whitespace-nowrap">
              📈 View Progress
            </a>
            <a href="/onboarding" className="border border-gray-700 text-gray-300 font-semibold px-5 py-2.5 rounded-xl hover:border-gray-500 transition-colors whitespace-nowrap">
              ✏️ Update Profile
            </a>
          </div>
        </div>
      </div>

      {/* Dashboard Footer */}
      <div className='dashboardFooter'>
        <p>© 2026 Fitness & Sport — Your AI Fitness Companion</p>
      </div>
    </>
  )
}

export default Main
