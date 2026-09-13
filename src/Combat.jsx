import Calendar from './components/Calendar'
import Navbar from './components/Navbar'
import { ProfileComponent } from './components/ProfileComponent'
import Routines from './components/Routines'
import Workouts from './components/Workouts'
import History from './components/History'
import './index.css'

function Combat() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f15377]/10 border border-[#f15377]/30 text-[#f15377] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              ⚡ TRAINING ARENA
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#f15377] to-yellow-500 bg-clip-text text-transparent mb-4">
              AI Training Arena
            </h1>
            <p className="text-xl text-gray-400">
              Choose your mode. Analyze your body. Crush your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <a href="/fitness-dna" className="bg-gradient-to-br from-gray-900 to-black border border-[#f15377]/50 rounded-2xl p-6 hover:-translate-y-1 transition-transform group shadow-[0_0_15px_rgba(241,83,119,0.1)]">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧬</div>
              <h3 className="text-xl font-bold text-white mb-2">Fitness DNA</h3>
              <p className="text-gray-400 text-sm">Analyze your movement fingerprint with our AI camera engine.</p>
            </a>

            <a href="/movement-coach" className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#f15377] rounded-2xl p-6 hover:-translate-y-1 transition-transform group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">Movement Coach</h3>
              <p className="text-gray-400 text-sm">Get personalized micro-exercises to fix movement flaws.</p>
            </a>

            <a href="/quick-fit" className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#f15377] rounded-2xl p-6 hover:-translate-y-1 transition-transform group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Quick Fit</h3>
              <p className="text-gray-400 text-sm">Short on time? Generate a rapid session based on your weaknesses.</p>
            </a>

            <a href="/nutrition" className="bg-gradient-to-br from-gray-900 to-black border border-green-500/50 rounded-2xl p-6 hover:-translate-y-1 transition-transform group shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🥗</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Nutrition Hub</h3>
              <p className="text-gray-400 text-sm">Track meals, macros & hydration. Fuel your performance with expert-curated nutrition plans.</p>
            </a>

          </div>
        </div>
      </div>
    </>
  )
}

export default Combat
