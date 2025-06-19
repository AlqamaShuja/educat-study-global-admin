import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext exists

const useLeads = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Get leads based on user role
  const getLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (user.role === "consultant") endpoint = "/consultant/leads";
      else if (user.role === "manager") endpoint = "/manager/leads";
      else if (user.role === "receptionist") endpoint = "/receptionist/leads";
      else if (user.role === "super_admin") endpoint = "/super-admin/leads";
      else throw new Error("Invalid role");

      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch leads");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create lead (manager/receptionist)
  const createLead = async (leadData) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "manager"
          ? "/manager/leads"
          : "/receptionist/leads/register";
      const response = await api.post(endpoint, leadData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create lead");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update lead status (consultant/receptionist)
  const updateLeadStatus = async (leadId, status) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "consultant"
          ? `/consultant/leads/${leadId}/status`
          : `/receptionist/leads/${leadId}/status`;
      const response = await api.put(endpoint, { status });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update lead status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add notes to lead (consultant/receptionist/manager)
  const addLeadNotes = async (leadId, note) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (user.role === "consultant")
        endpoint = `/consultant/leads/${leadId}/notes`;
      else if (user.role === "manager")
        endpoint = `/manager/leads/${leadId}/notes`;
      else if (user.role === "receptionist")
        endpoint = `/receptionist/leads/${leadId}/notes`;
      else throw new Error("Invalid role");

      const response = await api.post(endpoint, { note });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add note");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reassign lead (manager/super_admin)
  const reassignLead = async (leadId, consultantId) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "manager"
          ? `/manager/leads/${leadId}/reassign`
          : `/super-admin/leads/${leadId}/reassign`;
      const response = await api.put(endpoint, { consultantId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reassign lead");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get lead history (receptionist/super_admin)
  const getLeadHistory = async (leadId) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "receptionist"
          ? `/receptionist/leads/${leadId}/history`
          : `/super-admin/leads/${leadId}/history`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch lead history");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set lead reminder (manager)
  const setLeadReminder = async (leadId, reminderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/manager/leads/${leadId}/reminders`,
        reminderData
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set reminder");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload lead documents (consultant)
  const uploadLeadDocuments = async (leadId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/consultant/leads/${leadId}/documents`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload documents");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getLeads,
    createLead,
    updateLeadStatus,
    addLeadNotes,
    reassignLead,
    getLeadHistory,
    setLeadReminder,
    uploadLeadDocuments,
  };
};

export default useLeads;
