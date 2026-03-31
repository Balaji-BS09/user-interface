import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bootstrapKey: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Signup
        if (!formData.bootstrapKey) {
          toast.error('Bootstrap key is required');
          setLoading(false);
          return;
        }
        await adminAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bootstrapKey: formData.bootstrapKey,
        });
        toast.success('Admin account created! Please login.');
        setIsSignup(false);
        setFormData({ ...formData, name: '', password: '', bootstrapKey: '' });
      } else {
        // Login
        const response = await adminAPI.login({
          email: formData.email,
          password: formData.password,
        });
        const { token, admin } = response.data;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-600 mt-2">
            {isSignup ? 'Create new admin account' : 'Login to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bootstrap Key
              </label>
              <input
                type="password"
                name="bootstrapKey"
                value={formData.bootstrapKey}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter bootstrap key"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;