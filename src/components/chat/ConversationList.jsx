"use strict";

import React, { useEffect } from "react";
import { MessageSquare, User } from "lucide-react";
import { toast } from "react-toastify";
import messageService from "../../services/messageService";
import socketService from "../../services/socketService";

const ConversationList = ({
  user,
  conversations,
  setConversations,
  selectedConversation,
  setSelectedConversation,
  setMessages,
  allowedRecipients,
  setAllowedRecipients,
}) => {
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messageService.getConversations();
        setConversations(response.data);
      } catch (error) {
        toast.error("Failed to load conversations");
      }
    };

    const fetchAllowedRecipients = async () => {
      try {
        const response = await messageService.getAllowedRecipients();
        setAllowedRecipients(response.data);
      } catch (error) {
        toast.error("Failed to load recipients");
      }
    };

    if (user && user.id) {
      fetchConversations();
      fetchAllowedRecipients();

      socketService.onNewMessage((newMessage) => {
        if (
          newMessage.senderId === user.id ||
          newMessage.recipientId === user.id ||
          user.role === "super_admin"
        ) {
          fetchConversations();
        }
      });
    }
  }, [user]);

  const handleSelectConversation = async (item) => {
    setSelectedConversation(item);
    try {
      const otherUserId = item.conversationHash
        ? item.conversationHash.split("_").find((id) => id !== user.id)
        : item.id;
      const response = await messageService.getMessages(otherUserId);
      setMessages(response.data);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  // Combine conversations and allowed recipients, avoiding duplicates
  const allItems = [
    ...conversations.map((conv) => ({
      ...conv,
      type: "conversation",
      id: conv.conversationHash,
    })),
    ...allowedRecipients
      .filter(
        (recipient) =>
          !conversations.some(
            (conv) =>
              conv.conversationHash.includes(recipient.id) &&
              conv.conversationHash.includes(user.id)
          )
      )
      .map((recipient) => ({
        id: recipient.id,
        displayName: recipient.name,
        type: "recipient",
        recipient,
      })),
  ].sort((a, b) => {
    const aDate = a.lastMessage
      ? new Date(a.lastMessage.createdAt)
      : new Date(0);
    const bDate = b.lastMessage
      ? new Date(b.lastMessage.createdAt)
      : new Date(0);
    return bDate - aDate;
  });

  return (
    <div className="w-1/4 bg-white shadow-xl rounded-l-lg border-r border-blue-200">
      <div className="p-4 bg-blue-600 text-blue-100 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <ul className="h-[calc(100vh-8rem)] overflow-y-auto">
        {allItems.map((item) => (
          <li
            key={item.id}
            onClick={() => handleSelectConversation(item)}
            className={`p-4 cursor-pointer border-b border-blue-100 hover:bg-blue-50 transition-colors ${
              selectedConversation?.id === item.id ? "bg-blue-100" : ""
            }`}
          >
            <p className="font-semibold text-blue-900 flex items-center gap-2">
              {item.type === "recipient" && <User className="w-4 h-4" />}
              {item.displayName}
            </p>
            {item.lastMessage && (
              <p className="text-sm text-blue-600 truncate">
                {item.lastMessage.content || "No messages yet"}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
