import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v2';
const GOOGLE_AUTH_URL = process.env.REACT_APP_GOOGLE_AUTH_URL || 'http://localhost:5001/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ngoToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ngoToken');
      localStorage.removeItem('ngoData');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const ngoAPI = {
  // Auth
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  
  // Google Auth - Using your working server
  googleAuth: (data) => axios.post(`${GOOGLE_AUTH_URL}/google/token`, data),
  
  // Profile
  createOrUpdateProfile: (data) => api.post('/create-profile', data),
  getProfile: () => api.post('/getngo-profile'),
  
  // Documents
  submitDocuments: (formData) => api.post('/submit-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Campaigns
  createCampaign: (data) => api.post('/create-campaign', data),
  updateCampaignStatus: (campaignId, status) => api.post(`/update-campaign-status/${campaignId}`, { status }),
  getCampaigns: () => api.get('/get-ngo-campaigns'),
};

export default api;