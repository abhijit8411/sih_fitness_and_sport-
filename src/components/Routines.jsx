import Cards from './UtilityComponents/Cards'
import cardio from '../assets/routines/cardio.png'
import fatBurn from '../assets/routines/fatBurn.png'
import health from '../assets/routines/health.png'
import strength from '../assets/routines/strength.png'
import './UtilityComponents/Utility.css'

const Routines = () => {
    const data = [
        {
          label: "Cardio Training",
          url: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop"
        },
        {
          label: "Fat Burning",
          url: "https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=800&auto=format&fit=crop"
        },
        {
          label: "Strength Training",
          url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"
        },
        {
          label: "Mobility Flow",
          url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop"
        },
        {
          label: "Endurance Run",
          url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop"
        },
        {
          label: "Recovery Yoga",
          url: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=800&auto=format&fit=crop"
        }
      ];
  return (
    <div className='max-w-6xl mx-auto px-6 py-8 w-full'>
        <h2 className="text-3xl font-bold text-white mb-6">Explore More Routines</h2>
        <Cards data={data} />
    </div>
  )
}

export default Routines