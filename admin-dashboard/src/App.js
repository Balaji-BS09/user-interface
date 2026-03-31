import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NGOs from './components/NGOs';
import Campaigns from './components/Campaigns';
import Reports from './components/Reports';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ngos" element={<NGOs />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;