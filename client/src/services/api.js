import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Request interceptor - Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // FIX: Check if data is FormData and strictly unset Content-Type
        if (config.data instanceof FormData) {
            // Setting this to undefined lets the browser generate the correct 
            // 'multipart/form-data; boundary=...' header automatically
            config.headers['Content-Type'] = undefined;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// Worker APIs
export const workerAPI = {
    getProfile: () => api.get('/workers/profile'),
    updateProfile: (data) => api.put('/workers/profile', data),
    addCertification: (data) => api.post('/workers/profile/certifications', data),
    updateCertification: (id, data) => api.put(`/workers/profile/certifications/${id}`, data),
    deleteCertification: (id) => api.delete(`/workers/profile/certifications/${id}`),
    addExperience: (data) => api.post('/workers/profile/experience', data),
    updateExperience: (id, data) => api.put(`/workers/profile/experience/${id}`, data),
    deleteExperience: (id) => api.delete(`/workers/profile/experience/${id}`),
    applyForJob: (jobId, data) => api.post(`/workers/apply/${jobId}`, data),
    getMyApplications: () => api.get('/workers/applications'),
    getAssignedJobs: () => api.get('/workers/jobs/assigned'),
    startJob: (jobId) => api.put(`/workers/jobs/${jobId}/start`),
    getAssignedJobById: (jobId) => api.get(`/workers/jobs/assigned/${jobId}`),
    submitWork: (jobId, data) => api.post(`/workers/submit/${jobId}`, data),
    getSubmission: (jobId) => api.get(`/workers/submission/${jobId}`),
    getDashboard: () => api.get('/workers/dashboard'),
    getMyReviews: () => api.get('/workers/reviews'),
    getJobReviews: (jobId) => api.get(`/workers/jobs/${jobId}/reviews`),
    // Saved Searches
    getSavedSearches: () => api.get('/workers/saved-searches'),
    createSavedSearch: (data) => api.post('/workers/saved-searches', data),
    updateSavedSearch: (id, data) => api.put(`/workers/saved-searches/${id}`, data),
    deleteSavedSearch: (id) => api.delete(`/workers/saved-searches/${id}`),
    getJobsForSavedSearch: (id) => api.get(`/workers/saved-searches/${id}/jobs`),
    reviewCompany: (companyId, data) => api.post(`/workers/review/${companyId}`, data),
};

// Add Review API
export const reviewAPI = {
    getWorkerReviews: (workerId) => api.get(`/public/workers/${workerId}/reviews`),
};

// Company APIs
export const companyAPI = {
    getProfile: () => api.get('/companies/profile'),
    updateProfile: (data) => api.put('/companies/profile', data),
    postJob: (data) => api.post('/companies/jobs', data),
    getMyJobs: () => api.get('/companies/jobs'),
    getJobApplications: (jobId) => api.get(`/companies/jobs/${jobId}/applications`),
    assignJob: (jobId, data) => api.put(`/companies/jobs/${jobId}/assign`, data),
    getSubmissions: () => api.get('/companies/submissions'),
    completeJob: (jobId) => api.put(`/companies/jobs/${jobId}/complete`),
    getSubmissionById: (submissionId) => api.get(`/companies/submissions/${submissionId}`),
    requestRevision: (jobId, data) => api.put(`/companies/jobs/${jobId}/revision`, data),
    reviewWorker: (workerId, data) => api.post(`/companies/review/${workerId}`, data),
    getDashboard: () => api.get('/companies/dashboard'),
    getMyReviews: () => api.get('/companies/reviews'),
};

// Job APIs
export const jobAPI = {
    getAllJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    getCategories: () => api.get('/jobs/meta/categories'),
};

// Admin APIs
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getPendingUsers: () => api.get('/admin/users/pending'),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    approveUser: (id) => api.put(`/admin/users/${id}/approve`),
    rejectUser: (id, reason) => api.put(`/admin/users/${id}/reject`, { reason }),
    toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
    getAllJobs: (params) => api.get('/admin/jobs', { params }),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
};


// Upload APIs
export const uploadAPI = {
    uploadSingle: async (file, type = 'general', onProgress = null) => {
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        };

        return api.post(`/upload/single?type=${type}`, formData, config);
    },

    uploadMultiple: async (files, type = 'general', onProgress = null) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const config = {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        };

        return api.post(`/upload/multiple?type=${type}`, formData, config);
    },

    deleteFile: (type, filename) => {
        return api.delete(`/upload/${type}/${filename}`);
    },
};

// Message APIs
export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getOrCreateConversation: (data) => api.post('/messages/conversations', data),
    getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
    sendMessage: (conversationId, data) => {
        const isFormData = data instanceof FormData;
        return api.post(`/messages/${conversationId}`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
    },
};

// Notification APIs
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    deleteAllRead: () => api.delete('/notifications/read'),
};

// Add notification API to the default export
api.notificationAPI = notificationAPI;

export default api;