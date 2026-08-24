import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../index.css'
import profile from '../assets/profile.png'

export const Profile = () => {
    const authData = localStorage.getItem('auth');
    const currentUser = authData ? JSON.parse(authData) : null;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    // If not logged in, redirect to login
    if (!currentUser || !currentUser.user) {
        return (
            <div className='profileContainerOuter'>
                <div className='profileContainer'>
                    <h2 className='profileHeading'>Not Logged In</h2>
                    <p style={{fontSize: '1.2rem', margin: '1rem 0'}}>Please login to view your profile.</p>
                    <button onClick={() => navigate('/login')} className='headToHome'>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    function handleLogout(e) {
        try {
            setLoading(true);
            localStorage.removeItem('auth');
            console.log("logged out")
            navigate("/login");
        } catch(error) {
            setError('unable to log out')
        }
    }

    function handleHome() {
      navigate("/main");
    }

    return (
     <div className='profileContainerOuter'>
        <div className='profileContainer'>
        
            <div>
                <h2 className='profileHeading'>Profile</h2>
            </div>

            <div>
                <img src={profile} alt='profile-image' className='profileImg' />
            </div>

           <div className='profileText'>

                <div className='profileEmail'>
                    <strong>Name:</strong> {currentUser.user.name || "N/A"}
                </div>

                <div className='profileEmail'>
                    <strong>Email:</strong> {currentUser.user.email || "N/A"}
                </div>

                <div className='profileEmail'>
                    <strong>Age:</strong> {currentUser.user.age || "N/A"}
                </div>

                <div className='profileEmail'>
                    <strong>Gender:</strong> {currentUser.user.gender || "N/A"}
                </div>

                <div>
                    {error && <p className='errorProfile'>{error}</p>}
                </div>

                <Link className='updateProfileButton' to="/update-profile">
                        Update Profile
                </Link>

                <div>
                    <button onClick={handleLogout} className='profilePageLogOut'>
                    Log Out
                    </button>
                </div>
                <div>
                    <button onClick={handleHome} className='headToHome'>
                    Go back to Home
                    </button>
                </div>
        </div>
           </div>
    </div>
    )
}
