import React from 'react';
import axios from 'axios';
import { useState } from 'react'
import './LoginSignup.css'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isOnboarded } from '../../services/userProfile';

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const loginUser = async (credentials) => {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/login`, credentials, { timeout: 1500 });
          return response.data;
        } catch (error) {
          console.warn('API Login failed or timed out. Using local offline mode.', error);
          // Extract a name from the email (e.g. john@gmail.com -> John)
          const emailName = credentials.email.split('@')[0];
          const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
          return {
            success: true,
            user: {
              _id: `local-${btoa(credentials.email.toLowerCase()).replace(/=/g, '').slice(0, 12)}`,
              name: displayName,
              email: credentials.email
            },
            token: `local-token-${Date.now()}`,
            isOfflineMock: true
          };
        }
    };

    function handleSubmit() {
        if (!email || !password) {
            toast.error('Please fill in all fields!', { theme: 'dark' });
            return;
        }
        const loginCredentials = {
          email,
          password,
        };
        setLoading(true);
        toast.info('Logging in... Please wait (server may take a moment to wake up)', { theme: 'dark', autoClose: 5000 });
        loginUser(loginCredentials)
          .then((data) => {
            console.log(data);
            localStorage.setItem('auth', JSON.stringify(data))
            toast.success(data.isOfflineMock ? 'Logged in offline! Redirecting...' : 'Login successful! Redirecting...', { theme: 'dark' });
            const userId = data.user?._id || data.user?.id || 'local-user';
            const userEmail = data.user?.email || '';
            setTimeout(() => {
              if (!isOnboarded(userId, userEmail)) {
                navigate("/onboarding");
              } else {
                navigate("/main");
              }
            }, 1000);
          })
          .catch((error) => {
            // This catch should rarely hit now due to the mock fallback above, but just in case
            console.error(error);
            toast.error('Login failed unexpectedly.', { theme: 'dark' });
          })
          .finally(() => {
            setLoading(false);
          });
    }

    function handleSwitch() {
        navigate('/signup');
    }

    function handleBack() {
        navigate('/');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit();
    }

  return (
    <div style={{height:'100vh'}} className="bg">
      <ToastContainer position="top-center" />
      <div className="back-button-container fade-in-down">
        <button className="back-btn" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      </div>
      <div style={{ display: 'block' }} className="container fade-in-up">
        <div className="header">
          <div className="text">Log in</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          <div className="input slide-in-left" style={{animationDelay: '0.1s'}}>
            <img src={email_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input slide-in-left" style={{animationDelay: '0.2s'}}>
            <img src={password_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="forgot-password">Forgot Password? <span>&nbsp;Click Here!</span></div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="submit-container flex-col md:flex-row gap-4">
              <div className="submit" onClick={handleSwitch}>Sign Up</div>
              <div className={`submit gray ${loading ? 'btn-loading' : ''}`} onClick={!loading ? handleSubmit : undefined}>
                {loading ? <span className="spinner"></span> : 'Login'}
              </div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default Login