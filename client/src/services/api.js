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
    submitWork: (jobId, data) => api.post(`/workers/submit/${jobId}`, data),
    getSubmission: (jobId) => api.get(`/workers/submission/${jobId}`),
    getDashboard: () => api.get('/workers/dashboard'),
    getMyReviews: () => api.get('/workers/reviews'),
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
    reviewWorker: (workerId, data) => api.post(`/companies/review/${workerId}`, data),
    getDashboard: () => api.get('/companies/dashboard'),
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
    rejectUser: (id) => api.put(`/admin/users/${id}/reject`),
    toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
    getAllJobs: (params) => api.get('/admin/jobs', { params }),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
};

// Upload APIs
export const uploadAPI = {
    uploadSingle: (file, type = 'general') => {
        const formData = new FormData();
        formData.append('file', file);

        // Send type as QUERY PARAMETER - this is more reliable
        return api.post(`/upload/single?type=${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadMultiple: (files, type = 'general') => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        // Send type as QUERY PARAMETER
        return api.post(`/upload/multiple?type=${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// Message APIs
export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getOrCreateConversation: (data) => api.post('/messages/conversations', data),
    getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
    sendMessage: (conversationId, data) => api.post(`/messages/${conversationId}`, data),
};

export default api;