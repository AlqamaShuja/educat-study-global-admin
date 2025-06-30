import React, { useEffect } from "react";
import ConversationMonitor, {
  useConversationMonitor,
} from "../../components/chat/ConversationMonitor";
import useAuthStore from "../../stores/authStore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ConversationMonitorPage = () => {
  const { user, isAuthenticated, hasPermission } = useAuthStore();

  // Use the monitoring hook
  const {
    conversations,
    analytics,
    isLoading,
    error,
    refresh,
    exportData,
    viewConversation,
  } = useConversationMonitor(user?.officeId);

  // Check permissions
  const canMonitor =
    hasPermission("view_office_conversations") ||
    hasPermission("view_all_conversations");

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!canMonitor) {
      window.location.href = "/unauthorized";
      return;
    }
  }, [isAuthenticated, canMonitor]);

  // Handle conversation viewing
  const handleViewConversation = (conversationId) => {
    // Open in new tab or navigate to conversation
    window.open(`/chat/${conversationId}`, "_blank");
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      await exportData("csv");
    } catch (err) {
      console.error("Export failed:", err);
      // You might want to show a toast notification here
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    // This would typically update URL params or local state
    console.log("Filters changed:", filters);
  };

  if (!isAuthenticated || !canMonitor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConversationMonitor
        conversations={conversations}
        analytics={analytics}
        currentUser={user}
        officeId={user?.officeId}
        isLoading={isLoading}
        onRefresh={refresh}
        onViewConversation={handleViewConversation}
        onExportData={handleExportData}
        onFilterChange={handleFilterChange}
        className="h-full"
      />
    </div>
  );
};

export default ConversationMonitorPage;
