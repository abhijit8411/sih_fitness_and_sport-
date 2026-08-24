import logo from '../assets/dumbell.svg'
import notificationBell from '../assets/notificationBell.svg'
import profile from '../assets/profile.png'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


const Navbar = () => {
    const [arena, setArena] = useState(true);
    const navigate = useNavigate();

    function switchArena() {
        setArena(prev => !prev)
        navigate(arena ? "/combat" : "/main");
    }

    function goToHome() {
        navigate("/main");
    }

    function handleLogout() {
        localStorage.removeItem('auth');
        navigate('/login');
    }

  return (
    <>
        <div className='navbar'>
            <div className='nav-logo' onClick={goToHome}>
                <div>
                    <img src={logo} alt='logo' className='logo'/>
                </div>
                <a href="/">
                <span>FitVerse</span>

                </a>
            </div>
            
            <div className='nav-options'>
                <div className='nav-button' onClick={switchArena}>
                   {arena ? "Training Arena" : "Combat Arena"}
                </div>
                <div className='nav-button nav-logout' onClick={handleLogout}>
                    Logout
                </div>
                <div>
                    <img src={notificationBell} alt='notification-bell' className='notificationBell' />
                </div>
                <div onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>
                    <img src={profile} alt='profile-pic' className='profile' />
                </div>
            </div>
        </div>
    </>
  )
}

export default Navbar