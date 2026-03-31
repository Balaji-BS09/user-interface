import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { CheckCircle, XCircle, Eye, Mail, Phone, MapPin, FileText, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NGOs = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(null);

  useEffect(() => {
    fetchNGOs();
  }, [activeTab]);

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'pending':
          response = await adminAPI.getPendingNGOs();
          break;
        case 'approved':
          response = await adminAPI.getApprovedNGOs();
          break;
        case 'rejected':
          response = await adminAPI.getRejectedNGOs();
          break;
        default:
          response = await adminAPI.getAllNGOs();
      }
      setNgos(response.data.ngos || response.data.ngos || []);
    } catch (error) {
      toast.error('Failed to fetch NGOs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ngoId) => {
    try {
      const response = await adminAPI.verifyNGO(ngoId);
      toast.success(response.data.message || 'NGO verified successfully');
      fetchNGOs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify NGO');
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please provide remarks for rejection');
      return;
    }
    try {
      const response = await adminAPI.rejectNGO(selectedNGO._id, remarks);
      toast.success(response.data.message || 'NGO rejected');
      setShowRejectModal(false);
      setRemarks('');
      fetchNGOs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject NGO');
    }
  };

  const viewDocuments = (ngo) => {
    setSelectedNGO(ngo);
    setSelectedDocuments(ngo.documents);
    setShowDocumentModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'documents_submitted': { label: 'PENDING', color: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'APPROVED', color: 'bg-green-100 text-green-800' },
      'rejected': { label: 'REJECTED', color: 'bg-red-100 text-red-800' },
      'pending': { label: 'PENDING', color: 'bg-yellow-100 text-yellow-800' },
    };
    const config = statusConfig[status] || { label: status.toUpperCase(), color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">NGO Management</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['pending', 'approved', 'rejected', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({ngos.length})
            </button>
          ))}
        </nav>
      </div>

      {/* NGOs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : ngos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No NGOs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ngos.map((ngo) => (
            <div key={ngo._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {ngo.name}
                    </h3>
                    {getStatusBadge(ngo.status)}
                    {ngo.verifiedByAdmin && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Mail size={16} className="mr-2" />
                      {ngo.email}
                    </p>
                    <p className="flex items-center">
                      <Phone size={16} className="mr-2" />
                      {ngo.phone || 'Not provided'}
                    </p>
                    {ngo.address && (
                      <p className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {ngo.address}
                      </p>
                    )}
                  </div>
                  
                  {ngo.description && (
                    <p className="mt-3 text-gray-600 text-sm">
                      {ngo.description}
                    </p>
                  )}

                  {ngo.approvedAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      Approved on: {new Date(ngo.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {ngo.documents && (
                    <button
                      onClick={() => viewDocuments(ngo)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="View Documents"
                    >
                      <FileText size={20} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedNGO(ngo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  
                  {ngo.status === 'documents_submitted' && (
                    <>
                      <button
                        onClick={() => handleVerify(ngo._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNGO(ngo);
                          setShowRejectModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View NGO Modal */}
      {selectedNGO && !showRejectModal && !showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedNGO.name}</h2>
                <button
                  onClick={() => setSelectedNGO(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-700">Email</label>
                  <p className="text-gray-600">{selectedNGO.email}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Phone</label>
                  <p className="text-gray-600">{selectedNGO.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Address</label>
                  <p className="text-gray-600">{selectedNGO.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Description</label>
                  <p className="text-gray-600">{selectedNGO.description || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Status</label>
                  <p className="text-gray-600 capitalize">{selectedNGO.status}</p>
                </div>
                {selectedNGO.verifiedByAdmin && (
                  <div>
                    <label className="font-medium text-gray-700">Approved At</label>
                    <p className="text-gray-600">
                      {new Date(selectedNGO.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedNGO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Reject NGO: {selectedNGO.name}
              </h2>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Please provide remarks for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows="4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRemarks('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentModal && selectedDocuments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Documents - {selectedNGO?.name}
                </h2>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocuments(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDocuments.registrationCertificate && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Registration Certificate</h3>
                    <a
                      href={selectedDocuments.registrationCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {selectedDocuments.panCard && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">PAN Card</h3>
                    <a
                      href={selectedDocuments.panCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {selectedDocuments.taxExemptionCertificate && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Tax Exemption Certificate</h3>
                    <a
                      href={selectedDocuments.taxExemptionCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {selectedDocuments.bankStatement && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Bank Statement</h3>
                    <a
                      href={selectedDocuments.bankStatement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}
              </div>

              {selectedDocuments.remarks && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Remarks</h3>
                  <p className="text-gray-600">{selectedDocuments.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOs;