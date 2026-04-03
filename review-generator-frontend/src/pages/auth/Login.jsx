import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!validateEmail) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (password.length === 0) {
        setError('Password is required.');
        setLoading(false);
        return;
      }

      const userData = await login(email, password);
      if (userData.role === 'CLIENT') {
        navigate('/client/home');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg-animation"></div>
      
      {/* Floating Particles */}
      <div className="login-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="login-particle"></div>
        ))}
      </div>

      {/* Login Container */}
      <div className="login-container">
        <div className="login-card" ref={cardRef}>
          {/* Header */}
          <div className="login-card-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-alert login-alert-danger">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="login-form-group">
              <div className="login-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-form-control"
                  placeholder="Enter your email"
                  required
                />
                <i className="fas fa-envelope login-input-icon"></i>
              </div>
            </div>

            {/* Password Input */}
            <div className="login-form-group">
              <div className="login-input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-form-control"
                  placeholder="Enter your password"
                  required
                />
                <i className="fas fa-lock login-input-icon"></i>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`login-btn ${loading ? 'loading' : ''}`}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;