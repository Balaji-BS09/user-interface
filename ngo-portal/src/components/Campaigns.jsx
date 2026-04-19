import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ngoAPI } from '../services/api';
import { Plus, DollarSign, Users, Calendar, Target, Eye, Pause, Play, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [ngoStatus, setNgoStatus] = useState(null);

  useEffect(() => {
    checkNGOStatus();
    fetchCampaigns();
  }, []);

  const checkNGOStatus = async () => {
    try {
      const response = await ngoAPI.getProfile();
      setNgoStatus(response.data.ngo?.status);
    } catch (error) {
      console.error('Failed to fetch NGO status');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await ngoAPI.getCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      await ngoAPI.updateCampaignStatus(campaignId, newStatus);
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to update campaign status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isVerified = ngoStatus === 'approved';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Campaigns</h1>
        {isVerified ? (
          <Link
            to="/campaigns/create"
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} />
            <span>Create Campaign</span>
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            title="Complete verification to create campaigns"
          >
            <Plus size={18} />
            <span>Create Campaign (Verification Required)</span>
          </button>
        )}
      </div>

      {!isVerified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-yellow-800 font-medium">Verification Required</p>
              <p className="text-yellow-600 text-sm mt-1">
                Complete your profile and submit documents to create campaigns.
                {ngoStatus === 'documents_submitted' && ' Your documents are currently under review.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Target className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No campaigns created yet</p>
          {isVerified && (
            <Link to="/campaigns/create" className="mt-4 inline-block text-green-600 hover:text-green-700">
              Create your first campaign →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{campaign.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Target size={14} className="mr-2" />
                    Category: {campaign.category}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Users size={14} className="mr-2" />
                    Type: {campaign.campaignType}
                  </p>
                  {campaign.monetary && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <DollarSign size={14} className="mr-2" />
                      Target: ₹{campaign.monetary.targetAmount?.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  
                  {campaign.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusUpdate(campaign._id, 'PAUSED')}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      <Pause size={16} />
                      <span>Pause</span>
                    </button>
                  )}
                  
                  {campaign.status === 'PAUSED' && (
                    <button
                      onClick={() => handleStatusUpdate(campaign._id, 'ACTIVE')}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Play size={16} />
                      <span>Resume</span>
                    </button>
                  )}
                  
                  {campaign.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusUpdate(campaign._id, 'COMPLETED')}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <CheckCircle size={16} />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
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
                <p className="text-gray-600 mt-1">{selectedCampaign.description}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Category</label>
                <p className="text-gray-600 mt-1">{selectedCampaign.category}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Campaign Type</label>
                <p className="text-gray-600 mt-1">{selectedCampaign.campaignType}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Duration</label>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedCampaign.startDate).toLocaleDateString()} - {new Date(selectedCampaign.endDate).toLocaleDateString()}
                </p>
              </div>
              
              {selectedCampaign.address && (
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
                  <p className="text-gray-600">Min Donation: ₹{selectedCampaign.monetary.minDonation}</p>
                </div>
              )}
              
              {selectedCampaign.volunteer && (
                <div>
                  <label className="font-medium text-gray-700">Volunteer Requirements</label>
                  <p className="text-gray-600 mt-1">Slots: {selectedCampaign.volunteer.slotsAvailable}</p>
                  <p className="text-gray-600">Skills: {selectedCampaign.volunteer.requiredSkills?.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;