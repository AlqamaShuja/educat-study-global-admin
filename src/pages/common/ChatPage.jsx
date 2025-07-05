import { useState } from "react";
import ConversationList from "../../components/chat/ConversationList";
import MessageArea from "../../components/chat/MessageArea";
import useAuthStore from "../../stores/authStore";

const ChatPage = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allowedRecipients, setAllowedRecipients] = useState([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50">
      <ConversationList
        user={user}
        conversations={conversations}
        setConversations={setConversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        setMessages={setMessages}
        allowedRecipients={allowedRecipients}
        setAllowedRecipients={setAllowedRecipients}
      />
      <MessageArea
        user={user}
        messages={messages}
        setMessages={setMessages}
        selectedConversation={selectedConversation}
        allowedRecipients={allowedRecipients}
        setAllowedRecipients={setAllowedRecipients}
      />
    </div>
  );
};

export default ChatPage;
