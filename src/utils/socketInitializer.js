// src/utils/socketInitializer.js
import { initializeSocketStore } from "../stores/socketStore";
import useAuthStore from "../stores/authStore";

/**
 * Initialize socket connection when auth state changes
 * Call this once when your app starts
 */
export const initializeSocketConnection = () => {
  // Initialize the socket store with auth store
  initializeSocketStore(useAuthStore);

  console.log("✅ Socket store initialized and connected to auth store");
};

/**
 * Manually connect socket with current auth token
 * Useful for force reconnection
 */
export const connectSocket = () => {
  const authState = useAuthStore.getState();
  const socketState = useSocketStore.getState();

  if (authState.isAuthenticated && authState.user && !socketState.isConnected) {
    const token = authState.getToken();
    if (token) {
      socketState.connect(token).catch(console.error);
    }
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  const socketState = useSocketStore.getState();
  socketState.disconnect();
};

export default {
  initializeSocketConnection,
  connectSocket,
  disconnectSocket,
};
