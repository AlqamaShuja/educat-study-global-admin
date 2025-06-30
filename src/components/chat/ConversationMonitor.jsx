import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Filter,
  Download,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  Search,
  RefreshCw,
  BarChart3,
  Activity,
  UserCheck,
  Star,
} from "lucide-react";
import Avatar, { AvatarGroup } from "../ui/Avatar";
import SearchInput from "./SearchInput";
import OnlineStatus, { formatLastSeen } from "./OnlineStatus";
import MessageStatus from "./MessageStatus";

const ConversationMonitor = ({
  conversations = [],
  analytics = {},
  currentUser = null,
  officeId = null,
  isLoading = false,
  onRefresh,
  onViewConversation,
  onExportData,
  onFilterChange,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("conversations");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    office: officeId || "all",
  });
  const [selectedConversations, setSelectedConversations] = useState(new Set());

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      !searchQuery ||
      conversation.participants?.some(
        (p) =>
          p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      conversation.lastMessage?.content
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && conversation.isActive) ||
      (filters.status === "archived" && conversation.isArchived) ||
      (filters.status === "escalated" && conversation.isEscalated);

    const matchesOffice =
      filters.office === "all" || conversation.officeId === filters.office;

    return matchesSearch && matchesStatus && matchesOffice;
  });

  // Stats calculations
  const stats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter((c) => c.isActive).length,
    escalatedConversations: conversations.filter((c) => c.isEscalated).length,
    averageResponseTime: analytics.averageResponseTime || "0m",
    onlineAgents: analytics.onlineAgents || 0,
    totalMessages: analytics.totalMessages || 0,
  };

  // Handle conversation selection
  const toggleConversationSelection = (conversationId) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action}`, Array.from(selectedConversations));
    setSelectedConversations(new Set());
  };

  // Get conversation priority
  const getConversationPriority = (conversation) => {
    if (conversation.isEscalated) return "high";
    if (conversation.unreadCount > 5) return "medium";
    return "normal";
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  // Conversation Row Component
  const ConversationRow = ({ conversation }) => {
    const priority = getConversationPriority(conversation);
    const isSelected = selectedConversations.has(conversation.id);

    return (
      <tr
        className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}
        onClick={() => onViewConversation?.(conversation.id)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleConversationSelection(conversation.id);
            }}
            className="rounded text-blue-600"
          />
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <AvatarGroup
              users={conversation.participants?.map((p) => p.user) || []}
              size="sm"
              max={2}
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {conversation.name ||
                  conversation.participants
                    ?.map((p) => p.user?.name)
                    .join(", ") ||
                  "Unnamed"}
              </div>
              <div className="text-sm text-gray-500">
                {conversation.participants?.length} participants
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
              priority
            )}`}
          >
            {priority}
          </span>
        </td>

        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 max-w-xs truncate">
            {conversation.lastMessage?.content || "No messages"}
          </div>
          <div className="text-sm text-gray-500">
            {conversation.lastMessage?.sender?.name} •{" "}
            {formatLastSeen(conversation.lastMessageAt)}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-center">
          {conversation.unreadCount > 0 ? (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {conversation.unreadCount}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            {conversation.isActive ? (
              <OnlineStatus status="online" variant="dot" size="sm" />
            ) : (
              <OnlineStatus status="offline" variant="dot" size="sm" />
            )}
            <span className="text-sm text-gray-600">
              {conversation.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewConversation?.(conversation.id);
            }}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Conversation Monitor
              </h1>
              <p className="text-gray-600">
                Monitor and manage conversations across your organization
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={onExportData}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                {
                  id: "conversations",
                  label: "Conversations",
                  icon: MessageSquare,
                },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "agents", label: "Agents", icon: Users },
                { id: "alerts", label: "Alerts", icon: AlertTriangle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "conversations" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Conversations"
                value={stats.totalConversations}
                subtitle="All time"
                icon={MessageSquare}
              />
              <StatsCard
                title="Active Conversations"
                value={stats.activeConversations}
                subtitle="Currently ongoing"
                icon={Activity}
              />
              <StatsCard
                title="Escalated"
                value={stats.escalatedConversations}
                subtitle="Require attention"
                icon={AlertTriangle}
              />
              <StatsCard
                title="Avg Response Time"
                value={stats.averageResponseTime}
                subtitle="Last 24 hours"
                icon={Clock}
                trend="+5% from yesterday"
              />
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search conversations..."
                    className="w-full sm:w-64"
                  />

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="escalated">Escalated</option>
                  </select>

                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                {selectedConversations.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedConversations.size} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction("archive")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => handleBulkAction("escalate")}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Escalate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conversations Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConversations(
                                new Set(filteredConversations.map((c) => c.id))
                              );
                            } else {
                              setSelectedConversations(new Set());
                            }
                          }}
                          checked={
                            selectedConversations.size ===
                              filteredConversations.length &&
                            filteredConversations.length > 0
                          }
                          className="rounded text-blue-600"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Message
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unread
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredConversations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No conversations found
                        </td>
                      </tr>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <ConversationRow
                          key={conversation.id}
                          conversation={conversation}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Analytics Dashboard
            </h3>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Agent Management
            </h3>
            <p className="text-gray-500">
              Agent management interface coming soon...
            </p>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Alerts & Notifications
            </h3>
            <p className="text-gray-500">Alerts dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for using conversation monitoring
export const useConversationMonitor = (officeId = null) => {
  const [conversations, setConversations] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMonitoredConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would use your conversation API
      const response = await fetch(
        `/api/v1/monitoring/conversations${
          officeId ? `?officeId=${officeId}` : ""
        }`
      );
      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      setConversations(data.conversations || []);
      setAnalytics(data.analytics || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [officeId]);

  const exportData = useCallback(
    async (format = "csv") => {
      try {
        const response = await fetch(
          `/api/v1/monitoring/export?format=${format}${
            officeId ? `&officeId=${officeId}` : ""
          }`
        );
        if (!response.ok) throw new Error("Failed to export data");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversations-export.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError(err.message);
      }
    },
    [officeId]
  );

  const viewConversation = useCallback((conversationId) => {
    // Navigate to conversation view
    window.open(`/conversations/${conversationId}`, "_blank");
  }, []);

  useEffect(() => {
    loadMonitoredConversations();
  }, [loadMonitoredConversations]);

  return {
    conversations,
    analytics,
    isLoading,
    error,
    refresh: loadMonitoredConversations,
    exportData,
    viewConversation,
  };
};

export default ConversationMonitor;
