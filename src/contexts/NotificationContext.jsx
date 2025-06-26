import React, { createContext, useState, useEffect, useCallback } from "react";
import notificationService from "../services/notificationService";
// import { useToast } from "./ToastContext";
import { toast } from 'react-toastify';

// Create Notification Context
export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  clearNotifications: () => {},
});

// Notification Provider Component
export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const { success, error } = useToast();

  // Fetch notifications for the user
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const fetchedNotifications = await notificationService.getNotifications(
        userId
      );
      setNotifications(fetchedNotifications || []);
    } catch (err) {
      toast.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 120000); // Poll every 120 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Calculate unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add a new notification
  const addNotification = useCallback(
    (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message);
    },
    []
  );

  // Mark a notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      } catch (err) {
        toast.error("Failed to mark notification as read");
      }
    },
    []
  );

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    try {
      await notificationService.clearNotifications(userId);
      setNotifications([]);
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for accessing notification context
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
