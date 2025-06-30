import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  Mic,
  Video,
  File,
  X,
  Plus,
  Loader2,
} from "lucide-react";

const MessageInput = ({
  value = "",
  onChange,
  onSend,
  onFileUpload,
  onTypingStart,
  onTypingStop,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 4000,
  showAttachments = true,
  showEmoji = true,
  showVoiceNote = false,
  replyingTo = null,
  onCancelReply = null,
  uploadProgress = null,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rows, setRows] = useState(1);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px height
      textarea.style.height = `${newHeight}px`;
      setRows(Math.min(Math.ceil(newHeight / 24), 5)); // Approximate rows
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  // Handle typing indicators
  const handleInputChange = (e) => {
    const newValue = e.target.value;

    if (newValue.length <= maxLength) {
      onChange(newValue);

      // Trigger typing start
      if (onTypingStart && newValue.trim()) {
        onTypingStart();

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          if (onTypingStop) onTypingStop();
        }, 3000);
      } else if (onTypingStop && !newValue.trim()) {
        onTypingStop();
      }
    }
  };

  // Handle send message
  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && onSend && !disabled) {
      onSend(trimmedValue);

      // Stop typing indicator
      if (onTypingStop) {
        onTypingStop();
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFileUpload) {
      files.forEach((file) => onFileUpload(file));
    }
    // Reset file input
    e.target.value = "";
    setShowAttachMenu(false);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileUpload) {
      files.forEach((file) => onFileUpload(file));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Attachment menu options
  const attachmentOptions = [
    {
      label: "Photos & Videos",
      icon: Image,
      accept: "image/*,video/*",
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Documents",
      icon: File,
      accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Any File",
      icon: Paperclip,
      accept: "*/*",
      color: "text-gray-600 bg-gray-100",
    },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-gray-50 border-l-4 border-blue-500 p-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-blue-600">
              Replying to {replyingTo.sender?.name || "Unknown"}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyingTo.type === "text"
                ? replyingTo.content
                : `${replyingTo.type} message`}
            </div>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="ml-2 p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-500">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <div
        className={`
          flex items-end space-x-2 p-3 bg-white border rounded-lg transition-all duration-200
          ${isFocused ? "border-blue-500 shadow-lg" : "border-gray-300"}
          ${isDragOver ? "border-blue-500 bg-blue-50" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachment Button */}
        {showAttachments && (
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={disabled}
              className={`
                p-2 rounded-full transition-colors
                ${
                  showAttachMenu
                    ? "bg-blue-500 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }
                disabled:cursor-not-allowed
              `}
            >
              {showAttachMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>

            {/* Attachment Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48">
                {attachmentOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      fileInputRef.current?.click();
                      fileInputRef.current?.setAttribute(
                        "accept",
                        option.accept
                      );
                    }}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border-0 outline-0 bg-transparent placeholder-gray-400 text-gray-900"
            style={{
              minHeight: "24px",
              maxHeight: "120px",
            }}
            rows={1}
          />

          {/* Character Counter */}
          {value.length > maxLength * 0.8 && (
            <div
              className={`
              absolute bottom-0 right-0 text-xs px-1
              ${value.length >= maxLength ? "text-red-500" : "text-gray-400"}
            `}
            >
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Emoji Button */}
        {showEmoji && (
          <button
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <Smile className="w-5 h-5" />
          </button>
        )}

        {/* Voice Note Button */}
        {showVoiceNote && (
          <button
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`
            p-2 rounded-full transition-all duration-200
            ${
              value.trim() && !disabled
                ? "bg-blue-500 text-white hover:bg-blue-600 scale-100"
                : "bg-gray-200 text-gray-400 scale-95"
            }
            disabled:cursor-not-allowed
          `}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Paperclip className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-600 font-medium">
              Drop files here to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick action buttons component
export const QuickActions = ({
  onImageSelect,
  onFileSelect,
  onVoiceNote,
  className = "",
}) => (
  <div className={`flex space-x-2 ${className}`}>
    <button
      onClick={onImageSelect}
      className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
    >
      <Image className="w-4 h-4" />
      <span className="text-sm font-medium">Photo</span>
    </button>

    <button
      onClick={onFileSelect}
      className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
    >
      <File className="w-4 h-4" />
      <span className="text-sm font-medium">File</span>
    </button>

    {onVoiceNote && (
      <button
        onClick={onVoiceNote}
        className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
      >
        <Mic className="w-4 h-4" />
        <span className="text-sm font-medium">Voice</span>
      </button>
    )}
  </div>
);

// Compact message input for mobile
export const CompactMessageInput = ({
  value,
  onChange,
  onSend,
  disabled,
  className = "",
}) => (
  <div
    className={`flex items-center space-x-2 p-2 bg-white border rounded-full ${className}`}
  >
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter" && value.trim()) {
          onSend(value.trim());
        }
      }}
      placeholder="Type a message..."
      disabled={disabled}
      className="flex-1 bg-transparent outline-0 placeholder-gray-400"
    />
    <button
      onClick={() => value.trim() && onSend(value.trim())}
      disabled={disabled || !value.trim()}
      className={`
        p-2 rounded-full transition-colors
        ${
          value.trim() && !disabled
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-400"
        }
      `}
    >
      <Send className="w-4 h-4" />
    </button>
  </div>
);

export default MessageInput;
