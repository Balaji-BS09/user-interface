import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Mail, Phone, MapPin, FileText, Download, Building2, Globe, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const NGOs = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  
  // Separate state for counts
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0
  });

  const fetchCounts = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
        adminAPI.getPendingNGOs(),
        adminAPI.getApprovedNGOs(),
        adminAPI.getRejectedNGOs(),
        adminAPI.getAllNGOs()
      ]);
      
      setCounts({
        pending: pendingRes.data.ngos?.length || 0,
        approved: approvedRes.data.ngos?.length || 0,
        rejected: rejectedRes.data.ngos?.length || 0,
        all: allRes.data.ngos?.length || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);

  const fetchNGOs = useCallback(async () => {
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
        case 'all':
          response = await adminAPI.getAllNGOs();
          break;
        default:
          response = await adminAPI.getAllNGOs();
      }
      
      // Handle different response structures
      let ngosData = [];
      if (response.data.ngos) {
        ngosData = response.data.ngos;
      } else if (Array.isArray(response.data)) {
        ngosData = response.data;
      } else {
        ngosData = [];
      }
      
      setNgos(ngosData);
    } catch (error) {
      toast.error('Failed to fetch NGOs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCounts();
    fetchNGOs();
  }, [fetchCounts, fetchNGOs]);

  const handleVerify = async (ngoId) => {
    try {
      const response = await adminAPI.verifyNGO(ngoId);
      toast.success(response.data.message || 'NGO verified successfully');
      await fetchCounts();
      await fetchNGOs();
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
      await fetchCounts();
      await fetchNGOs();
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
      'documents_submitted': { label: 'PENDING REVIEW', color: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'APPROVED', color: 'bg-green-100 text-green-800' },
      'rejected': { label: 'REJECTED', color: 'bg-red-100 text-red-800' },
      'registered': { label: 'REGISTERED', color: 'bg-blue-100 text-blue-800' },
    };
    const config = statusConfig[status] || { label: status?.toUpperCase() || 'UNKNOWN', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
    { id: 'all', label: 'All', count: counts.all }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">NGO Management</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
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
          <Building2 className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No {activeTab} NGOs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ngos.map((ngo) => (
            <div key={ngo._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {ngo.name}
                    </h3>
                    {getStatusBadge(ngo.status)}
                    {ngo.verifiedByAdmin && ngo.status === 'approved' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                    <p className="flex items-center">
                      <Mail size={16} className="mr-2" />
                      {ngo.email}
                    </p>
                    <p className="flex items-center">
                      <Phone size={16} className="mr-2" />
                      {ngo.phone || 'Not provided'}
                    </p>
                    {ngo.website && (
                      <p className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {ngo.website}
                        </a>
                      </p>
                    )}
                    <p className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Registered: {new Date(ngo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {ngo.address && (
                    <p className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin size={16} className="mr-2" />
                      {ngo.address}
                    </p>
                  )}
                  
                  {ngo.description && (
                    <p className="mt-2 text-gray-600 text-sm">
                      <strong>Description:</strong> {ngo.description}
                    </p>
                  )}

                  {ngo.approvedAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      Approved on: {new Date(ngo.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {ngo.documents && ngo.documents.isSubmitted && (
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

      {/* View NGO Modal with Complete Details */}
      {selectedNGO && !showRejectModal && !showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">{selectedNGO.name}</h2>
              <button
                onClick={() => setSelectedNGO(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Building2 size={20} className="mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Organization Name</label>
                    <p className="text-gray-600 mt-1">{selectedNGO.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Email</label>
                    <p className="text-gray-600 mt-1">{selectedNGO.email}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Phone</label>
                    <p className="text-gray-600 mt-1">{selectedNGO.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Website</label>
                    <p className="text-gray-600 mt-1">
                      {selectedNGO.website ? (
                        <a href={selectedNGO.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedNGO.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Registration Date</label>
                    <p className="text-gray-600 mt-1">{new Date(selectedNGO.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 block text-sm">Status</label>
                    <p className="text-gray-600 mt-1 capitalize">{selectedNGO.status}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedNGO.address && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin size={20} className="mr-2" />
                    Address
                  </h3>
                  <p className="text-gray-600">{selectedNGO.address}</p>
                </div>
              )}

              {/* Description */}
              {selectedNGO.description && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedNGO.description}</p>
                </div>
              )}

              {/* Mission & Vision */}
              {(selectedNGO.mission || selectedNGO.vision) && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mission & Vision</h3>
                  {selectedNGO.mission && (
                    <div className="mb-3">
                      <label className="font-medium text-gray-700 block text-sm">Mission</label>
                      <p className="text-gray-600 mt-1">{selectedNGO.mission}</p>
                    </div>
                  )}
                  {selectedNGO.vision && (
                    <div>
                      <label className="font-medium text-gray-700 block text-sm">Vision</label>
                      <p className="text-gray-600 mt-1">{selectedNGO.vision}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Status */}
              {selectedNGO.documents && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText size={20} className="mr-2" />
                    Document Status
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {selectedNGO.documents.isSubmitted ? 'Yes' : 'No'}
                    </p>
                    {selectedNGO.documents.submittedAt && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Submitted on:</strong> {new Date(selectedNGO.documents.submittedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedNGO.documents.remarks && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Remarks:</strong> {selectedNGO.documents.remarks}
                      </p>
                    )}
                    {selectedNGO.documents.isSubmitted && (
                      <button
                        onClick={() => viewDocuments(selectedNGO)}
                        className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <FileText size={14} className="mr-1" />
                        View All Documents
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal with All Uploaded Files */}
      {showDocumentModal && selectedDocuments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">
                Submitted Documents - {selectedNGO?.name}
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

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trust Deed */}
                {selectedDocuments.trustDeed && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-700 mb-2">Trust Deed / Registration Certificate</h3>
                    <a
                      href={`http://localhost:5000/${selectedDocuments.trustDeed}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {/* 80G Certificate */}
                {selectedDocuments.certificate80G && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-700 mb-2">80G Tax Exemption Certificate</h3>
                    <a
                      href={`http://localhost:5000/${selectedDocuments.certificate80G}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {/* PAN Card */}
                {selectedDocuments.panCard && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-700 mb-2">PAN Card</h3>
                    <a
                      href={`http://localhost:5000/${selectedDocuments.panCard}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {/* Registration Certificate */}
                {selectedDocuments.registrationCertificate && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-700 mb-2">Registration Certificate</h3>
                    <a
                      href={`http://localhost:5000/${selectedDocuments.registrationCertificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} className="mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {/* Financial Report */}
                {selectedDocuments.financialReport && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-700 mb-2">Financial Report</h3>
                    <a
                      href={`http://localhost:5000/${selectedDocuments.financialReport}`}
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

              {!selectedDocuments.trustDeed && !selectedDocuments.certificate80G && !selectedDocuments.panCard && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-2" size={48} />
                  <p>No documents have been uploaded yet</p>
                </div>
              )}

              {selectedDocuments.remarks && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">Admin Remarks</h3>
                  <p className="text-yellow-700">{selectedDocuments.remarks}</p>
                </div>
              )}
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
    </div>
  );
};

export default NGOs;