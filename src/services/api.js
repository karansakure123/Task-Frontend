// src/services/api.js
import axios from 'axios';

const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Adjust if different
  headers: {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  },
});

export default api;
