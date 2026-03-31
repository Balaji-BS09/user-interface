import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, CheckCircle, XCircle, TrendingUp, Clock, Building2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNGOs: 0,
    approvedNGOs: 0,
    pendingNGOs: 0,
    rejectedNGOs: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReports: 0
  });
  const [recentNGOs, setRecentNGOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [all, approved, pending, rejected, reports] = await Promise.all([
        adminAPI.getAllNGOs(),
        adminAPI.getApprovedNGOs(),
        adminAPI.getPendingNGOs(),
        adminAPI.getRejectedNGOs(),
        adminAPI.getReports()
      ]);

      const allNGOs = all.data.ngos || [];
      const approvedNGOs = approved.data.ngos || [];
      const pendingNGOsData = pending.data.ngos || [];
      const rejectedNGOsData = rejected.data.ngos || [];
      const reportsData = reports.data.reports || [];

      // Calculate campaign stats
      let totalCampaigns = 0;
      let activeCampaigns = 0;
      
      allNGOs.forEach(ngo => {
        if (ngo.campaigns && ngo.campaigns.length) {
          totalCampaigns += ngo.campaigns.length;
          activeCampaigns += ngo.campaigns.filter(c => c.status === 'active' && c.isActive !== false).length;
        }
      });

      setStats({
        totalNGOs: allNGOs.length,
        approvedNGOs: approvedNGOs.length,
        pendingNGOs: pendingNGOsData.length,
        rejectedNGOs: rejectedNGOsData.length,
        totalCampaigns,
        activeCampaigns,
        totalReports: reportsData.length
      });

      // Get recent NGOs (last 5)
      const recent = [...allNGOs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentNGOs(recent);
      
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total NGOs',
      value: stats.totalNGOs,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Approved',
      value: stats.approvedNGOs,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Pending',
      value: stats.pendingNGOs,
      icon: Clock,
      color: 'bg-yellow-500',
      change: stats.pendingNGOs > 0 ? 'Needs attention' : 'All clear',
    },
    {
      title: 'Rejected',
      value: stats.rejectedNGOs,
      icon: XCircle,
      color: 'bg-red-500',
      change: '-',
    },
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: `${stats.activeCampaigns} active`,
    },
    {
      title: 'Reports',
      value: stats.totalReports,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: stats.totalReports > 0 ? 'Requires review' : 'No reports',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{card.change}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent NGOs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recently Registered NGOs</h2>
          </div>
          <div className="divide-y">
            {recentNGOs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No NGOs registered yet
              </div>
            ) : (
              recentNGOs.map((ngo) => (
                <div key={ngo._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{ngo.name}</p>
                      <p className="text-sm text-gray-500">{ngo.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ngo.status === 'approved' ? 'bg-green-100 text-green-800' :
                      ngo.status === 'documents_submitted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ngo.status === 'documents_submitted' ? 'PENDING' : ngo.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ngo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.pendingNGOs > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Pending Approvals</p>
                  <p className="text-sm text-yellow-600">
                    {stats.pendingNGOs} NGO(s) waiting for verification
                  </p>
                </div>
                <a
                  href="/ngos"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition"
                >
                  Review Now
                </a>
              </div>
            )}
            
            {stats.totalReports > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">New Reports</p>
                  <p className="text-sm text-orange-600">
                    {stats.totalReports} user report(s) to review
                  </p>
                </div>
                <a
                  href="/reports"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition"
                >
                  View Reports
                </a>
              </div>
            )}

            {stats.activeCampaigns > 0 && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Active Campaigns</p>
                  <p className="text-sm text-green-600">
                    {stats.activeCampaigns} campaign(s) currently running
                  </p>
                </div>
                <a
                  href="/campaigns"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
                >
                  Manage Campaigns
                </a>
              </div>
            )}

            {stats.pendingNGOs === 0 && stats.totalReports === 0 && stats.activeCampaigns === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No pending actions. Everything looks good!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;