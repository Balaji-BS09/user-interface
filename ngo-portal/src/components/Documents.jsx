import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../services/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({
    trustDeed: null,
    certificate80G: null,
    panCard: null,
    registrationCertificate: null,
    financialReport: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await ngoAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: acceptedFiles[0]
    }));
  };

  const DocumentDropzone = ({ fieldName, label, required }) => {
    const { getRootProps, getInputProps } = useDropzone({
      onDrop: (files) => onDrop(files, fieldName),
      accept: {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      },
      maxFiles: 1
    });

    const file = files[fieldName];
    const existingDoc = profile?.docs?.[fieldName];

    return (
      <div className="border rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto text-gray-400 mb-2" size={24} />
          {file ? (
            <p className="text-sm text-green-600">{file.name}</p>
          ) : existingDoc ? (
            <p className="text-sm text-blue-600">Document uploaded: {existingDoc.split('/').pop()}</p>
          ) : (
            <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check required documents
    if (!files.trustDeed && !profile?.docs?.trustDeed) {
      toast.error('Trust Deed is required');
      return;
    }
    if (!files.certificate80G && !profile?.docs?.certificate80G) {
      toast.error('80G Certificate is required');
      return;
    }
    if (!files.panCard && !profile?.docs?.panCard) {
      toast.error('PAN Card is required');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    });

    try {
      await ngoAPI.submitDocuments(formData);
      toast.success('Documents submitted successfully!');
      fetchProfile();
      setFiles({
        trustDeed: null,
        certificate80G: null,
        panCard: null,
        registrationCertificate: null,
        financialReport: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit documents');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const isSubmitted = profile?.docs?.isSubmitted;
  const status = profile?.ngo?.status;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Document Submission</h1>

      {isSubmitted && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-blue-800 font-medium">Documents Under Review</p>
              <p className="text-blue-600 text-sm mt-1">
                Your documents have been submitted and are being reviewed by the admin.
                You will be notified once verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-medium">Verification Complete</p>
              <p className="text-green-600 text-sm mt-1">
                Your NGO has been verified! You can now create campaigns.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Documents Rejected</p>
              <p className="text-red-600 text-sm mt-1">
                Your documents were rejected. Please check the remarks and resubmit.
                {profile?.docs?.remarks && (
                  <span className="block mt-1 font-medium">Remarks: {profile.docs.remarks}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isSubmitted && status !== 'approved' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentDropzone fieldName="trustDeed" label="Trust Deed / Registration Certificate" required />
              <DocumentDropzone fieldName="certificate80G" label="80G Tax Exemption Certificate" required />
              <DocumentDropzone fieldName="panCard" label="PAN Card" required />
              <DocumentDropzone fieldName="registrationCertificate" label="Registration Certificate (Optional)" required={false} />
              <DocumentDropzone fieldName="financialReport" label="Financial Report (Optional)" required={false} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <Upload size={18} />
              <span>{submitting ? 'Submitting...' : 'Submit Documents'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Documents;