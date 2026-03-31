import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Admin Auth - Matches your routes
  signup: (data) => api.post('/admin/signup', data),           // POST /api/admin/signup
  login: (data) => api.post('/admin/login', data),             // POST /api/admin/login
  
  // NGOs - Matches your routes exactly
  getPendingNGOs: () => api.get('/ngos/pending'),              // GET /api/ngos/pending
  getApprovedNGOs: () => api.get('/ngos/approved'),            // GET /api/ngos/approved
  getRejectedNGOs: () => api.get('/ngos/rejected'),            // GET /api/ngos/rejected
  getAllNGOs: () => api.get('/ngos/all'),                      // GET /api/ngos/all
  verifyNGO: (ngoId) => api.patch(`/ngos/verify/${ngoId}`),    // PATCH /api/ngos/verify/:ngoId
  rejectNGO: (ngoId, remarks) => api.post(`/ngos/reject/${ngoId}`, { remarks }), // POST /api/ngos/reject/:ngoId
  
  // Campaigns - Matches your route
  disableCampaign: (campaignId) => api.put(`/campaigns/disable/${campaignId}`), // PUT /api/campaigns/disable/:campaignId
  
  // Reports - Matches your route
  getReports: () => api.get('/admin/reports'),                 // GET /api/admin/reports
};

export default api;