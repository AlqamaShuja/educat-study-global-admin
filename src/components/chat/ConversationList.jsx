import React, { useState, useEffect } from "react";
import { MessageSquare, User, Search } from "lucide-react";
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
  const [selectedId, setSelectedId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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

    const fetchUnreadCounts = async () => {
      try {
        const response = await messageService.getUnreadMessageCount();
        const counts = response.data.reduce(
          (acc, { conversationHash, unreadCount }) => ({
            ...acc,
            [conversationHash]: unreadCount,
          }),
          {}
        );
        setUnreadCounts(counts);
      } catch (error) {
        toast.error("Failed to load unread message counts");
      }
    };

    if (user && user.id) {
      if (user?.role === "super_admin") {
        fetchConversations();
      }
      fetchAllowedRecipients();
      fetchUnreadCounts();

      socketService.onNewMessage((newMessage) => {
        // Only react to messages where the user is the sender or recipient
        console.log(newMessage, "ascsancjanjsncsajs", user);

        if (
          newMessage.senderId === user.id ||
          newMessage.recipientId === user.id
        ) {
          if (user?.role === "super_admin") {
            fetchConversations();
          }
          // Incrementally update unread count for the specific conversation

          console.log(
            newMessage.recipientId === user.id &&
              selectedConversation?.conversationHash !==
                newMessage.conversationHash,
            "sacnascjascnanasnacs"
          );

          if (
            newMessage.recipientId === user.id &&
            selectedConversation?.conversationHash !==
              newMessage.conversationHash
          ) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMessage.conversationHash]:
                (prev[newMessage.conversationHash] || 0) + 1,
            }));
          }
        } else if (user.role === "super_admin") {
          // For super_admin, check if the message is in a monitored conversation
          const relevantIds = allowedRecipients.map((r) => r.id);
          if (
            newMessage.conversationHash.includes(user.id) ||
            relevantIds.includes(newMessage.senderId) ||
            relevantIds.includes(newMessage.recipientId)
          ) {
            fetchConversations();
            if (
              selectedConversation?.conversationHash !==
              newMessage.conversationHash
            ) {
              setUnreadCounts((prev) => ({
                ...prev,
                [newMessage.conversationHash]:
                  (prev[newMessage.conversationHash] || 0) + 1,
              }));
            }
          }
        }
      });

      socketService.onMessageRead((data) => {
        if (data.recipientId === user.id) {
          fetchUnreadCounts();
        }
      });

      return () => {
        socketService.onNewMessage(null);
        socketService.onMessageRead(null);
      };
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    // Don't start a timer for non-recipient conversations
    if (selectedConversation?.type !== "recipient") return;

    // Build the hash once per effect run
    const conversationHash = [selectedConversation.id, user?.id]
      .sort()
      .join("_");

    // What we want to run every 5 s
    const tick = async () => {
      try {
        const resp = await messageService.markConversationMessagesAsRead(
          conversationHash
        );
        console.log(resp, "sacsancsjacnsascn");

        setUnreadCounts((prev) => ({
          ...prev,
          [conversationHash]: 0,
        }));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    };

    tick();

    // Then every 5 s
    const id = setInterval(tick, 5000);

    // Cleanup
    return () => clearInterval(id);
  }, [selectedConversation, user?.id]);

  const handleSelectConversation = async (item) => {
    console.log(item, "sanasjcasjcasjcns");

    setSelectedConversation(item);
    setSelectedId(item.id);
    setMessages([]);

    if (item.type === "conversation") {
      const conversationHash = item.conversationHash;
      try {
        // Fetch messages
        const recipientId = conversationHash
          .split("_")
          .find((id) => id !== user.id);
        const response = await messageService.getMessages(recipientId);
        setMessages(response.data);

        // Mark all messages as read
        // await messageService.markConversationMessagesAsRead(conversationHash);

        // Reset unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationHash]: 0,
        }));

        // Refresh unread counts to ensure consistency
        const responseUnread = await messageService.getUnreadMessageCount();
        // const counts = responseUnread.data.reduce(
        //   (acc, { conversationHash, unreadCount }) => ({
        //     ...acc,
        //     [conversationHash]: unreadCount,
        //   }),
        //   {}
        // );
        // setUnreadCounts(counts);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    } else {
      const conversationHash = `${[item?.id, user?.id].sort().join("_")}`;
      const resp = await messageService.markConversationMessagesAsRead(
        conversationHash
      );
      console.log(resp, "sacsancsjacnsascn");
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationHash]: 0,
      }));
    }
  };

  const allItems = [
    ...conversations.map((conv) => ({
      ...conv,
      type: "conversation",
      id: conv.conversationHash,
    })),
    ...allowedRecipients
      .filter(
        (recipient) =>
          recipient.id !== user.id &&
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

  console.log(allItems, "ascakcnasnsacnasnca", conversations);

  // Filter items based on search query
  const filteredItems = allItems.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessagePreview = (item) => {
    console.log(item, "acnajsnasncjsanc");
    if (item.recipient && item.recipient?.role) return item.recipient?.role;
    if (!item.lastMessage) return "No messages yet";
    const content = item.lastMessage.content;
    return content.length > 40 ? content.substring(0, 40) + "..." : content;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="w-80 bg-white shadow-2xl rounded-l-2xl border border-gray-200/50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-tl-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-sm text-white/80">
              {filteredItems.length} conversations
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const conversationHash = `${[item?.id, user?.id].sort().join("_")}`;
            const unreadCount = unreadCounts[conversationHash] || 0;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectConversation(item)}
                className={`p-4 cursor-pointer border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  selectedId === item.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      item.type === "recipient"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-purple-500 to-pink-600"
                    }`}
                  >
                    {item.type === "recipient" && <User className="w-5 h-5" />}
                    {item.type === "conversation" &&
                      item.displayName.charAt(0).toUpperCase()}

                    {/* Online indicator */}
                    {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div> */}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate text-sm">
                        {item.displayName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {item.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(item.lastMessage.createdAt)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 truncate">
                      {getLastMessagePreview(item)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
