import React, { useState, useEffect } from "react";
import Avatar from "../ui/Avatar";

const TypingIndicator = ({
  typingUsers = [],
  showAvatars = true,
  maxUsersShown = 3,
  className = "",
  size = "sm",
}) => {
  const [dotsCount, setDotsCount] = useState(1);

  // Animate the typing dots
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDotsCount((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  // Don't render if no one is typing
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const displayUsers = typingUsers.slice(0, maxUsersShown);
  const remainingCount = typingUsers.length - maxUsersShown;

  // Generate typing text
  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const user = typingUsers[0];
      const name = user.name || user.firstName || "Someone";
      return `${name} is typing`;
    } else if (typingUsers.length === 2) {
      const name1 =
        typingUsers[0].name || typingUsers[0].firstName || "Someone";
      const name2 =
        typingUsers[1].name || typingUsers[1].firstName || "Someone";
      return `${name1} and ${name2} are typing`;
    } else if (typingUsers.length === 3) {
      const name1 =
        typingUsers[0].name || typingUsers[0].firstName || "Someone";
      const name2 =
        typingUsers[1].name || typingUsers[1].firstName || "Someone";
      const name3 =
        typingUsers[2].name || typingUsers[2].firstName || "Someone";
      return `${name1}, ${name2}, and ${name3} are typing`;
    } else {
      const name1 =
        typingUsers[0].name || typingUsers[0].firstName || "Someone";
      const name2 =
        typingUsers[1].name || typingUsers[1].firstName || "Someone";
      return `${name1}, ${name2}, and ${
        typingUsers.length - 2
      } others are typing`;
    }
  };

  // Animated dots
  const AnimatedDots = () => (
    <span className="inline-flex">
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={`
            w-1 h-1 bg-gray-400 rounded-full mx-0.5 transition-opacity duration-300
            ${dotsCount >= dot ? "opacity-100" : "opacity-30"}
          `}
        />
      ))}
    </span>
  );

  // Typing bubble animation
  const TypingBubble = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-2xl px-4 py-2">
      <div className="flex space-x-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`
              w-2 h-2 bg-gray-400 rounded-full transition-all duration-500
              ${dotsCount === dot ? "animate-bounce" : ""}
            `}
            style={{
              animationDelay: `${(dot - 1) * 0.1}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}
    >
      {/* User Avatars */}
      {showAvatars && displayUsers.length > 0 && (
        <div className="flex -space-x-1">
          {displayUsers.map((user, index) => (
            <Avatar
              key={user.id || index}
              user={user}
              size="xs"
              showOnlineStatus={false}
              className="ring-2 ring-white"
            />
          ))}
          {remainingCount > 0 && (
            <div className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-white">
              +{remainingCount}
            </div>
          )}
        </div>
      )}

      {/* Typing Text with Animated Dots */}
      <div className="flex items-center space-x-1">
        <span className="italic">{getTypingText()}</span>
        <AnimatedDots />
      </div>
    </div>
  );
};

// Compact version for message bubbles
export const CompactTypingIndicator = ({
  typingUsers = [],
  className = "",
}) => {
  const [dotsCount, setDotsCount] = useState(1);

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDotsCount((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-start mb-2 ${className}`}>
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`
                w-2 h-2 bg-gray-400 rounded-full transition-all duration-500
                ${dotsCount === dot ? "animate-bounce scale-110" : "scale-100"}
              `}
              style={{
                animationDelay: `${(dot - 1) * 0.1}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Minimal version for conversation list
export const MinimalTypingIndicator = ({
  typingUsers = [],
  className = "",
}) => {
  const [dotsCount, setDotsCount] = useState(1);

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDotsCount((prev) => (prev % 3) + 1);
    }, 400);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center text-xs text-gray-400 italic ${className}`}
    >
      <span>typing</span>
      <span className="ml-1 inline-flex">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`
              w-1 h-1 bg-gray-400 rounded-full mx-0.5 transition-opacity duration-300
              ${dotsCount >= dot ? "opacity-100" : "opacity-30"}
            `}
          />
        ))}
      </span>
    </div>
  );
};

// Status bar typing indicator
export const StatusBarTypingIndicator = ({
  typingUsers = [],
  className = "",
}) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name || "Someone"} is typing...`;
    }
    return `${typingUsers.length} people are typing...`;
  };

  return (
    <div
      className={`
      text-xs text-green-600 font-medium flex items-center space-x-1
      animate-pulse ${className}
    `}
    >
      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
      <span>{getTypingText()}</span>
    </div>
  );
};

// Hook for managing typing indicators
export const useTypingIndicator = (conversationId, sendTypingStatus) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(conversationId, false);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        sendTypingStatus(conversationId, false);
      }
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
};

export default TypingIndicator;
