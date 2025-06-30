// src/utils/messageUtils.js

/**
 * Format timestamp for display
 * @param {string|Date} timestamp - Timestamp to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted timestamp
 */
export const formatTimestamp = (timestamp, options = {}) => {
  if (!timestamp) return "";

  const {
    format = "smart", // 'smart', 'short', 'long', 'relative'
    includeTime = true,
    includeDate = true,
  } = options;

  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() ===
    date.toDateString();
  const isThisWeek = now - date < 7 * 24 * 60 * 60 * 1000;
  const isThisYear = date.getFullYear() === now.getFullYear();

  switch (format) {
    case "smart":
      if (isToday && includeTime) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (isYesterday) {
        return includeTime
          ? `Yesterday ${date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Yesterday";
      } else if (isThisWeek) {
        return includeTime
          ? `${date.toLocaleDateString([], {
              weekday: "short",
            })} ${date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : date.toLocaleDateString([], { weekday: "long" });
      } else if (isThisYear) {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
        });
      } else {
        return date.toLocaleDateString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
        });
      }

    case "short":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    case "long":
      return date.toLocaleString();

    case "relative":
      return getRelativeTimeString(date);

    default:
      return date.toLocaleString();
  }
};

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param {Date} date - Date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

/**
 * Format message content for display
 * @param {Object} message - Message object
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted content
 */
export const formatMessageContent = (message, options = {}) => {
  if (!message) return "";

  const { maxLength = null, showSender = true, includeEmoji = true } = options;

  let content = "";

  // Add sender prefix if requested
  if (showSender && message.sender) {
    const senderName = message.sender.name || "Unknown";
    content += `${senderName}: `;
  }

  // Format content based on message type
  switch (message.type) {
    case "text":
      content += message.content || "";
      break;

    case "image":
      content += includeEmoji ? "📷 Photo" : "Photo";
      if (message.content) content += ` - ${message.content}`;
      break;

    case "video":
      content += includeEmoji ? "🎥 Video" : "Video";
      if (message.content) content += ` - ${message.content}`;
      break;

    case "audio":
      content += includeEmoji ? "🎵 Audio" : "Audio message";
      if (message.content) content += ` - ${message.content}`;
      break;

    case "file":
      const fileName = message.fileName || "File";
      content += includeEmoji ? `📎 ${fileName}` : fileName;
      if (message.content) content += ` - ${message.content}`;
      break;

    default:
      content += message.content || "Message";
  }

  // Truncate if maxLength is specified
  if (maxLength && content.length > maxLength) {
    content = content.substring(0, maxLength - 3) + "...";
  }

  return content;
};

/**
 * Extract mentions from message content
 * @param {string} content - Message content
 * @returns {Array} - Array of mentioned user IDs
 */
export const extractMentions = (content) => {
  if (!content) return [];

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      name: match[1],
      userId: match[2],
    });
  }

  return mentions;
};

/**
 * Format mentions in message content for display
 * @param {string} content - Message content with mentions
 * @param {Array} users - Array of user objects for lookup
 * @returns {string} - Formatted content
 */
export const formatMentions = (content, users = []) => {
  if (!content) return "";

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;

  return content.replace(mentionRegex, (match, name, userId) => {
    const user = users.find((u) => u.id === userId);
    const displayName = user ? user.name : name;
    return `@${displayName}`;
  });
};

/**
 * Parse URLs from message content
 * @param {string} content - Message content
 * @returns {Array} - Array of URL objects
 */
export const extractUrls = (content) => {
  if (!content) return [];

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    urls.push({
      url: match[1],
      start: match.index,
      end: match.index + match[1].length,
    });
  }

  return urls;
};

/**
 * Format URLs in content to be clickable
 * @param {string} content - Message content
 * @returns {string} - Content with formatted URLs
 */
export const formatUrls = (content) => {
  if (!content) return "";

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return content.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
  });
};

/**
 * Sanitize message content
 * @param {string} content - Message content
 * @returns {string} - Sanitized content
 */
export const sanitizeContent = (content) => {
  if (!content) return "";

  // Basic HTML sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
};

/**
 * Group messages by date
 * @param {Array} messages - Array of message objects
 * @returns {Array} - Array of grouped message objects
 */
export const groupMessagesByDate = (messages) => {
  if (!messages || messages.length === 0) return [];

  const grouped = [];
  let currentDate = null;
  let currentGroup = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt).toDateString();

    if (messageDate !== currentDate) {
      // Add date separator
      grouped.push({
        type: "date",
        date: message.createdAt,
        id: `date-${messageDate}`,
      });

      currentDate = messageDate;
      currentGroup = null;
    }

    // Group consecutive messages from same sender
    const shouldGroup =
      currentGroup &&
      currentGroup.senderId === message.senderId &&
      new Date(message.createdAt) - new Date(currentGroup.lastMessageTime) <
        5 * 60 * 1000; // 5 minutes

    if (shouldGroup) {
      currentGroup.messages.push(message);
      currentGroup.lastMessageTime = message.createdAt;
    } else {
      currentGroup = {
        type: "messageGroup",
        senderId: message.senderId,
        sender: message.sender,
        messages: [message],
        lastMessageTime: message.createdAt,
        id: `group-${message.id}`,
      };
      grouped.push(currentGroup);
    }
  });

  return grouped;
};

/**
 * Search messages by content
 * @param {Array} messages - Array of messages to search
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} - Array of matching messages
 */
export const searchMessages = (messages, query, options = {}) => {
  if (!query || !messages) return [];

  const {
    caseSensitive = false,
    includeContent = true,
    includeSender = true,
    includeFiles = true,
    maxResults = 100,
  } = options;

  const searchTerm = caseSensitive ? query : query.toLowerCase();
  const results = [];

  for (const message of messages) {
    if (results.length >= maxResults) break;

    let matches = false;

    // Search in content
    if (includeContent && message.content) {
      const content = caseSensitive
        ? message.content
        : message.content.toLowerCase();
      if (content.includes(searchTerm)) {
        matches = true;
      }
    }

    // Search in sender name
    if (includeSender && message.sender?.name) {
      const senderName = caseSensitive
        ? message.sender.name
        : message.sender.name.toLowerCase();
      if (senderName.includes(searchTerm)) {
        matches = true;
      }
    }

    // Search in file names
    if (includeFiles && message.fileName) {
      const fileName = caseSensitive
        ? message.fileName
        : message.fileName.toLowerCase();
      if (fileName.includes(searchTerm)) {
        matches = true;
      }
    }

    if (matches) {
      results.push({
        ...message,
        searchRelevance: calculateSearchRelevance(
          message,
          searchTerm,
          caseSensitive
        ),
      });
    }
  }

  // Sort by relevance
  return results.sort((a, b) => b.searchRelevance - a.searchRelevance);
};

/**
 * Calculate search relevance score
 * @param {Object} message - Message object
 * @param {string} searchTerm - Search term
 * @param {boolean} caseSensitive - Case sensitive search
 * @returns {number} - Relevance score
 */
const calculateSearchRelevance = (message, searchTerm, caseSensitive) => {
  let score = 0;
  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  // Exact match in content
  if (message.content) {
    const content = caseSensitive
      ? message.content
      : message.content.toLowerCase();
    if (content === term) score += 100;
    else if (content.includes(term)) score += 50;
  }

  // Match in sender name
  if (message.sender?.name) {
    const senderName = caseSensitive
      ? message.sender.name
      : message.sender.name.toLowerCase();
    if (senderName.includes(term)) score += 25;
  }

  // Recent messages get higher scores
  const messageAge = Date.now() - new Date(message.createdAt).getTime();
  const daysSinceMessage = messageAge / (1000 * 60 * 60 * 24);
  score += Math.max(0, 20 - daysSinceMessage); // Up to 20 points for recent messages

  return score;
};

/**
 * Validate message content
 * @param {string} content - Message content
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateMessageContent = (content, options = {}) => {
  const {
    maxLength = 4000,
    minLength = 1,
    allowEmpty = false,
    allowHTML = false,
  } = options;

  const errors = [];
  const warnings = [];

  if (!content && !allowEmpty) {
    errors.push("Message content cannot be empty");
  }

  if (content) {
    if (content.length < minLength) {
      errors.push(`Message must be at least ${minLength} characters long`);
    }

    if (content.length > maxLength) {
      errors.push(`Message cannot exceed ${maxLength} characters`);
    }

    // Check for potentially harmful content
    if (!allowHTML && /<[^>]+>/.test(content)) {
      warnings.push("HTML tags detected in message");
    }

    // Check for excessive mentions
    const mentions = extractMentions(content);
    if (mentions.length > 10) {
      warnings.push("Message contains many mentions");
    }

    // Check for suspicious URLs
    const urls = extractUrls(content);
    const suspiciousPatterns = [/bit\.ly/i, /tinyurl/i, /t\.co/i, /goo\.gl/i];

    urls.forEach((urlObj) => {
      if (suspiciousPatterns.some((pattern) => pattern.test(urlObj.url))) {
        warnings.push("Message contains shortened URLs");
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Generate message preview for notifications
 * @param {Object} message - Message object
 * @param {number} maxLength - Maximum preview length
 * @returns {string} - Preview text
 */
export const generateMessagePreview = (message, maxLength = 100) => {
  if (!message) return "";

  let preview = formatMessageContent(message, {
    showSender: false,
    includeEmoji: false,
    maxLength: maxLength - 10, // Account for potential truncation indicator
  });

  // Clean up the preview
  preview = preview.replace(/\n/g, " ").trim();

  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + "...";
  }

  return preview;
};

/**
 * Check if message is a system message
 * @param {Object} message - Message object
 * @returns {boolean} - True if system message
 */
export const isSystemMessage = (message) => {
  return message?.type === "system" || message?.isSystem || !message?.senderId;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

/**
 * Get message thread (replies to a message)
 * @param {Array} messages - All messages
 * @param {string} parentMessageId - Parent message ID
 * @returns {Array} - Array of reply messages
 */
export const getMessageThread = (messages, parentMessageId) => {
  if (!messages || !parentMessageId) return [];

  return messages
    .filter((message) => message.replyToId === parentMessageId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default {
  formatTimestamp,
  getRelativeTimeString,
  formatMessageContent,
  extractMentions,
  formatMentions,
  extractUrls,
  formatUrls,
  sanitizeContent,
  groupMessagesByDate,
  searchMessages,
  validateMessageContent,
  generateMessagePreview,
  isSystemMessage,
  formatFileSize,
  getMessageThread,
};
