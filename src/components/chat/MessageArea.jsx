"use strict";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { toast } from "react-toastify";
import messageService from "../../services/messageService";
import socketService from "../../services/socketService";

const MessageArea = ({
  user,
  messages,
  setMessages,
  selectedConversation,
  allowedRecipients,
  setAllowedRecipients,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchAllowedRecipients = async () => {
      try {
        const response = await messageService.getAllowedRecipients();
        setAllowedRecipients(response.data);
        if (response.data.length === 1) {
          setSelectedRecipient(response.data[0]);
        }
      } catch (error) {
        toast.error("Failed to load recipients");
      }
    };

    const fetchMessages = async () => {
      if (!user.id || !selectedConversation) return;
      try {
        const otherUserId = selectedConversation.conversationHash
          ? selectedConversation.conversationHash
              .split("_")
              .find((id) => id !== user.id)
          : selectedConversation.id;
        const response = await messageService.getMessages(otherUserId);
        setMessages(response.data);
        setSelectedRecipient(
          allowedRecipients.find((r) => r.id === otherUserId) ||
            selectedConversation.recipient ||
            null
        );
      } catch (error) {
        toast.error("Failed to load messages");
      }
    };

    if (user && user.id) {
      fetchAllowedRecipients();
      if (selectedConversation) {
        fetchMessages();
      }

      socketService.onNewMessage((newMessage) => {
        const otherUserId = selectedConversation?.conversationHash
          ? selectedConversation.conversationHash
              .split("_")
              .find((id) => id !== user.id)
          : selectedConversation?.id;
        if (
          newMessage.senderId === user.id ||
          newMessage.recipientId === user.id ||
          (user.role === "super_admin" &&
            (newMessage.senderId === otherUserId ||
              newMessage.recipientId === otherUserId))
        ) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      });

      socketService.onMessageRead((data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
          )
        );
      });

      return () => {
        socketService.onNewMessage(null);
        socketService.onMessageRead(null);
      };
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRecipient) return;

    try {
      const response = await messageService.sendMessage({
        recipientId: selectedRecipient.id,
        content: messageInput,
      });
      console.log(response, "acnascajssacjncans");
      
      // Directly display the sent message from the API response
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === response?.data?.id)) return prev;
        return [...prev, response?.data];
      });
      setMessageInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messageService.markMessageAsRead(messageId);
    } catch (error) {
      toast.error("Failed to mark message as read");
    }
  };

  const createConversationHash = (senderId, recipientId) => {
    const ids = [senderId, recipientId].sort();
    return `${ids[0]}_${ids[1]}`;
  };

  const isLeftAligned = (msg) => {
    if (["super_admin", "manager"].includes(user.role)) {
      return msg.sender.role === "student";
    }
    return msg.senderId === user.id;
  };

  return (
    <div className="flex-1 flex flex-col bg-white shadow-xl rounded-r-lg">
      <div className="p-4 bg-purple-600 text-purple-100 flex items-center gap-2">
        <User className="w-6 h-6" />
        <h2 className="text-xl font-bold">
          {selectedConversation
            ? selectedConversation.displayName
            : "Select a conversation"}
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`p-3 rounded-lg max-w-[70%] ${
              isLeftAligned(msg)
                ? "mr-auto bg-blue-100 text-blue-900"
                : "ml-auto bg-purple-100 text-purple-900"
            }`}
            onClick={() =>
              msg.recipientId === user.id &&
              !msg.readAt &&
              handleMarkAsRead(msg.id)
            }
          >
            <p className="font-medium">
              {/* {msg.sender?.name}:  */}
              {msg?.content}
            </p>
            {msg.readAt && (
              <p className="text-xs text-blue-600 mt-1">
                Read at {new Date(msg.readAt).toLocaleTimeString()}
              </p>
            )}
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      {["student", "consultant"].includes(user.role) && (
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-blue-200 flex gap-3 bg-white"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2.5 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-600 text-blue-100 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!selectedRecipient || !messageInput.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
};

export default MessageArea;
