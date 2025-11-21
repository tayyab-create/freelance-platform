import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI, uploadAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiDollarSign, FiClock, FiBriefcase, FiUpload, FiFile, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitData, setSubmitData] = useState({
    description: '',
    links: '',
    uploadedFiles: [],
  });

  useEffect(() => {
    fetchAssignedJobs();
  }, []);

  const fetchAssignedJobs = async () => {
    try {
      const response = await workerAPI.getAssignedJobs();
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load assigned jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (job) => {
    setSelectedJob(job);
    setShowSubmitModal(true);
    setSubmitData({ description: '', links: '', uploadedFiles: [] });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadSingle(file, 'submissions'));
      const responses = await Promise.all(uploadPromises);
      
      const newFiles = responses.map(res => ({
        fileName: res.data.data.originalName,
        fileUrl: `http://localhost:5000${res.data.data.fileUrl}`,
        fileType: res.data.data.mimeType,
      }));

      setSubmitData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));

      toast.success('Files uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = (index) => {
    setSubmitData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitData.description || submitData.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      const links = submitData.links
        .split('\n')
        .map(link => link.trim())
        .filter(link => link);

      await workerAPI.submitWork(selectedJob._id, {
        description: submitData.description,
        links,
        files: submitData.uploadedFiles,
      });

      toast.success('Work submitted successfully!');
      setShowSubmitModal(false);
      fetchAssignedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assigned Jobs</h1>
          <p className="text-gray-600 mt-2">Jobs you're currently working on</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No assigned jobs yet</p>
            <Link to="/worker/jobs" className="btn-primary inline-block">
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="h-4 w-4" />
                        <span>${job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="h-4 w-4" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiBriefcase className="h-4 w-4" />
                        <span>Assigned: {new Date(job.assignedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {job.deadline && (
                      <p className="text-sm text-orange-600 mb-4">
                        ⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <span className="badge badge-warning">{job.status}</span>
                    {job.status === 'assigned' && (
                      <Button
                        variant="primary"
                        icon={FiUpload}
                        onClick={() => handleOpenSubmitModal(job)}
                      >
                        Submit Work
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Work Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Submit Your Work</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Work Description *</label>
                  <textarea
                    value={submitData.description}
                    onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                    placeholder="Describe what you've completed and any important details..."
                    rows="6"
                    required
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {submitData.description.length} / 20 characters minimum
                  </p>
                </div>

                <div>
                  <label className="label">Links (one per line)</label>
                  <textarea
                    value={submitData.links}
                    onChange={(e) => setSubmitData({ ...submitData, links: e.target.value })}
                    placeholder="https://github.com/yourrepo&#10;https://demo.yourproject.com"
                    rows="4"
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add links to your work (GitHub, live demo, drive, etc.)
                  </p>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="label">Upload Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="input-field"
                    disabled={uploadingFiles}
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload documents, images, or zip files (Max 5MB each)
                  </p>
                  {uploadingFiles && (
                    <p className="text-sm text-primary-600 mt-2">Uploading files...</p>
                  )}
                </div>

                {/* Uploaded Files List */}
                {submitData.uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="label">Uploaded Files ({submitData.uploadedFiles.length})</label>
                    {submitData.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FiFile className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    disabled={submitting || uploadingFiles}
                  >
                    Submit Work
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignedJobs;