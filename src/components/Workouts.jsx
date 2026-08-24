import Cards from './UtilityComponents/Cards'
import situps from '../assets/workouts/situps.png'
import lunges from '../assets/workouts/lunges.png'
import crunches from '../assets/workouts/crunches.png'
import pushups from '../assets/workouts/pushups.png'

const Workouts = () => {
    const data = [
        {
          label: "Bicep Curls",
          url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
          link: '/train/bicepCurls'
        },
        {
          label: "Push Ups",
          url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
          link: '/main'
        },
        {
          label: "Lunges",
          url: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=800&auto=format&fit=crop",
          link: '/main'
        },
        {
          label: "Sit Ups",
          url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
          link: '/main'
        },
        {
            label: "Crunches",
            url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
            link: '/main'
        },
        {
            label: "HIIT Session",
            url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
            link: '/main'
        }
      ];
  return (
    <div className='max-w-6xl mx-auto px-6 py-8 w-full'>
        <h2 className="text-3xl font-bold text-white mb-6">Explore More Workouts</h2>
        <Cards data={data} />
    </div>
  )
}

export default Workouts