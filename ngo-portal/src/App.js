import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Documents from './components/Documents';
import Campaigns from './components/Campaigns';
import CreateCampaign from './components/CreateCampaign';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import GoogleAuthSuccess from './components/GoogleAuthSuccess';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="documents" element={<Documents />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />   
        </Route>
      </Routes>
    </Router>
  );
}

export default App;