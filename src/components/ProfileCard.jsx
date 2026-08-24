import profileImg from '../assets/profile.png'
import arrow from '../assets/arrow.svg'
import arrowStartWorkout from '../assets/arrowStartWorkout.svg'
import dumbellImg3d from '../assets/dumbellImage3d.png'
import { useNavigate } from 'react-router-dom'

const ProfileCard = () => {
    const authData = localStorage.getItem('auth');
    const profile = authData ? JSON.parse(authData) : null;
    const navigate = useNavigate();

    function goToUpdateProfile() {
        navigate('/update-profile')
    }

    function startWorkout() {
        navigate('/train/bicepCurls')
    }

  return (
    <div className='profileCard'>

        <div className='profileInfo'>
            <div>
                <img src={profileImg} alt='profile-pic' className='profileCardImage'/>
            </div>
            <div className='profileCardText'>
                <div className='profileName'>
                    <span>{profile?.user?.name || "User"}</span>
                </div>
                <div className='profileUpdate'>
                    <span onClick={goToUpdateProfile}>Update Profile <img className='arrow' src={arrow} alt="arrow" /></span>
                </div>
            </div>
        </div>

        <div className='exerciseCard'>
            <div className='exerciseDiv'>
                <div className='exerciseCTA'>
                    <div className='gymDay'>
                        <span>Gym Day</span>
                    </div>
                    <button className='startWorkout' onClick={startWorkout}>
                        <span>start workout <img className='arrowStartWorkout' src={arrowStartWorkout} alt="start-workout-arrow" /></span>
                    </button>
                </div>
                
                <div>
                    <img src={dumbellImg3d} alt='Dumbell Img' className='dumbellImage3D' />
                </div>
            </div>
        </div>

    </div>
  )
}

export default ProfileCard