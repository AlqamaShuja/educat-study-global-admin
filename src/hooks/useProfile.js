import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext exists

const useProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Get user profile
  const getProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/profile");
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put("/profile", profileData);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload profile picture");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put("/profile/change-password", passwordData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete("/profile");
      setUser(null);
      localStorage.removeItem("token");
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    deleteAccount,
  };
};

export default useProfile;
