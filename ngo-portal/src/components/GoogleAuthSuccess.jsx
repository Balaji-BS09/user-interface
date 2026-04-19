import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }
    
    if (token) {
      localStorage.setItem('ngoToken', token);
      
      // Decode token to get user info (optional)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        localStorage.setItem('ngoData', JSON.stringify({
          id: decoded.id,
          role: decoded.role,
          status: decoded.status
        }));
      } catch (e) {
        console.error('Failed to decode token', e);
      }
      
      toast.success('Google login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating with Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;