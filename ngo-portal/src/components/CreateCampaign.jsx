import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ngoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, DollarSign, Users, Package, Target, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ngoStatus, setNgoStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [campaignType, setCampaignType] = useState('MONETARY');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    campaignType: 'MONETARY',
    startDate: '',
    endDate: '',
    address: {
      city: '',
      state: '',
      country: 'India',
      landmark: ''
    },
    monetary: {
      targetAmount: '',
      minDonation: ''
    },
    volunteer: {
      requiredSkills: '',
      slotsAvailable: ''
    }
  });

  const categories = [
    'Education', 'Healthcare', 'Environment', 'Disaster Relief',
    'Animal Welfare', 'Women Empowerment', 'Child Welfare', 'Other'
  ];

  useEffect(() => {
    checkNGOStatus();
  }, []);

  const checkNGOStatus = async () => {
    try {
      const response = await ngoAPI.getProfile();
      setProfile(response.data);
      setNgoStatus(response.data.ngo?.status);
    } catch (error) {
      toast.error('Failed to fetch NGO status');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final verification check before submission
    if (ngoStatus !== 'approved') {
      toast.error('Your NGO needs to be verified before creating campaigns');
      return;
    }
    
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        campaignType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      // Process skills array for volunteer campaigns
      if (campaignType === 'VOLUNTEER' && formData.volunteer.requiredSkills) {
        submitData.volunteer.requiredSkills = formData.volunteer.requiredSkills.split(',').map(s => s.trim());
      }

      await ngoAPI.createCampaign(submitData);
      toast.success('Campaign created successfully!');
      navigate('/campaigns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch(ngoStatus) {
      case 'registered':
        return {
          icon: <Clock className="text-yellow-600" size={24} />,
          title: 'Profile Created',
          message: 'Please complete your profile and submit documents for verification.',
          action: 'Complete Profile',
          link: '/profile',
          color: 'yellow'
        };
      case 'documents_submitted':
        return {
          icon: <AlertCircle className="text-blue-600" size={24} />,
          title: 'Documents Under Review',
          message: 'Your documents are being reviewed by the admin. You will be notified once verified.',
          action: 'Check Status',
          link: '/documents',
          color: 'blue'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="text-green-600" size={24} />,
          title: 'NGO Verified',
          message: 'Your NGO is verified! You can now create campaigns.',
          action: null,
          color: 'green'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="text-red-600" size={24} />,
          title: 'Verification Failed',
          message: 'Your documents were rejected. Please check the remarks and resubmit.',
          action: 'Resubmit Documents',
          link: '/documents',
          color: 'red'
        };
      default:
        return {
          icon: <AlertCircle className="text-gray-600" size={24} />,
          title: 'Verification Pending',
          message: 'Please complete your profile and submit documents for verification.',
          action: 'Complete Profile',
          link: '/profile',
          color: 'gray'
        };
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const status = getStatusMessage();
  const isVerified = ngoStatus === 'approved';

  if (!isVerified) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Campaign</h1>
        
        <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-lg p-8 text-center`}>
          <div className="flex flex-col items-center">
            {status.icon}
            <h2 className={`text-2xl font-semibold text-${status.color}-800 mt-4 mb-2`}>
              {status.title}
            </h2>
            <p className={`text-${status.color}-600 mb-6 max-w-md`}>
              {status.message}
            </p>
            {status.action && (
              <button
                onClick={() => navigate(status.link)}
                className={`px-6 py-2 bg-${status.color}-600 text-white rounded-lg hover:bg-${status.color}-700 transition`}
              >
                {status.action}
              </button>
            )}
          </div>
        </div>

        {/* Show additional info if documents are submitted */}
        {ngoStatus === 'documents_submitted' && profile?.docs?.submittedAt && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              Documents submitted on: {new Date(profile.docs.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please allow 2-3 business days for verification.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show campaign creation form only for verified NGOs
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter campaign title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Describe your campaign goals and impact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['MONETARY', 'VOLUNTEER', 'GOODS'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCampaignType(type)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      campaignType === type
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-700 hover:border-green-500'
                    }`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar size={20} className="mr-2" />
            Campaign Duration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin size={20} className="mr-2" />
            Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                name="address.landmark"
                value={formData.address.landmark}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {campaignType === 'MONETARY' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign size={20} className="mr-2" />
              Financial Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (₹) *
                </label>
                <input
                  type="number"
                  name="monetary.targetAmount"
                  value={formData.monetary.targetAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Donation (₹) *
                </label>
                <input
                  type="number"
                  name="monetary.minDonation"
                  value={formData.monetary.minDonation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
          </div>
        )}

        {campaignType === 'VOLUNTEER' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users size={20} className="mr-2" />
              Volunteer Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  name="volunteer.requiredSkills"
                  value={formData.volunteer.requiredSkills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., First Aid, Teaching, Fundraising"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slots Available *
                </label>
                <input
                  type="number"
                  name="volunteer.slotsAvailable"
                  value={formData.volunteer.slotsAvailable}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Number of volunteers needed"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;