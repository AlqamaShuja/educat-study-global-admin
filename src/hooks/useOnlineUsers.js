// src/hooks/useOnlineUsers.js
import { useState, useEffect, useCallback, useRef } from "react";
import useSocket from "./useSocket";
import useSocketStore from "../stores/socketStore";
import useAuthStore from "../stores/authStore";

const useOnlineUsers = (conversationId = null) => {
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [userStatuses, setUserStatuses] = useState(new Map());
  const [lastActivity, setLastActivity] = useState(new Map());

  const activityTimeoutRef = useRef(new Map());
  const statusUpdateTimeoutRef = useRef(null);

  const { user } = useAuthStore();
  const {
    isConnected,
    getUserOnlineStatus,
    updateStatus,
    getConversationOnlineUsers,
  } = useSocket();

  // Get online users from socket store
  const socketOnlineUsers = useSocketStore((state) => state.onlineUsers);

  // Update local state when socket store changes
  useEffect(() => {
    setOnlineUsers(new Map(socketOnlineUsers));
  }, [socketOnlineUsers]);

  // Track user activity for auto-away
  const trackActivity = useCallback(() => {
    if (!user?.id) return;

    const now = Date.now();
    setLastActivity((prev) => new Map(prev).set(user.id, now));

    // Clear existing timeout
    if (activityTimeoutRef.current.has(user.id)) {
      clearTimeout(activityTimeoutRef.current.get(user.id));
    }

    // Set timeout to mark as away after 5 minutes of inactivity
    const timeout = setTimeout(() => {
      const currentStatus = getUserOnlineStatus(user.id)?.status;
      if (currentStatus === "online") {
        updateUserStatus("away");
      }
    }, 5 * 60 * 1000); // 5 minutes

    activityTimeoutRef.current.set(user.id, timeout);
  }, [user?.id, getUserOnlineStatus, updateStatus]);

  // Update user status
  const updateUserStatus = useCallback(
    async (status) => {
      if (!user?.id || !isConnected) return;

      try {
        await updateStatus(status);

        // Update local state immediately for better UX
        setUserStatuses((prev) =>
          new Map(prev).set(user.id, {
            status,
            lastSeen: new Date().toISOString(),
          })
        );

        // Track activity when going online
        if (status === "online") {
          trackActivity();
        }
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    },
    [user?.id, isConnected, updateStatus, trackActivity]
  );

  // Get user status
  const getUserStatus = useCallback(
    (userId) => {
      // Check local state first
      const localStatus = userStatuses.get(userId);
      if (localStatus) return localStatus;

      // Fall back to socket store
      const socketStatus = getUserOnlineStatus(userId);
      return socketStatus || { status: "offline", lastSeen: null };
    },
    [userStatuses, getUserOnlineStatus]
  );

  // Check if user is online
  const isUserOnline = useCallback(
    (userId) => {
      const status = getUserStatus(userId);
      return status.status === "online";
    },
    [getUserStatus]
  );

  // Get all online users
  const getAllOnlineUsers = useCallback(() => {
    return Array.from(onlineUsers.entries()).map(([userId, userInfo]) => ({
      userId,
      ...userInfo,
    }));
  }, [onlineUsers]);

  // Get online users for specific conversation
  const getConversationOnlineUsersData = useCallback(() => {
    if (!conversationId) return [];

    // Request data from server
    getConversationOnlineUsers(conversationId);

    // Return current data (will be updated via socket events)
    return Array.from(onlineUsers.entries())
      .filter(([userId, userInfo]) =>
        userInfo.conversationIds?.includes(conversationId)
      )
      .map(([userId, userInfo]) => ({ userId, ...userInfo }));
  }, [conversationId, onlineUsers, getConversationOnlineUsers]);

  // Get online count for conversation
  const getOnlineCount = useCallback(
    (participantIds = []) => {
      return participantIds.filter((userId) => isUserOnline(userId)).length;
    },
    [isUserOnline]
  );

  // Set up activity tracking
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle activity tracking to prevent excessive calls
    let lastTrack = 0;
    const throttledTrack = () => {
      const now = Date.now();
      if (now - lastTrack > 30000) {
        // 30 seconds throttle
        trackActivity();
        lastTrack = now;
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledTrack, true);
    });

    // Initial activity track
    trackActivity();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledTrack, true);
      });
    };
  }, [user?.id, isConnected, trackActivity]);

  // Handle page visibility changes
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, set to away after delay
        statusUpdateTimeoutRef.current = setTimeout(() => {
          const currentStatus = getUserStatus(user.id)?.status;
          if (currentStatus === "online") {
            updateUserStatus("away");
          }
        }, 2 * 60 * 1000); // 2 minutes delay
      } else {
        // Page is visible, clear timeout and track activity
        if (statusUpdateTimeoutRef.current) {
          clearTimeout(statusUpdateTimeoutRef.current);
        }

        const currentStatus = getUserStatus(user.id)?.status;
        if (currentStatus === "away") {
          updateUserStatus("online");
        } else {
          trackActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id, getUserStatus, updateUserStatus, trackActivity]);

  // Handle window focus/blur
  useEffect(() => {
    if (!user?.id) return;

    const handleFocus = () => {
      const currentStatus = getUserStatus(user.id)?.status;
      if (currentStatus === "away") {
        updateUserStatus("online");
      }
      trackActivity();
    };

    const handleBlur = () => {
      // Set to away after 1 minute of window being unfocused
      statusUpdateTimeoutRef.current = setTimeout(() => {
        const currentStatus = getUserStatus(user.id)?.status;
        if (currentStatus === "online") {
          updateUserStatus("away");
        }
      }, 60 * 1000); // 1 minute
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [user?.id, getUserStatus, updateUserStatus, trackActivity]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear activity timeouts
      activityTimeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });

      // Clear status update timeout
      if (statusUpdateTimeoutRef.current) {
        clearTimeout(statusUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Auto-set to offline when disconnected
  useEffect(() => {
    if (!isConnected && user?.id) {
      setUserStatuses((prev) =>
        new Map(prev).set(user.id, {
          status: "offline",
          lastSeen: new Date().toISOString(),
        })
      );
    }
  }, [isConnected, user?.id]);

  // Initialize status when connected
  useEffect(() => {
    if (isConnected && user?.id) {
      // Set to online when first connecting
      updateUserStatus("online");
    }
  }, [isConnected, user?.id, updateUserStatus]);

  return {
    // Data
    onlineUsers: getAllOnlineUsers(),
    userStatuses,
    lastActivity,

    // Status methods
    getUserStatus,
    isUserOnline,
    updateUserStatus,

    // Conversation methods
    getConversationOnlineUsers: getConversationOnlineUsersData,
    getOnlineCount,

    // Activity tracking
    trackActivity,

    // Utilities
    isConnected,
    currentUserStatus: user?.id ? getUserStatus(user.id) : null,
  };
};

// Hook for managing presence in a specific conversation
export const useConversationPresence = (conversationId, participants = []) => {
  const {
    isUserOnline,
    getOnlineCount,
    getConversationOnlineUsers,
    updateUserStatus,
  } = useOnlineUsers(conversationId);

  const [joinedAt, setJoinedAt] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // Join conversation presence
  const joinPresence = useCallback(() => {
    if (!conversationId) return;

    setJoinedAt(new Date().toISOString());
    setIsActive(true);

    // Notify server about presence in conversation
    // This would typically be handled by the socket service
  }, [conversationId]);

  // Leave conversation presence
  const leavePresence = useCallback(() => {
    setIsActive(false);
    setJoinedAt(null);
  }, []);

  // Get online participants
  const onlineParticipants = participants.filter((p) => isUserOnline(p.userId));
  const onlineCount = getOnlineCount(participants.map((p) => p.userId));

  useEffect(() => {
    if (conversationId) {
      joinPresence();
      return leavePresence;
    }
  }, [conversationId, joinPresence, leavePresence]);

  return {
    onlineParticipants,
    onlineCount,
    isActive,
    joinedAt,
    joinPresence,
    leavePresence,
  };
};

// Hook for monitoring user activity patterns
export const useActivityMonitoring = () => {
  const [activityStats, setActivityStats] = useState({
    totalActiveTime: 0,
    lastActiveTime: null,
    sessionsToday: 0,
    averageSessionTime: 0,
  });

  const sessionStartRef = useRef(null);
  const activityIntervalsRef = useRef([]);

  const startSession = useCallback(() => {
    sessionStartRef.current = Date.now();
  }, []);

  const endSession = useCallback(() => {
    if (!sessionStartRef.current) return;

    const sessionTime = Date.now() - sessionStartRef.current;
    activityIntervalsRef.current.push(sessionTime);

    setActivityStats((prev) => ({
      ...prev,
      totalActiveTime: prev.totalActiveTime + sessionTime,
      lastActiveTime: new Date().toISOString(),
      sessionsToday: prev.sessionsToday + 1,
      averageSessionTime:
        activityIntervalsRef.current.reduce((a, b) => a + b, 0) /
        activityIntervalsRef.current.length,
    }));

    sessionStartRef.current = null;
  }, []);

  // Track page visibility for session management
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      } else {
        startSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start initial session
    if (!document.hidden) {
      startSession();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      endSession();
    };
  }, [startSession, endSession]);

  return {
    activityStats,
    startSession,
    endSession,
  };
};

export default useOnlineUsers;
