import api from "./api";

const userService = {
  /**
   * Get current authenticated user profile
   * @returns {Promise<Object>} User profile
   */
  getProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },

  /**
   * Update user profile
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put("/auth/me", data);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  /**
   * Change password
   * @param {Object} payload - { currentPassword, newPassword }
   * @returns {Promise<Object>} Success response
   */
  changePassword: async (payload) => {
    try {
      const response = await api.put("/auth/change-password", payload);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  },

  /**
   * Get all Students with Leads
   * @returns {Promise<Array>} List of staff objects
   */
  getAllStudents: async () => {
    try {
      const response = await api.get("/super-admin/students");
      console.log(response, "akcsnaskncacnsnc");
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
  },
  
  /**
   * Get all staff members
   * @returns {Promise<Array>} List of staff objects
   */
  updateLeadAssign: async (data) => {
    try {
      const response = await api.post("/super-admin/leads/assign", data);
      console.log(response, "akcsnaskncacnsnc");
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
  },
  
  /**
   * Get all staff members
   * @returns {Promise<Array>} List of staff objects
   */
  getSuperAdminDashboardData: async () => {
    try {
      const response = await api.get("/super-admin/dashboard");
      console.log(response, "akcsnaskncacnsnc");
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
  },
  
  /**
   * Get all staff members
   * @returns {Promise<Array>} List of staff objects
   */
  getAllStaff: async () => {
    try {
      const response = await api.get("/super-admin/staff");
      console.log(response, "akcsnaskncacnsnc");
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
  },

  /**
   * Get staff members with role 'manager'
   * @returns {Promise<Array>} List of manager objects
   */
  getManagers: async () => {
    try {
      const response = await api.get("/super-admin/staff?role=manager");
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch managers"
      );
    }
  },

  /**
   * Get staff members with role 'consultant'
   * @returns {Promise<Array>} List of consultant objects
   */
  getConsultants: async () => {
    try {
      const response = await api.get("/super-admin/staff?role=consultant");
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch consultants"
      );
    }
  },

  /**
   * Create a new staff member
   * @param {Object} data - Staff data (name, email, role, etc.)
   * @returns {Promise<Object>} Created staff object
   */
  createStaff: async (data) => {
    try {
      const response = await api.post("/super-admin/staff", data);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || error || "Failed to create staff"
      );
    }
  },

  /**
   * Update a staff member
   * @param {string} id - Staff ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Updated staff object
   */
  updateStaff: async (id, data) => {
    try {
      const response = await api.put(`/super-admin/staff/${id}`, data);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || error || "Failed to update staff"
      );
    }
  },

  /**
   * Delete a staff member
   * @param {string} id - Staff ID
   * @returns {Promise<void>}
   */
  deleteStaff: async (id) => {
    try {
      await api.delete(`/super-admin/staff/${id}`);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete staff"
      );
    }
  },

  /**
   * Toggle staff active status
   * @param {string} id - Staff ID
   * @param {boolean} isActive - New status
   * @returns {Promise<Object>} Updated staff object
   */
  toggleStaffStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/super-admin/staff/${id}/status`, { isActive });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to toggle staff status"
      );
    }
  },

  /**
   * Import staff from CSV file
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Import result (e.g., { success, count })
   */
  importStaffCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/staff/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to import staff CSV"
      );
    }
  },

  /**
   * Get audit logs for a staff member
   * @param {string} id - Staff ID
   * @returns {Promise<Array>} List of log objects
   */
  getStaffLogs: async (id) => {
    try {
      const response = await api.get(`/staff/${id}/logs`);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch staff logs"
      );
    }
  },

  /**
   * Bulk update staff members
   * @param {Array} staffUpdates - Array of { id, ...data } objects
   * @returns {Promise<Array>} Updated staff objects
   */
  bulkUpdateStaff: async (staffUpdates) => {
    try {
      const response = await api.put("/staff/bulk", staffUpdates);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk update staff"
      );
    }
  },
};

export default userService;
