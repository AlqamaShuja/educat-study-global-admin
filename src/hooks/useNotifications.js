import { useState, useContext } from "react";
import axios from "axios";
import useAuthStore from "../stores/authStore";
import api from "../services/api";

const useNotifications = () => {
  const { user, } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Get notifications
  const getNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/notifications");
      return response;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch notifications");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to mark notification as read"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put("/notifications/read-all");
      return response;
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to mark all notifications as read"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete notification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send notification (manager/super_admin)
  const sendNotification = async (notificationData) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === "manager"
          ? "/manager/notifications"
          : "/super-admin/notifications";
      const response = await api.post(endpoint, notificationData);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send notification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
  };
};

export default useNotifications;
