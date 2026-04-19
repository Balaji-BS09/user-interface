import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('donorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.response?.config?.url,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('donorToken');
      localStorage.removeItem('donorData');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const donorAPI = {
  // Auth
  register: (data) => api.post('/donor-register', data),
  login: (data) => api.post('/donor-login', data),
  
  // Profile - Token is automatically added by interceptor
  createOrUpdateProfile: (data) => api.post('/profile', data),
  getUser: () => api.post('/donor-user'), // No token in body needed
  updateProfilePicture: (formData) => {
    return api.post('/donor-profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
 // Campaigns & Interactions
getRecommendations: () => api.post('/donor-recommendations'),
logClick: (campaignId) => {
  console.log('Logging click for campaign:', campaignId);
  // Make sure campaignId is sent correctly
  return api.post('/click', { campaignId });
},
donate: (campaignId, amount) => {
  console.log('Processing donation:', { campaignId, amount });
  return api.put('/donate', { campaignId, amount });
},
};

export default api;