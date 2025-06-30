import React, { useEffect } from "react";
import ChatContainer from "../../components/chat/ChatContainer";
import useConversations from "../../hooks/useConversations";
import useAuthStore from "../../stores/authStore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ChatPage = () => {
  // You'll need to import useParams and useNavigate from react-router-dom
  // const { conversationId } = useParams();
  // const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { selectConversation, activeConversationId, isLoading } =
    useConversations();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // navigate('/login', { replace: true });
      window.location.href = "/login";
      return;
    }
  }, [isAuthenticated]);

  // Handle conversation selection from URL
  // useEffect(() => {
  //   if (conversationId && conversationId !== activeConversationId) {
  //     selectConversation(conversationId);
  //   }
  // }, [conversationId, activeConversationId, selectConversation]);

  // Update URL when active conversation changes
  // useEffect(() => {
  //   if (activeConversationId && conversationId !== activeConversationId) {
  //     navigate(`/chat/${activeConversationId}`, { replace: true });
  //   } else if (!activeConversationId && conversationId) {
  //     navigate('/chat', { replace: true });
  //   }
  // }, [activeConversationId, conversationId, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Container takes full height */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </div>
  );
};

export default ChatPage;
