// src/hooks/useMessageMonitoring.js
import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../stores/authStore";
import useSocket from "./useSocket";

const useMessageMonitoring = (officeId = null) => {
  const [monitoredConversations, setMonitoredConversations] = useState(
    new Map()
  );
  const [analytics, setAnalytics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const pollingIntervalRef = useRef(null);
  const alertTimeoutRef = useRef(new Map());

  const { user, hasPermission } = useAuthStore();
  const { isConnected } = useSocket();

  // Check if user has monitoring permissions
  const canMonitor =
    hasPermission("view_office_conversations") ||
    hasPermission("view_all_conversations");

  // Load monitored conversations
  const loadMonitoredConversations = useCallback(
    async (refresh = false) => {
      if (!canMonitor) {
        setError("Permission denied: Cannot monitor conversations");
        return;
      }

      setIsLoading(true);
      if (!refresh) setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const url = officeId
          ? `/api/v1/monitoring/conversations?officeId=${officeId}`
          : "/api/v1/monitoring/conversations";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load conversations: ${response.status}`);
        }

        const data = await response.json();

        // Convert to Map for efficient lookups
        const conversationsMap = new Map();
        (data.conversations || []).forEach((conv) => {
          conversationsMap.set(conv.id, {
            ...conv,
            lastMonitoredAt: new Date().toISOString(),
          });
        });

        setMonitoredConversations(conversationsMap);
        setAnalytics(data.analytics || {});
        setLastUpdate(new Date().toISOString());

        // Check for alerts
        checkForAlerts(conversationsMap);
      } catch (err) {
        setError(err.message);
        console.error("Failed to load monitored conversations:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [canMonitor, officeId]
  );

  // Load agent performance data
  const loadAgentPerformance = useCallback(
    async (timeframe = "7d") => {
      if (!canMonitor) return;

      try {
        const token = localStorage.getItem("authToken");
        const url = officeId
          ? `/api/v1/monitoring/agents/performance?officeId=${officeId}&timeframe=${timeframe}`
          : `/api/v1/monitoring/agents/performance?timeframe=${timeframe}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load agent performance");
        }

        const data = await response.json();

        const performanceMap = new Map();
        (data.agents || []).forEach((agent) => {
          performanceMap.set(agent.id, agent);
        });

        setAgentPerformance(performanceMap);
      } catch (err) {
        console.error("Failed to load agent performance:", err);
      }
    },
    [canMonitor, officeId]
  );

  // Check for alerts based on conversation data
  const checkForAlerts = useCallback((conversations) => {
    const newAlerts = [];
    const now = new Date();

    conversations.forEach((conversation, id) => {
      // Alert for unresponded messages over 30 minutes
      if (conversation.unreadCount > 0 && conversation.lastMessageAt) {
        const lastMessageTime = new Date(conversation.lastMessageAt);
        const timeDiff = now - lastMessageTime;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        if (minutesDiff > 30) {
          newAlerts.push({
            id: `unresponded_${id}`,
            type: "unresponded",
            severity: minutesDiff > 60 ? "high" : "medium",
            conversationId: id,
            message: `Conversation has ${conversation.unreadCount} unread messages for ${minutesDiff} minutes`,
            timestamp: now.toISOString(),
          });
        }
      }

      // Alert for escalated conversations
      if (conversation.isEscalated && !conversation.escalationHandled) {
        newAlerts.push({
          id: `escalated_${id}`,
          type: "escalated",
          severity: "high",
          conversationId: id,
          message: "Conversation has been escalated and needs attention",
          timestamp: now.toISOString(),
        });
      }

      // Alert for high message volume
      if (conversation.messageCount24h > 50) {
        newAlerts.push({
          id: `high_volume_${id}`,
          type: "high_volume",
          severity: "medium",
          conversationId: id,
          message: `High message volume: ${conversation.messageCount24h} messages in 24h`,
          timestamp: now.toISOString(),
        });
      }

      // Alert for agent inactivity
      if (conversation.assignedAgent && conversation.agentLastActive) {
        const lastActiveTime = new Date(conversation.agentLastActive);
        const inactiveDiff = now - lastActiveTime;
        const hoursInactive = Math.floor(inactiveDiff / (1000 * 60 * 60));

        if (hoursInactive > 2 && conversation.isActive) {
          newAlerts.push({
            id: `agent_inactive_${id}`,
            type: "agent_inactive",
            severity: "medium",
            conversationId: id,
            agentId: conversation.assignedAgent.id,
            message: `Agent ${conversation.assignedAgent.name} inactive for ${hoursInactive} hours`,
            timestamp: now.toISOString(),
          });
        }
      }
    });

    setAlerts((prevAlerts) => {
      // Merge new alerts with existing ones, avoiding duplicates
      const alertsMap = new Map();

      // Add existing alerts
      prevAlerts.forEach((alert) => {
        alertsMap.set(alert.id, alert);
      });

      // Add new alerts
      newAlerts.forEach((alert) => {
        alertsMap.set(alert.id, alert);
      });

      return Array.from(alertsMap.values()).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    });
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  // Handle alert (mark as resolved)
  const handleAlert = useCallback(
    async (alertId, action = "resolve") => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/v1/monitoring/alerts/${alertId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        });

        if (response.ok) {
          dismissAlert(alertId);
        }
      } catch (err) {
        console.error("Failed to handle alert:", err);
      }
    },
    [dismissAlert]
  );

  // Get conversation analytics
  const getConversationAnalytics = useCallback(
    (conversationId, timeframe = "7d") => {
      return {
        messageCount: 0,
        responseTime: 0,
        participantCount: 0,
        // This would be fetched from API in real implementation
      };
    },
    []
  );

  // Export conversation data
  const exportConversationData = useCallback(
    async (conversationIds, format = "csv") => {
      if (!canMonitor) {
        throw new Error("Permission denied");
      }

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/v1/monitoring/export", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationIds,
            format,
            officeId,
          }),
        });

        if (!response.ok) {
          throw new Error("Export failed");
        }

        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversations-export-${new Date().getTime()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Export failed:", err);
        throw err;
      }
    },
    [canMonitor, officeId]
  );

  // Search conversations
  const searchConversations = useCallback(
    async (query, filters = {}) => {
      if (!canMonitor || !query.trim()) return [];

      try {
        const token = localStorage.getItem("authToken");
        const searchParams = new URLSearchParams({
          q: query,
          ...filters,
          ...(officeId && { officeId }),
        });

        const response = await fetch(
          `/api/v1/monitoring/search?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        return data.results || [];
      } catch (err) {
        console.error("Search failed:", err);
        return [];
      }
    },
    [canMonitor, officeId]
  );

  // Filter conversations
  const filterConversations = useCallback(
    (filters) => {
      return Array.from(monitoredConversations.values()).filter(
        (conversation) => {
          if (filters.status && filters.status !== "all") {
            if (filters.status === "active" && !conversation.isActive)
              return false;
            if (filters.status === "escalated" && !conversation.isEscalated)
              return false;
            if (filters.status === "archived" && !conversation.isArchived)
              return false;
          }

          if (filters.priority && filters.priority !== "all") {
            const priority = getConversationPriority(conversation);
            if (priority !== filters.priority) return false;
          }

          if (filters.agent && filters.agent !== "all") {
            if (conversation.assignedAgent?.id !== filters.agent) return false;
          }

          if (filters.dateRange) {
            const conversationDate = new Date(
              conversation.lastMessageAt || conversation.createdAt
            );
            const now = new Date();

            switch (filters.dateRange) {
              case "today":
                if (conversationDate.toDateString() !== now.toDateString())
                  return false;
                break;
              case "week":
                const weekAgo = new Date(
                  now.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                if (conversationDate < weekAgo) return false;
                break;
              case "month":
                const monthAgo = new Date(
                  now.getTime() - 30 * 24 * 60 * 60 * 1000
                );
                if (conversationDate < monthAgo) return false;
                break;
            }
          }

          return true;
        }
      );
    },
    [monitoredConversations]
  );

  // Get conversation priority
  const getConversationPriority = useCallback((conversation) => {
    if (conversation.isEscalated) return "high";
    if (conversation.unreadCount > 5) return "medium";
    if (conversation.messageCount24h > 20) return "medium";
    return "low";
  }, []);

  // Setup real-time updates when connected
  useEffect(() => {
    if (!canMonitor || !isConnected) return;

    // Set up polling for updates every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadMonitoredConversations(true);
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [canMonitor, isConnected, loadMonitoredConversations]);

  // Initial load
  useEffect(() => {
    if (canMonitor) {
      loadMonitoredConversations();
      loadAgentPerformance();
    }
  }, [canMonitor, loadMonitoredConversations, loadAgentPerformance]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      alertTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    // Data
    conversations: Array.from(monitoredConversations.values()),
    conversationsMap: monitoredConversations,
    analytics,
    alerts,
    agentPerformance: Array.from(agentPerformance.values()),

    // State
    isLoading,
    error,
    lastUpdate,
    canMonitor,

    // Actions
    refresh: () => loadMonitoredConversations(true),
    loadAgentPerformance,
    dismissAlert,
    handleAlert,
    exportConversationData,
    searchConversations,
    filterConversations,

    // Utilities
    getConversationAnalytics,
    getConversationPriority,
  };
};

// Hook for monitoring specific conversation
export const useConversationMonitoring = (conversationId) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { hasPermission } = useAuthStore();
  const canMonitor =
    hasPermission("view_office_conversations") ||
    hasPermission("view_all_conversations");

  const loadConversation = useCallback(async () => {
    if (!canMonitor || !conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      // Load conversation details
      const convResponse = await fetch(
        `/api/v1/monitoring/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!convResponse.ok) {
        throw new Error("Failed to load conversation");
      }

      const convData = await convResponse.json();
      setConversation(convData);

      // Load messages
      const messagesResponse = await fetch(
        `/api/v1/monitoring/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }

      // Load analytics
      const analyticsResponse = await fetch(
        `/api/v1/monitoring/conversations/${conversationId}/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [canMonitor, conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return {
    conversation,
    messages,
    analytics,
    isLoading,
    error,
    canMonitor,
    refresh: loadConversation,
  };
};

export default useMessageMonitoring;
