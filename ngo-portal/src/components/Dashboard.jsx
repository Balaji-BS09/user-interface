import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../services/api';
import { CheckCircle, Clock, AlertCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, campaignsRes] = await Promise.all([
        ngoAPI.getProfile(),
        ngoAPI.getCampaigns()
      ]);
      setProfile(profileRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Profile Status',
      value: profile?.profile?.isCompleted ? 'Completed' : 'Pending',
      icon: profile?.profile?.isCompleted ? CheckCircle : Clock,
      color: profile?.profile?.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
    },
    {
      title: 'Total Campaigns',
      value: campaigns.length,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter(c => c.status === 'ACTIVE').length,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Verification Status',
      value: profile?.ngo?.status?.toUpperCase() || 'PENDING',
      icon: AlertCircle,
      color: profile?.ngo?.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Campaigns</h2>
          </div>
          <div className="divide-y">
            {campaigns.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No campaigns created yet
              </div>
            ) : (
              campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{campaign.title}</p>
                      <p className="text-sm text-gray-500">{campaign.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            {!profile?.profile?.isCompleted && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Complete Your Profile</p>
                <p className="text-yellow-600 text-sm mt-1">Fill in your organization details to get verified</p>
                <a href="/profile" className="mt-2 inline-block text-yellow-700 text-sm font-medium">Update Profile →</a>
              </div>
            )}

            {profile?.profile?.isCompleted && profile?.ngo?.status !== 'approved' && !profile?.docs?.isSubmitted && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Submit Documents</p>
                <p className="text-blue-600 text-sm mt-1">Upload required documents for verification</p>
                <a href="/documents" className="mt-2 inline-block text-blue-700 text-sm font-medium">Submit Documents →</a>
              </div>
            )}

            {profile?.docs?.isSubmitted && profile?.ngo?.status !== 'approved' && (
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-orange-800 font-medium">Verification in Progress</p>
                <p className="text-orange-600 text-sm mt-1">Your documents are being reviewed by the admin</p>
                <p className="text-orange-600 text-xs mt-1">Campaign creation will be available after approval</p>
              </div>
            )}

            {profile?.ngo?.status === 'approved' && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800 font-medium">Create New Campaign</p>
                <p className="text-green-600 text-sm mt-1">Start a new fundraising or volunteer campaign</p>
                <a href="/campaigns/create" className="mt-2 inline-block text-green-700 text-sm font-medium">Create Campaign →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;