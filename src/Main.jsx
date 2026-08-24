import Calendar from './components/Calendar'
import Navbar from './components/Navbar'
import { ProfileComponent } from './components/ProfileComponent'
import Routines from './components/Routines'
import Workouts from './components/Workouts'
import History from './components/History'
import BMICalculator from './components/BMICalculator'
import './index.css'
import { useState, useEffect } from 'react'

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
  const authData = localStorage.getItem('auth');
  const profile = authData ? JSON.parse(authData) : null;
  const userName = profile?.user?.name || 'Athlete';

  useEffect(() => {
    // Random motivational quote
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

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
      
      {/* BMI Calculator Section */}
      <div className='bmiSection'>
        <BMICalculator />
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
          {/* Cricket Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform group-hover:text-blue-500">🏏</div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Cricket Metrics</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Track bowling arm speed, batting stance stability, and sprint acceleration between wickets.</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Speed</span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Stability</span>
            </div>
          </div>

          {/* Football Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform group-hover:text-green-500">⚽</div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Football Agility</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Analyze change of direction, explosive jumping power, and lower body injury risk markers.</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Agility</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Power</span>
            </div>
          </div>

          {/* Basketball Card */}
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

      <Workouts />
      <Routines />
      <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6 items-stretch w-full'>
        <Calendar />
        <History />
      </div>

      {/* Dashboard Footer */}
      <div className='dashboardFooter'>
        <p>© 2026 FitVerse — Your AI Fitness Companion</p>
      </div>
    </>
  )
}

export default Main
