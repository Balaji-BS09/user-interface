import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { DollarSign, Calendar, Users, Ban, Building2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // Get all NGOs to access their campaigns
      const response = await adminAPI.getAllNGOs();
      const allNGOs = response.data.ngos || [];
      
      const allCampaigns = [];
      for (const ngo of allNGOs) {
        if (ngo.campaigns && ngo.campaigns.length > 0) {
          ngo.campaigns.forEach(campaign => {
            allCampaigns.push({
              ...campaign,
              ngoName: ngo.name,
              ngoId: ngo._id,
              ngoEmail: ngo.email
            });
          });
        }
      }
      setCampaigns(allCampaigns);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableCampaign = async (campaignId) => {
    try {
      const response = await adminAPI.disableCampaign(campaignId);
      toast.success(response.data.message || 'Campaign disabled successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable campaign');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (raised, goal) => {
    if (!raised || !goal) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Campaign Management</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Target className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No campaigns found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign.raisedAmount, campaign.goalAmount);
            const isActive = campaign.status === 'active' && campaign.isActive !== false;
            
            return (
              <div key={campaign._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {campaign.image && (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {campaign.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 size={14} className="mr-1" />
                        {campaign.ngoName}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign size={16} className="mr-1" />
                        Goal: ₹{campaign.goalAmount?.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-1" />
                        Raised: ₹{campaign.raisedAmount?.toLocaleString() || 0}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 col-span-2">
                        <Calendar size={16} className="mr-1" />
                        Ends: {formatDate(campaign.endDate)}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Ban size={16} />
                      <span>Disable Campaign</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disable Campaign Confirmation Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Disable Campaign
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to disable the campaign "{selectedCampaign.title}"?
                This action can be reversed later.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDisableCampaign(selectedCampaign._id);
                    setSelectedCampaign(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;