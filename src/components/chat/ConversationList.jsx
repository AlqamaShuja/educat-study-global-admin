import React, { useState, useEffect } from "react";
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
  const [selectedId, setSelectedId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

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
      fetchConversations();
      fetchAllowedRecipients();
      fetchUnreadCounts();

      socketService.onNewMessage((newMessage) => {
        // Only react to messages where the user is the sender or recipient
        console.log(newMessage, "ascsancjanjsncsajs", user);

        if (
          newMessage.senderId === user.id ||
          newMessage.recipientId === user.id
        ) {
          fetchConversations();
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
    // Don’t start a timer for non-recipient conversations
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


  return (
    <div className="w-1/4 bg-white shadow-xl rounded-l-lg border-r border-blue-200">
      <div className="p-4 bg-blue-600 text-blue-100 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <ul className="h-[calc(100vh-8rem)] overflow-y-auto">
        {allItems.map((item) => {
          const conversationHash = `${[item?.id, user?.id].sort().join("_")}`;
          return (
            <li
              key={item.id}
              onClick={() => handleSelectConversation(item)}
              className={`p-4 cursor-pointer border-b border-blue-100 hover:bg-blue-50 transition-colors ${
                selectedId === item.id ? "bg-blue-100" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-blue-900 flex items-center gap-2">
                  {item.type === "recipient" && <User className="w-4 h-4" />}
                  {item.displayName}
                </p>
                {/* {item.type === "conversation" && unreadCounts[item.id] > 0 && ( */}
                {unreadCounts[conversationHash] > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {unreadCounts[conversationHash]}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
