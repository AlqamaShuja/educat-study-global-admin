import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import applicationService from '../services/applicationService';
import { toast } from 'react-toastify';

const useApplicationStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    applications: [],
    statistics: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      stage: ''
    },

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

    // Fetch consultant applications
    fetchConsultantApplications: async () => {
      set({ loading: true, error: null });
      try {
        const response = await applicationService.getConsultantApplications();
        set({ 
          applications: response.applications || [],
          loading: false 
        });
      } catch (error) {
        set({ 
          error: error.message || 'Failed to fetch applications',
          loading: false 
        });
        toast.error('Failed to fetch applications');
      }
    },

    // Fetch all applications (super admin)
    fetchAllApplications: async (filters = {}) => {
      set({ loading: true, error: null });
      try {
        const response = await applicationService.getAllApplications(filters);
        set({ 
          applications: response.applications || [],
          loading: false 
        });
      } catch (error) {
        set({ 
          error: error.message || 'Failed to fetch applications',
          loading: false 
        });
        toast.error('Failed to fetch applications');
      }
    },

    // Fetch statistics
    fetchStatistics: async () => {
      try {
        const response = await applicationService.getApplicationStatistics();
        set({ statistics: response.stats });
      } catch (error) {
        toast.error('Failed to fetch statistics');
      }
    },

    // Review application
    reviewApplication: async (applicationId, reviewData) => {
      try {
        const response = await applicationService.reviewApplication(applicationId, reviewData);
        console.log(response, "responseascancnajscjajs");
        
        set(state => ({
          applications: state.applications.map(app => 
            app.id === applicationId ? response.application : app
          )
        }));
        toast.success('Application reviewed successfully');
        return response;
      } catch (error) {
        toast.error('Failed to review application');
        throw error;
      }
    },

    // Update application status
    updateApplicationStatus: async (applicationId, statusData) => {
      try {
        const response = await applicationService.updateApplicationStatus(applicationId, statusData);
        set(state => ({
          applications: state.applications.map(app => 
            app.id === applicationId ? response : app
          )
        }));
        toast.success('Application status updated successfully');
        return response;
      } catch (error) {
        toast.error('Failed to update application status');
        throw error;
      }
    },

    // Update application
    updateApplication: async (applicationId, updateData) => {
      try {
        const response = await applicationService.updateApplication(applicationId, updateData);
        set(state => ({
          applications: state.applications.map(app => 
            app.id === applicationId ? response : app
          )
        }));
        toast.success('Application updated successfully');
        return response;
      } catch (error) {
        toast.error('Failed to update application');
        throw error;
      }
    },

    // Delete application
    deleteApplication: async (applicationId) => {
      try {
        await applicationService.deleteApplication(applicationId);
        set(state => ({
          applications: state.applications.filter(app => app.id !== applicationId)
        }));
        toast.success('Application deleted successfully');
      } catch (error) {
        toast.error('Failed to delete application');
        throw error;
      }
    },

    // Get application by ID
    getApplicationById: (applicationId) => {
      return get().applications.find(app => app.id === applicationId);
    },

    // Clear applications
    clearApplications: () => {
      set({ applications: [], statistics: null });
    }
  }))
);

export default useApplicationStore; 