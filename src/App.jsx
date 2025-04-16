import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TaskUpdate from './components/TaskUpdate';
import Login from './pages/Login'; 
import "./App.css"
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import React from 'react';

function App() {
  return (
    <Router>
      <Toaster /> {/* Place this outside of the Routes component */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />  
        <Route path="/update-task/:id" element={<TaskUpdate />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />  
      </Routes>
    </Router>
  );
}

export default App;
