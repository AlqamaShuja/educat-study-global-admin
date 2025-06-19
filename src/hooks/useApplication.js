import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext exists

const useApplications = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Get applications based on role
  const getApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (user.role === "student") endpoint = "/student/applications";
      else if (user.role === "consultant")
        endpoint = "/consultant/applications";
      else if (user.role === "super_admin")
        endpoint = "/super-admin/applications";
      else throw new Error("Invalid role");

      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch applications");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create application (student)
  const createApplication = async (applicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/student/applications", applicationData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create application");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update application status (consultant/super_admin)
  const updateApplicationStatus = async (applicationId, status) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "consultant"
          ? `/consultant/applications/${applicationId}/status`
          : `/super-admin/applications/${applicationId}/status`;
      const response = await api.put(endpoint, { status });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update application status"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload application documents (student/consultant)
  const uploadApplicationDocuments = async (applicationId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "student"
          ? `/student/applications/${applicationId}/documents`
          : `/consultant/applications/${applicationId}/documents`;
      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload documents");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get application details
  const getApplicationDetails = async (applicationId) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (user.role === "student")
        endpoint = `/student/applications/${applicationId}`;
      else if (user.role === "consultant")
        endpoint = `/consultant/applications/${applicationId}`;
      else if (user.role === "super_admin")
        endpoint = `/super-admin/applications/${applicationId}`;
      else throw new Error("Invalid role");

      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch application details"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel application (student)
  const cancelApplication = async (applicationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(
        `/student/applications/${applicationId}`
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel application");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getApplications,
    createApplication,
    updateApplicationStatus,
    uploadApplicationDocuments,
    getApplicationDetails,
    cancelApplication,
  };
};

export default useApplications;
