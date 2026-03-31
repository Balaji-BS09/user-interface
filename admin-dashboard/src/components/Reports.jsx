import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Download, AlertTriangle, Flag, User, Calendar, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReports();
      setReports(response.data.reports || []);
    } catch (error) {
      toast.error('Failed to fetch reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!reports.length) return;
    
    const dataStr = JSON.stringify(reports, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `reports_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Reports exported successfully');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100'}`}>
        {status?.toUpperCase() || 'PENDING'}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      spam: 'bg-red-100 text-red-800',
      inappropriate: 'bg-orange-100 text-orange-800',
      fraud: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[type] || 'bg-gray-100'}`}>
        {type?.toUpperCase() || 'OTHER'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Reports</h1>
        <button
          onClick={exportData}
          disabled={reports.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Download size={18} />
          <span>Export Reports</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Flag className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Report #{report._id.slice(-6)}
                    </h3>
                    {getTypeBadge(report.type)}
                    {getStatusBadge(report.status)}
                  </div>
                  <button
                    onClick={() => setSelectedReport(selectedReport === report ? null : report)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {selectedReport === report ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-2" />
                    Reported by: {report.reporterId?.name || 'Unknown'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Flag size={16} className="mr-2" />
                    Campaign: {report.campaignId?.title || 'Unknown'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-start text-sm text-gray-600">
                  <MessageSquare size={16} className="mr-2 mt-0.5" />
                  <p>{report.description}</p>
                </div>

                {selectedReport === report && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-700 mb-2">Additional Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Reporter Email:</strong> {report.reporterId?.email || 'N/A'}</p>
                      <p><strong>Campaign NGO:</strong> {report.campaignId?.ngoId?.name || 'N/A'}</p>
                      <p><strong>Report ID:</strong> {report._id}</p>
                      <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                      {report.updatedAt !== report.createdAt && (
                        <p><strong>Last Updated:</strong> {new Date(report.updatedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;