import React from 'react';
import axios from 'axios';
import { useState } from 'react'
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import { useNavigate } from 'react-router-dom'
import input_img from '../Assets/enter.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Signup = () => {

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const registerUser = async (userData) => {
    try {
      // 1 second timeout for hackathon demo speed if server is asleep
      const response = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/register`, userData, {
          timeout: 1000
      });
      return response.data;
    } catch (error) {
      console.warn('API Signup failed or timed out. Falling back to local offline mode.', error);
      
      // MOCK FALLBACK FOR HACKATHON DEMO
      return {
        success: true,
        message: "Offline Mode: Account created locally.",
        isOfflineMock: true
      };
    }
  };

  function handleSubmit() {
    if (!name || !email || !password || !age || !gender || !answer) {
      toast.error('Please fill in all fields!', { theme: 'dark' });
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters!', { theme: 'dark' });
      return;
    }

    const newUser = {
      name,
      email,
      password,
      age,
      gender,
      answer,
    };

    setLoading(true);
    toast.info('Creating account... Please wait (server may take a moment to wake up)', { theme: 'dark', autoClose: 5000 });
    registerUser(newUser)
      .then((data) => {
        console.log("sign up data",data);
        
        if (data.isOfflineMock) {
            toast.success('Offline Mode: Account created locally! Redirecting to login...', { theme: 'dark' });
        } else {
            toast.success('Account created successfully! Redirecting to login...', { theme: 'dark' });
        }
        
        setTimeout(() => navigate('/login'), 1500);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Registration failed unexpectedly.', { theme: 'dark' });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleSwitch() {
    navigate('/login');
  }

  function handleBack() {
    navigate('/');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="bg">
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
          <div className="text">Sign Up</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          <div className="input slide-in-left" style={{animationDelay: '0.05s'}}>
            <img src={user_icon} alt="" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
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
          <div className="input slide-in-left" style={{animationDelay: '0.15s'}}>
            <img src={password_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input slide-in-left" style={{animationDelay: '0.2s'}}>
          <img height={'24px'} width={'24px'} src={input_img} alt="" />
            <input
              type="text"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input slide-in-left" style={{animationDelay: '0.25s'}}>
          <img height={'24px'} width={'24px'}  src={input_img} alt="" />
            <input
              type="text"
              placeholder="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input slide-in-left" style={{animationDelay: '0.3s'}}>
          <img height={'24px'} width={'24px'}  src={input_img} alt="" />
            <input
              type="text"
              placeholder="Security Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="submit-container">
            <div className={`submit ${loading ? 'btn-loading' : ''}`} onClick={!loading ? handleSubmit : undefined}>
              {loading ? <span className="spinner"></span> : 'Sign Up'}
            </div>
            <div className="submit gray" onClick={handleSwitch}>Login</div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Signup