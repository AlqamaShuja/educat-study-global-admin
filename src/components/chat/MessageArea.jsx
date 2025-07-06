import { useState, useEffect, useRef } from "react";
import { Send, User, Reply, Paperclip, Loader } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
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

      setIsLoading(true);
      try {
        let recipientId;
        if (selectedConversation.type === "conversation") {
          // Extract recipientId from conversationHash
          recipientId = selectedConversation.conversationHash
            // .split("_")
            // .find((id) => id !== user.id);
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
      } finally {
        setIsLoading(false);
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
    if (messages.length === 0) return;

    // Find unread messages for current user
    const unreadMessages = messages.filter(
      (msg) => msg.recipientId === user.id && !msg.readAt
    );

    if (unreadMessages.length > 0) {
      // Scroll to the first unread message
      const firstUnreadMessage = unreadMessages[0];
      const messageElement = messageRefs.current[firstUnreadMessage.id];
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // No unread messages, scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, user.id]);

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
        fileData = response;
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
              className="max-w-full h-auto rounded-xl shadow-sm"
              style={{ maxHeight: "200px" }}
            />
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className="text-gray-200 hover:text-gray-300 underline flex items-center gap-1 text-sm transition-colors"
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
              className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              {msg.fileName} ({(msg.fileSize / 1024).toFixed(2)} KB)
            </a>
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 text-sm transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Download {msg.fileName}
            </a>
          </>
        )}
        {msg.type === "text" && (
          <p className="leading-relaxed">{msg.content}</p>
        )}
      </div>
    );
  };

  const renderReplyPreview = (msg) => {
    if (!msg.replyToId) return null;
    const repliedMessage = messages.find((m) => m.id === msg.replyToId);
    if (!repliedMessage) return null;
    return (
      <div
        className="bg-black/5 backdrop-blur-sm p-3 rounded-lg mb-3 border-l-4 border-blue-500 cursor-pointer hover:bg-black/10 transition-colors"
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

  // Loading component
  const LoadingMessages = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading messages...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 shadow-2xl rounded-r-2xl border border-gray-200/50">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center gap-3 rounded-tr-2xl">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {selectedConversation
              ? selectedConversation?.displayName
              : "Select a conversation"}
          </h2>
          <p className="text-sm text-white/80">
            {selectedConversation ? `${selectedConversation?.recipient?.role || "-"}` : "Choose someone to chat with"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      {isLoading ? (
        <LoadingMessages />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={`flex ${
                isLeftAligned(msg) ? "justify-start" : "justify-end"
              }`}
              onClick={() =>
                msg.recipientId === user.id &&
                !msg.readAt &&
                handleMarkAsRead(msg.id)
              }
            >
              <div
                className={`group relative max-w-[70%] ${
                  isLeftAligned(msg)
                    ? "bg-white shadow-md border border-gray-200/50"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                } rounded-2xl p-4 transition-all duration-200 hover:shadow-lg`}
              >
                {renderReplyPreview(msg)}

                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {selectedConversation?.type === "conversation" && (
                      <p
                        className={`font-medium text-sm mb-1 ${
                          isLeftAligned(msg) ? "text-gray-600" : "text-white/90"
                        }`}
                      >
                        {msg.sender?.name}
                      </p>
                    )}
                    <div
                      className={`${
                        isLeftAligned(msg) ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {renderMessageContent(msg)}
                    </div>
                    <p
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        isLeftAligned(msg) ? "text-gray-500" : "text-white/70"
                      }`}
                    >
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
                    <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setReplyToMessage(msg);
                          setMessageInput("");
                        }}
                        className="p-2 bg-white shadow-lg rounded-full hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
                        title="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* {console.log(selectedConversation, "ascnasjcascjncjsc")} */}
      {/* Message Input */}
      {selectedConversation?.type === "conversation" &&
      selectedConversation?.conversationHash?.includes("_")
        ? null
        : selectedConversation
        ? ["manager", "consultant", "super_admin"].includes(user.role) && (
            <div className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-br-2xl">
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-4"
              >
                {replyToMessage && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Replying to {replyToMessage.sender?.name}
                        </p>
                        <p className="text-sm text-blue-600 truncate max-w-md">
                          {replyToMessage.content}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyToMessage(null)}
                      className="text-blue-500 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
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
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !selectedRecipient || (!messageInput.trim() && !file)
                    }
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {file && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    <p className="text-sm text-amber-800">
                      <strong>Selected file:</strong> {file.name} (
                      {(file.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </form>
            </div>
          )
        : null}
    </div>
  );
};

export default MessageArea;

// import { useState, useEffect, useRef } from "react";
// import { Send, User, Reply, Paperclip, Loader } from "lucide-react";
// import { toast } from "react-toastify";
// import messageService from "../../services/messageService";
// import socketService from "../../services/socketService";
// import { getStaticFileUrl } from "../../utils/helpers";

// const MessageArea = ({
//   user,
//   messages,
//   setMessages,
//   selectedConversation,
//   allowedRecipients,
//   setAllowedRecipients,
// }) => {
//   const [messageInput, setMessageInput] = useState("");
//   const [selectedRecipient, setSelectedRecipient] = useState(null);
//   const [replyToMessage, setReplyToMessage] = useState(null);
//   const [file, setFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const messageRefs = useRef({});

//   useEffect(() => {
//     const fetchAllowedRecipients = async () => {
//       try {
//         const response = await messageService.getAllowedRecipients();
//         setAllowedRecipients(response.data);
//         if (response.data.length === 1) {
//           setSelectedRecipient(response.data[0]);
//         }
//       } catch (error) {
//         toast.error("Failed to load recipients");
//       }
//     };

//     if (user && user.id) {
//       fetchAllowedRecipients();
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!user?.id || !selectedConversation) return;

//       setIsLoading(true);
//       try {
//         let recipientId;
//         if (selectedConversation.type === "conversation") {
//           // Extract recipientId from conversationHash
//           recipientId = selectedConversation.conversationHash
//             .split("_")
//             .find((id) => id !== user.id);
//         } else {
//           // For new conversations (recipient type)
//           recipientId = selectedConversation.id;
//         }

//         // Validate recipientId
//         if (!recipientId) {
//           throw new Error("Invalid recipient ID");
//         }

//         const response = await messageService.getMessages(recipientId);
//         setMessages(response.data);

//         // Set selected recipient
//         setSelectedRecipient(
//           selectedConversation.type === "recipient"
//             ? selectedConversation.recipient
//             : allowedRecipients.find((r) => r.id === recipientId) || null
//         );
//       } catch (error) {
//         toast.error(error.response?.data?.message || "Failed to load messages");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (user?.id && selectedConversation) {
//       fetchMessages();

//       // Socket event listeners
//       const handleNewMessage = (newMessage) => {
//         const recipientId =
//           selectedConversation.type === "conversation"
//             ? selectedConversation.conversationHash
//                 .split("_")
//                 .find((id) => id !== user.id)
//             : selectedConversation.id;

//         if (
//           (newMessage.senderId === user.id &&
//             newMessage.recipientId === recipientId) ||
//           (newMessage.recipientId === user.id &&
//             newMessage.senderId === recipientId)
//         ) {
//           setMessages((prev) => {
//             if (prev.some((msg) => msg.id === newMessage.id)) return prev;
//             return [...prev, newMessage];
//           });
//         }
//       };

//       const handleMessageRead = (data) => {
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
//           )
//         );
//       };

//       socketService.onNewMessage(handleNewMessage);
//       socketService.onMessageRead(handleMessageRead);

//       return () => {
//         socketService.onNewMessage(null);
//         socketService.onMessageRead(null);
//       };
//     }
//   }, [user, selectedConversation]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (
//       selectedConversation?.type === "conversation" &&
//       selectedConversation?.conversationHash.includes("_")
//     ) {
//       return toast.info("You can not send messages.");
//     }
//     if (!selectedRecipient || (!messageInput.trim() && !file)) return;

//     try {
//       let fileData = {};
//       if (file) {
//         const response = await messageService.uploadFile(file);
//         fileData = response.data;
//       }

//       const messageData = {
//         recipientId: selectedRecipient.id,
//         content: messageInput,
//         type: file ? fileData.mimeType.split("/")[0] : "text",
//         fileUrl: file ? fileData.fileUrl : null,
//         fileName: file ? fileData.fileName : null,
//         fileSize: file ? fileData.fileSize : null,
//         mimeType: file ? fileData.mimeType : null,
//         replyToId: replyToMessage?.id || null,
//       };

//       const response = await messageService.sendMessage(messageData);
//       setMessages((prev) => {
//         if (prev.some((msg) => msg.id === response.data.id)) return prev;
//         return [...prev, response.data];
//       });
//       setMessageInput("");
//       setFile(null);
//       setReplyToMessage(null);
//       fileInputRef.current.value = null;
//     } catch (error) {
//       toast.error("Failed to send message");
//     }
//   };

//   const handleMarkAsRead = async (messageId) => {
//     try {
//       await messageService.markMessageAsRead(messageId);
//     } catch (error) {
//       toast.error("Failed to mark message as read");
//     }
//   };

//   const isLeftAligned = (msg) => {
//     if (selectedConversation?.type === "conversation") {
//       const splitted = selectedConversation?.conversationHash.split("_");
//       if (splitted[0] == msg.senderId) return true;
//       if (splitted[1] == msg.recipientId) return true;
//       if (user.role === "super_admin") {
//         return msg.sender.role === "student";
//       }
//       return msg.senderId !== user.id;
//     }
//     return msg.senderId !== user.id;
//   };

//   const formatDateTime = (date) => {
//     return new Date(date).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const renderMessageContent = (msg) => {
//     return (
//       <div className="flex flex-col gap-2">
//         {msg.type === "image" && (
//           <>
//             <img
//               src={getStaticFileUrl(msg.fileUrl)}
//               alt={msg.fileName}
//               className="max-w-full h-auto rounded-xl shadow-sm"
//               style={{ maxHeight: "200px" }}
//             />
//             <a
//               href={getStaticFileUrl(msg.fileUrl)}
//               download={msg.fileName}
//               className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 text-sm transition-colors"
//             >
//               <Paperclip className="w-4 h-4" />
//               Download {msg.fileName} ({(msg.fileSize / 1024).toFixed(2)} KB)
//             </a>
//           </>
//         )}
//         {msg.type === "file" && (
//           <>
//             <a
//               href={getStaticFileUrl(msg.fileUrl)}
//               download={msg.fileName}
//               className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 transition-colors"
//             >
//               <Paperclip className="w-4 h-4" />
//               {msg.fileName} ({(msg.fileSize / 1024).toFixed(2)} KB)
//             </a>
//             <a
//               href={getStaticFileUrl(msg.fileUrl)}
//               download={msg.fileName}
//               className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 text-sm transition-colors"
//             >
//               <Paperclip className="w-4 h-4" />
//               Download {msg.fileName}
//             </a>
//           </>
//         )}
//         {msg.type === "text" && (
//           <p className="leading-relaxed">{msg.content}</p>
//         )}
//       </div>
//     );
//   };

//   const renderReplyPreview = (msg) => {
//     if (!msg.replyToId) return null;
//     const repliedMessage = messages.find((m) => m.id === msg.replyToId);
//     if (!repliedMessage) return null;
//     return (
//       <div
//         className="bg-black/5 backdrop-blur-sm p-3 rounded-lg mb-3 border-l-4 border-blue-500 cursor-pointer hover:bg-black/10 transition-colors"
//         onClick={() => {
//           const parentMessage = messageRefs.current[msg.replyToId];
//           if (parentMessage) {
//             parentMessage.scrollIntoView({
//               behavior: "smooth",
//               block: "center",
//             });
//           }
//         }}
//       >
//         <p className="text-sm text-gray-600">
//           Replying to {repliedMessage.sender?.name}:{" "}
//           {repliedMessage.content?.length > 30
//             ? repliedMessage.content?.slice(0, 27) + "..."
//             : repliedMessage.content}
//         </p>
//       </div>
//     );
//   };

//   // Loading component
//   const LoadingMessages = () => (
//     <div className="flex-1 flex items-center justify-center">
//       <div className="flex flex-col items-center gap-3 text-gray-500">
//         <Loader className="w-8 h-8 animate-spin" />
//         <p className="text-sm">Loading messages...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 shadow-2xl rounded-r-2xl border border-gray-200/50">
//       {/* Header */}
//       <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center gap-3 rounded-tr-2xl">
//         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//           <User className="w-5 h-5" />
//         </div>
//         <div>
//           <h2 className="text-lg font-semibold">
//             {selectedConversation
//               ? selectedConversation?.displayName
//               : "Select a conversation"}
//           </h2>
//           <p className="text-sm text-white/80">
//             {selectedConversation ? "Online" : "Choose someone to chat with"}
//           </p>
//         </div>
//       </div>

//       {/* Messages Area */}
//       {isLoading ? (
//         <LoadingMessages />
//       ) : (
//         <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/50">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               ref={(el) => (messageRefs.current[msg.id] = el)}
//               className={`flex ${
//                 isLeftAligned(msg) ? "justify-start" : "justify-end"
//               }`}
//               onClick={() =>
//                 msg.recipientId === user.id &&
//                 !msg.readAt &&
//                 handleMarkAsRead(msg.id)
//               }
//             >
//               <div
//                 className={`group relative max-w-[70%] ${
//                   isLeftAligned(msg)
//                     ? "bg-white shadow-md border border-gray-200/50"
//                     : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
//                 } rounded-2xl p-4 transition-all duration-200 hover:shadow-lg`}
//               >
//                 {renderReplyPreview(msg)}

//                 <div className="flex items-start gap-3">
//                   <div className="flex-1">
//                     {selectedConversation?.type === "conversation" && (
//                       <p
//                         className={`font-medium text-sm mb-1 ${
//                           isLeftAligned(msg) ? "text-gray-600" : "text-white/90"
//                         }`}
//                       >
//                         {msg.sender?.name}
//                       </p>
//                     )}
//                     <div
//                       className={`${
//                         isLeftAligned(msg) ? "text-gray-800" : "text-white"
//                       }`}
//                     >
//                       {renderMessageContent(msg)}
//                     </div>
//                     <p
//                       className={`text-xs mt-2 flex items-center gap-1 ${
//                         isLeftAligned(msg) ? "text-gray-500" : "text-white/70"
//                       }`}
//                     >
//                       {formatDateTime(msg.createdAt)}
//                       {/* <span className="inline-flex items-center">
//                         {msg.readAt ? (
//                           <svg
//                             className="w-4 h-4 fill-blue-600"
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M1.73 12.91l6.37 6.37L22.79 4.59" />
//                             <path d="M12 16.79l2.37-2.37" />
//                           </svg>
//                         ) : (
//                           <svg
//                             className="w-4 h-4 fill-gray-500"
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M1.73 12.91l6.37 6.37L22.79 4.59" />
//                           </svg>
//                         )}
//                       </span> */}
//                     </p>
//                   </div>

//                   {["student", "consultant"].includes(user.role) && (
//                     <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <button
//                         onClick={() => {
//                           setReplyToMessage(msg);
//                           setMessageInput("");
//                         }}
//                         className="p-2 bg-white shadow-lg rounded-full hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
//                         title="Reply"
//                       >
//                         <Reply className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//       )}

//       {/* Message Input */}
//       {selectedConversation?.type === "conversation" &&
//       selectedConversation?.conversationHash?.includes("_")
//         ? null
//         : selectedConversation
//         ? ["manager", "consultant", "super_admin"].includes(user.role) && (
//             <div className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-br-2xl">
//               <form
//                 onSubmit={handleSendMessage}
//                 className="flex flex-col gap-4"
//               >
//                 {replyToMessage && (
//                   <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
//                       <div>
//                         <p className="text-sm font-medium text-blue-800">
//                           Replying to {replyToMessage.sender?.name}
//                         </p>
//                         <p className="text-sm text-blue-600 truncate max-w-md">
//                           {replyToMessage.content}
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setReplyToMessage(null)}
//                       className="text-blue-500 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}

//                 <div className="flex gap-3">
//                   <input
//                     type="text"
//                     value={messageInput}
//                     onChange={(e) => setMessageInput(e.target.value)}
//                     placeholder="Type your message..."
//                     className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
//                   />
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={(e) => setFile(e.target.files[0])}
//                     accept="image/*,.pdf,.doc,.docx"
//                     className="hidden"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current.click()}
//                     className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
//                   >
//                     <Paperclip className="w-5 h-5" />
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={
//                       !selectedRecipient || (!messageInput.trim() && !file)
//                     }
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 </div>

//                 {file && (
//                   <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
//                     <p className="text-sm text-amber-800">
//                       <strong>Selected file:</strong> {file.name} (
//                       {(file.size / 1024).toFixed(2)} KB)
//                     </p>
//                   </div>
//                 )}
//               </form>
//             </div>
//           )
//         : null}
//     </div>
//   );
// };

// export default MessageArea;
