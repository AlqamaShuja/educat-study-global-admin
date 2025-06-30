// src/hooks/useTyping.js
import { useState, useRef, useCallback, useEffect } from "react";
import useSocket from "./useSocket";
import useConversationStore from "../stores/conversationStore";

const useTyping = (conversationId) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const typingTimeoutRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);

  const { sendTypingIndicator } = useSocket();
  const { setUserTyping } = useConversationStore();

  // Configuration
  const TYPING_TIMEOUT = 3000; // Stop typing after 3 seconds of inactivity
  const TYPING_THROTTLE = 1000; // Only send typing indicators every 1 second

  // Start typing
  const startTyping = useCallback(() => {
    if (!conversationId) return;

    const now = Date.now();

    // Throttle typing indicators
    if (now - lastTypingTimeRef.current < TYPING_THROTTLE) {
      // Update timeout but don't send indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, TYPING_TIMEOUT);

      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
      lastTypingTimeRef.current = now;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [conversationId, isTyping, sendTypingIndicator]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!conversationId) return;

    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }

    // Clear timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
  }, [conversationId, isTyping, sendTypingIndicator]);

  // Force stop typing (for cleanup)
  const forceStopTyping = useCallback(() => {
    stopTyping();
    setIsTyping(false);
  }, [stopTyping]);

  // Handle input change
  const handleInputChange = useCallback(
    (value) => {
      if (!conversationId) return;

      if (value && value.trim()) {
        startTyping();
      } else {
        // Use a short delay before stopping to prevent rapid on/off
        if (stopTypingTimeoutRef.current) {
          clearTimeout(stopTypingTimeoutRef.current);
        }

        stopTypingTimeoutRef.current = setTimeout(() => {
          stopTyping();
        }, 500);
      }
    },
    [conversationId, startTyping, stopTyping]
  );

  // Get typing users for current conversation
  const getTypingUsers = useCallback(() => {
    if (!conversationId) return [];

    const conversationTyping = useConversationStore
      .getState()
      .typingUsers.get(conversationId);
    return Array.from(conversationTyping || []);
  }, [conversationId]);

  // Subscribe to typing users changes
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = useConversationStore.subscribe(
      (state) => state.typingUsers.get(conversationId),
      (typingUserSet) => {
        const users = Array.from(typingUserSet || []);
        setTypingUsers(users);
      }
    );

    return unsubscribe;
  }, [conversationId]);

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return () => {
      forceStopTyping();
    };
  }, [forceStopTyping]);

  // Auto-stop typing when conversation changes
  useEffect(() => {
    forceStopTyping();
  }, [conversationId, forceStopTyping]);

  // Auto-stop typing on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTyping) {
        forceStopTyping();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isTyping, forceStopTyping]);

  // Auto-stop typing on window blur
  useEffect(() => {
    const handleWindowBlur = () => {
      if (isTyping) {
        forceStopTyping();
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [isTyping, forceStopTyping]);

  return {
    // Current user typing state
    isTyping,

    // Other users typing
    typingUsers,

    // Actions
    startTyping,
    stopTyping,
    forceStopTyping,
    handleInputChange,

    // Utilities
    getTypingUsers,

    // Status
    hasTypingUsers: typingUsers.length > 0,
  };
};

// Hook for managing typing in multiple conversations
export const useMultipleTyping = () => {
  const [typingStates, setTypingStates] = useState(new Map());

  const { sendTypingIndicator } = useSocket();

  const startTyping = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      setTypingStates((prev) => {
        const newStates = new Map(prev);
        const currentState = newStates.get(conversationId) || {
          isTyping: false,
          timeout: null,
        };

        if (!currentState.isTyping) {
          sendTypingIndicator(conversationId, true);
          newStates.set(conversationId, { ...currentState, isTyping: true });
        }

        // Clear existing timeout
        if (currentState.timeout) {
          clearTimeout(currentState.timeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          stopTyping(conversationId);
        }, 3000);

        newStates.set(conversationId, {
          ...newStates.get(conversationId),
          timeout,
        });
        return newStates;
      });
    },
    [sendTypingIndicator]
  );

  const stopTyping = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      setTypingStates((prev) => {
        const newStates = new Map(prev);
        const currentState = newStates.get(conversationId);

        if (currentState?.isTyping) {
          sendTypingIndicator(conversationId, false);

          if (currentState.timeout) {
            clearTimeout(currentState.timeout);
          }

          newStates.set(conversationId, { isTyping: false, timeout: null });
        }

        return newStates;
      });
    },
    [sendTypingIndicator]
  );

  const isTypingInConversation = useCallback(
    (conversationId) => {
      return typingStates.get(conversationId)?.isTyping || false;
    },
    [typingStates]
  );

  const handleInputChange = useCallback(
    (conversationId, value) => {
      if (value && value.trim()) {
        startTyping(conversationId);
      } else {
        setTimeout(() => stopTyping(conversationId), 500);
      }
    },
    [startTyping, stopTyping]
  );

  // Cleanup all typing states
  const cleanup = useCallback(() => {
    typingStates.forEach((state, conversationId) => {
      if (state.isTyping) {
        sendTypingIndicator(conversationId, false);
      }
      if (state.timeout) {
        clearTimeout(state.timeout);
      }
    });
    setTypingStates(new Map());
  }, [typingStates, sendTypingIndicator]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    startTyping,
    stopTyping,
    isTypingInConversation,
    handleInputChange,
    cleanup,
  };
};

// Advanced typing hook with debouncing and throttling
export const useAdvancedTyping = (conversationId, options = {}) => {
  const {
    debounceDelay = 300,
    throttleDelay = 1000,
    stopDelay = 3000,
    enabled = true,
  } = options;

  const [isTyping, setIsTyping] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(0);

  const debounceTimeoutRef = useRef(null);
  const throttleTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const lastSentTimeRef = useRef(0);

  const { sendTypingIndicator } = useSocket();

  const sendTypingStart = useCallback(() => {
    if (!enabled || !conversationId) return;

    const now = Date.now();

    // Throttle sending
    if (now - lastSentTimeRef.current < throttleDelay) {
      return;
    }

    setIsTyping(true);
    sendTypingIndicator(conversationId, true);
    lastSentTimeRef.current = now;
  }, [enabled, conversationId, sendTypingIndicator, throttleDelay]);

  const sendTypingStop = useCallback(() => {
    if (!enabled || !conversationId || !isTyping) return;

    setIsTyping(false);
    sendTypingIndicator(conversationId, false);
  }, [enabled, conversationId, isTyping, sendTypingIndicator]);

  const handleInput = useCallback(
    (value) => {
      if (!enabled || !conversationId) return;

      const now = Date.now();
      setLastInputTime(now);

      // Clear existing timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }

      if (value && value.trim()) {
        // Debounce the typing start
        debounceTimeoutRef.current = setTimeout(() => {
          sendTypingStart();
        }, debounceDelay);

        // Set stop timeout
        stopTimeoutRef.current = setTimeout(() => {
          sendTypingStop();
        }, stopDelay);
      } else {
        // Stop typing immediately if input is empty
        sendTypingStop();
      }
    },
    [
      enabled,
      conversationId,
      debounceDelay,
      stopDelay,
      sendTypingStart,
      sendTypingStop,
    ]
  );

  const forceStop = useCallback(() => {
    // Clear all timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }

    if (isTyping) {
      sendTypingStop();
    }
  }, [isTyping, sendTypingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return forceStop;
  }, [forceStop]);

  // Stop typing when conversation changes
  useEffect(() => {
    forceStop();
  }, [conversationId, forceStop]);

  return {
    isTyping,
    handleInput,
    forceStop,
    lastInputTime,
  };
};

export default useTyping;
