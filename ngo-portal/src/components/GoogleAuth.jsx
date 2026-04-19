import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ngoAPI } from '../services/api';

const GoogleAuth = ({ type = 'login' }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to your backend
      const response = await ngoAPI.googleAuth({
        token: credentialResponse.credential,
        type: type
      });
      
      const { token, ngo } = response.data;
      localStorage.setItem('ngoToken', token);
      localStorage.setItem('ngoData', JSON.stringify(ngo));
      toast.success(`${type === 'login' ? 'Login' : 'Registration'} successful!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google authentication failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          size="large"
          text={type === 'login' ? "signin_with" : "signup_with"}
          shape="rectangular"
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;