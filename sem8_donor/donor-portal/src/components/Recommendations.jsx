import React, { useState, useEffect } from 'react';
import { donorAPI } from '../services/api';
import { Heart, Target, Calendar, MapPin, Users, DollarSign, TrendingUp, Filter, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await donorAPI.getRecommendations();
      console.log('Recommendations API Response:', response.data);
      
      // Handle different response structures
      let campaignsData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        // Check if each item has a campaign property (from similarity search)
        if (response.data.data.length > 0 && response.data.data[0].campaign) {
          // Extract campaign objects from the scored results
          campaignsData = response.data.data.map(item => ({
            ...item.campaign,
            semanticScore: item.semanticScore,
            categoryScore: item.categoryScore,
            locationScore: item.locationScore,
            distance: item.distance
          }));
        } else {
          // Direct campaign array
          campaignsData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        campaignsData = response.data;
      }
      
      console.log('Processed campaigns:', campaignsData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = async (campaign) => {
  try {
    console.log('Campaign clicked:', campaign);
    console.log('Campaign ID:', campaign._id);
    
    if (!campaign._id) {
      console.error('No campaign ID found');
      toast.error('Invalid campaign data');
      return;
    }
    
    // Try to log the click (non-blocking - don't show error to user if fails)
    try {
      await donorAPI.logClick(campaign._id);
      console.log('Click logged successfully');
    } catch (logError) {
      console.error('Failed to log click:', logError);
      // Don't show error to user, just log it
    }
    
    // Always show the campaign details even if logging fails
    setSelectedCampaign(campaign);
  } catch (error) {
    console.error('Error in handleCampaignClick:', error);
    // Still show the campaign details even if there's an error
    setSelectedCampaign(campaign);
  }
};

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    
    try {
      await donorAPI.donate(selectedCampaign._id, donationAmount);
      toast.success(`Thank you for donating ₹${donationAmount}!`);
      setShowDonateModal(false);
      setDonationAmount('');
      fetchRecommendations();
    } catch (error) {
      console.error('Failed to process donation:', error);
      toast.error('Failed to process donation');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.campaignType === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Recommended Campaigns</h1>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Campaigns</option>
            <option value="monetary">Monetary</option>
            <option value="volunteer">Volunteer</option>
            <option value="goods">Goods</option>
          </select>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Heart className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No recommendations available</p>
          <p className="text-sm text-gray-400 mt-2">Complete your profile to get personalized campaign recommendations</p>
          <a href="/profile" className="mt-4 inline-block text-red-600 hover:text-red-700">
            Update Profile →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <div key={campaign._id || index} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {campaign.image && (
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{campaign.title || 'Untitled Campaign'}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.campaignType === 'MONETARY' ? 'bg-green-100 text-green-800' :
                    campaign.campaignType === 'VOLUNTEER' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {campaign.campaignType || 'UNKNOWN'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description || 'No description available'}</p>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Target size={14} className="mr-2" />
                    Category: {campaign.category || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </p>
                  {campaign.address && campaign.address.city && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {campaign.address.city}, {campaign.address.state}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center">
                    <Users size={14} className="mr-2" />
                    NGO: {campaign.ngoId?.name || 'Organization'}
                  </p>
                  {campaign.monetary && campaign.monetary.targetAmount && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <DollarSign size={14} className="mr-2" />
                      Target: ₹{campaign.monetary.targetAmount?.toLocaleString()}
                    </p>
                  )}
                  {campaign.volunteer && campaign.volunteer.slotsAvailable && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Users size={14} className="mr-2" />
                      Slots Available: {campaign.volunteer.slotsAvailable}
                    </p>
                  )}
                  
                  {/* Show match scores if available */}
                  {campaign.semanticScore && (
                    <p className="text-xs text-gray-400 flex items-center mt-1">
                      <TrendingUp size={12} className="mr-1" />
                      Match Score: {Math.round(campaign.semanticScore * 100)}%
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCampaignClick(campaign)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    View Details
                  </button>
                  {campaign.campaignType === 'MONETARY' && (
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowDonateModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Donate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && !showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">{selectedCampaign.title}</h2>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="font-medium text-gray-700">Description</label>
                <p className="text-gray-600 mt-1">{selectedCampaign.description || 'No description available'}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">NGO</label>
                <p className="text-gray-600 mt-1">{selectedCampaign.ngoId?.name || 'Organization'}</p>
                <p className="text-sm text-gray-500">{selectedCampaign.ngoId?.email}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Category</label>
                <p className="text-gray-600 mt-1">{selectedCampaign.category || 'Uncategorized'}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Duration</label>
                <p className="text-gray-600 mt-1">
                  {formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}
                </p>
              </div>
              
              {selectedCampaign.address && selectedCampaign.address.city && (
                <div>
                  <label className="font-medium text-gray-700">Location</label>
                  <p className="text-gray-600 mt-1">
                    {selectedCampaign.address.city}, {selectedCampaign.address.state}, {selectedCampaign.address.country}
                  </p>
                </div>
              )}
              
              {selectedCampaign.monetary && (
                <div>
                  <label className="font-medium text-gray-700">Financial Goal</label>
                  <p className="text-gray-600 mt-1">Target: ₹{selectedCampaign.monetary.targetAmount?.toLocaleString()}</p>
                  {selectedCampaign.monetary.minDonation && (
                    <p className="text-gray-600">Min Donation: ₹{selectedCampaign.monetary.minDonation}</p>
                  )}
                </div>
              )}
              
              {selectedCampaign.volunteer && (
                <div>
                  <label className="font-medium text-gray-700">Volunteer Requirements</label>
                  <p className="text-gray-600 mt-1">Slots: {selectedCampaign.volunteer.slotsAvailable}</p>
                  {selectedCampaign.volunteer.requiredSkills && selectedCampaign.volunteer.requiredSkills.length > 0 && (
                    <p className="text-gray-600">Skills: {selectedCampaign.volunteer.requiredSkills.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonateModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h2>
              <p className="text-gray-600 mb-4">Support: {selectedCampaign.title}</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Amount (₹)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDonateModal(false);
                    setDonationAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;