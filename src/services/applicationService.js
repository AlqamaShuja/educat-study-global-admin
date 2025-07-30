import api from './api';

const applicationService = {
  // Consultant endpoints
  getConsultantApplications: async () => {
    const response = await api.get('/applications/consultant/applications');
    return response;
  },

  reviewApplication: async (applicationId, reviewData) => {
    const response = await api.put(`/applications/consultant/${applicationId}/review`, reviewData);
    return response;
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    const response = await api.put(`/applications/consultant/${applicationId}/status`, statusData);
    return response;
  },

  // Super Admin endpoints
  getAllApplications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.stage) params.append('stage', filters.stage);
    
    const response = await api.get(`/applications/super-admin/applications?${params.toString()}`);
    return response;
  },

  getApplicationStatistics: async () => {
    const response = await api.get('/applications/super-admin/statistics');
    return response;
  },

  // Common endpoints
  getApplicationById: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response;
  },

  updateApplication: async (applicationId, updateData) => {
    const response = await api.put(`/applications/${applicationId}`, updateData);
    return response;
  },

  deleteApplication: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response;
  }
};

export default applicationService; 