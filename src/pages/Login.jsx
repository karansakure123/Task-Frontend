// src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import React from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
  
      const token = res.data.token;
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  
      localStorage.setItem('token', token);
      localStorage.setItem('token_expiry', expiry.toString());
  
      console.log('✅ Token stored:', token);
      alert('Login successful');
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="login-input"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="login-input"
          required
        />
        <button type="submit" className="login-button">Login</button>

        <p className="login-text">
          New user? <Link to="/register" className="login-link">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
