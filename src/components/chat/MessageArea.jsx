import { useState, useEffect, useRef } from "react";
import { Send, User, Reply, Paperclip } from "lucide-react";
import { toast } from "react-toastify";
import messageService from "../../services/messageService";
import socketService from "../../services/socketService";
import { getStaticFileUrl } from "../../utils/helpers";

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
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageRefs = useRef({});

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

    if (user && user.id) {
      fetchAllowedRecipients();
    }
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id || !selectedConversation) return;

      try {
        let recipientId;
        if (selectedConversation.type === "conversation") {
          // Extract recipientId from conversationHash
          recipientId = selectedConversation.conversationHash
            .split("_")
            .find((id) => id !== user.id);
        } else {
          // For new conversations (recipient type)
          recipientId = selectedConversation.id;
        }

        // Validate recipientId
        if (!recipientId) {
          throw new Error("Invalid recipient ID");
        }

        const response = await messageService.getMessages(recipientId);
        setMessages(response.data);

        // Set selected recipient
        setSelectedRecipient(
          selectedConversation.type === "recipient"
            ? selectedConversation.recipient
            : allowedRecipients.find((r) => r.id === recipientId) || null
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    };

    if (user?.id && selectedConversation) {
      fetchMessages();

      // Socket event listeners
      const handleNewMessage = (newMessage) => {
        const recipientId =
          selectedConversation.type === "conversation"
            ? selectedConversation.conversationHash
                .split("_")
                .find((id) => id !== user.id)
            : selectedConversation.id;

        if (
          (newMessage.senderId === user.id &&
            newMessage.recipientId === recipientId) ||
          (newMessage.recipientId === user.id &&
            newMessage.senderId === recipientId)
        ) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      };

      const handleMessageRead = (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
          )
        );
      };

      socketService.onNewMessage(handleNewMessage);
      socketService.onMessageRead(handleMessageRead);

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
    if (
      selectedConversation?.type === "conversation" &&
      selectedConversation?.conversationHash.includes("_")
    ) {
      return toast.info("You can not send messages.");
    }
    if (!selectedRecipient || (!messageInput.trim() && !file)) return;

    try {
      let fileData = {};
      if (file) {
        const response = await messageService.uploadFile(file);
        fileData = response.data;
      }

      const messageData = {
        recipientId: selectedRecipient.id,
        content: messageInput,
        type: file ? fileData.mimeType.split("/")[0] : "text",
        fileUrl: file ? fileData.fileUrl : null,
        fileName: file ? fileData.fileName : null,
        fileSize: file ? fileData.fileSize : null,
        mimeType: file ? fileData.mimeType : null,
        replyToId: replyToMessage?.id || null,
      };

      const response = await messageService.sendMessage(messageData);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      setMessageInput("");
      setFile(null);
      setReplyToMessage(null);
      fileInputRef.current.value = null;
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

  const isLeftAligned = (msg) => {
    if (selectedConversation?.type === "conversation") {
      const splitted = selectedConversation?.conversationHash.split("_");
      if (splitted[0] == msg.senderId) return true;
      if (splitted[1] == msg.recipientId) return true;
      if (user.role === "super_admin") {
        return msg.sender.role === "student";
      }
      return msg.senderId !== user.id;
    }
    return msg.senderId !== user.id;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessageContent = (msg) => {
    return (
      <div className="flex flex-col gap-2">
        {msg.type === "image" && (
          <>
            <img
              src={getStaticFileUrl(msg.fileUrl)}
              alt={msg.fileName}
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: "200px" }}
            />
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className="text-blue-600 underline flex items-center gap-1 text-sm"
            >
              <Paperclip className="w-4 h-4" />
              Download {msg.fileName} ({(msg.fileSize / 1024).toFixed(2)} KB)
            </a>
          </>
        )}
        {msg.type === "file" && (
          <>
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className="text-blue-600 underline flex items-center gap-1"
            >
              <Paperclip className="w-4 h-4" />
              {msg.fileName} ({(msg.fileSize / 1024).toFixed(2)} KB)
            </a>
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className="text-blue-600 underline flex items-center gap-1 text-sm"
            >
              <Paperclip className="w-4 h-4" />
              Download {msg.fileName}
            </a>
          </>
        )}
        {msg.type === "text" && <p className="font-medium">{msg.content}</p>}
      </div>
    );
  };

  const renderReplyPreview = (msg) => {
    if (!msg.replyToId) return null;
    const repliedMessage = messages.find((m) => m.id === msg.replyToId);
    if (!repliedMessage) return null;
    return (
      <div
        className="bg-gray-100 p-2 rounded-lg mb-2 border-l-4 border-blue-500 cursor-pointer hover:bg-gray-200"
        onClick={() => {
          const parentMessage = messageRefs.current[msg.replyToId];
          if (parentMessage) {
            parentMessage.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }}
      >
        <p className="text-sm text-gray-600">
          Replying to {repliedMessage.sender?.name}:{" "}
          {repliedMessage.content?.length > 30
            ? repliedMessage.content?.slice(0, 27) + "..."
            : repliedMessage.content}
        </p>
      </div>
    );
  };


  return (
    <div className="flex-1 flex flex-col bg-white shadow-xl rounded-r-lg">
      <div className="p-4 bg-purple-600 text-purple-100 flex items-center gap-2">
        <User className="w-6 h-6-6" />
        <h2 className="text-xl font-bold">
          {selectedConversation
            ? selectedConversation?.displayName
            : "Select a conversation"}
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <li
            key={msg.id}
            ref={(el) => (messageRefs.current[msg.id] = el)}
            className={`p-3 rounded-lg max-w-[70%] group relative ${
              isLeftAligned(msg)
                ? "mr-auto bg-purple-100 text-purple-900"
                : "ml-auto bg-blue-100 text-blue-900"
            }`}
            onClick={() =>
              msg.recipientId === user.id &&
              !msg.readAt &&
              handleMarkAsRead(msg.id)
            }
          >
            {renderReplyPreview(msg)}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {selectedConversation?.type === "conversation" && (
                  <p className="font-semibold">{msg.sender?.name}</p>
                )}
                {renderMessageContent(msg)}
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {formatDateTime(msg.createdAt)}
                  {/* <span className="inline-flex items-center">
                    {msg.readAt ? (
                      <svg
                        className="w-4 h-4 fill-blue-600"
                        viewBox="0 0 24 24"
                      >
                        <path d="M1.73 12.91l6.37 6.37L22.79 4.59" />
                        <path d="M12 16.79l2.37-2.37" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 fill-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M1.73 12.91l6.37 6.37L22.79 4.59" />
                      </svg>
                    )}
                  </span> */}
                </p>
              </div>
              {["student", "consultant"].includes(user.role) && (
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-2">
                  <button
                    onClick={() => {
                      setReplyToMessage(msg);
                      setMessageInput("");
                    }}
                    className="p-1 hover:bg-blue-200 rounded"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      {selectedConversation?.type === "conversation" &&
      selectedConversation?.conversationHash?.includes("_")
        ? null
        : selectedConversation
        ? ["manager", "consultant", "super_admin"].includes(user.role) && (
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-blue-200 flex flex-col gap-3 bg-white"
            >
              {replyToMessage && (
                <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Replying to {replyToMessage.sender?.name}:{" "}
                    {replyToMessage.content}
                  </p>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2.5 border border-blue-200 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="p-2.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 text-blue-100 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={
                    !selectedRecipient || (!messageInput.trim() && !file)
                  }
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {file && (
                <p className="text-sm text-gray-600">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)}{" "}
                  KB)
                </p>
              )}
            </form>
          )
        : null}
    </div>
  );
};

export default MessageArea;