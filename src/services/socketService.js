

import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
let socket = null;
let newMessageCallback = null;
let messageReadCallback = null;

const socketService = {
  // Initialize Socket.IO connection
  connect(userId) {
    if (!userId) {
      console.error('User ID is required to connect to Socket.IO');
      return;
    }

    if (socket && socket.connected) {
      console.log('Socket already connected:', socket.id);
      return socket;
    }

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying to reconnect indefinitely
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', socket.id);
      socket.emit('join', userId);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnecting to Socket.IO server (attempt ${attempt})`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`Reconnected to Socket.IO server after ${attempt} attempts`);
      socket.emit('join', userId); // Rejoin user room on reconnect
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to Socket.IO server');
    });

    socket.on('newMessage', (message) => {
      console.log('New message received:', message);
      if (newMessageCallback && typeof newMessageCallback === 'function') {
        newMessageCallback(message);
      }
    });

    socket.on('messageRead', (data) => {
      console.log('Message read:', data);
      if (messageReadCallback && typeof messageReadCallback === 'function') {
        messageReadCallback(data);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
    });

    return socket;
  },

  // Manually trigger reconnection
  reconnect(userId) {
    if (socket && !socket.connected) {
      console.log('Manually triggering Socket.IO reconnection');
      socket.connect();
      socket.emit('join', userId);
    }
  },

  // Register callbacks for components
  onNewMessage(callback) {
    newMessageCallback = callback;
  },

  onMessageRead(callback) {
    messageReadCallback = callback;
  },

  // Disconnect from Socket.IO
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      newMessageCallback = null;
      messageReadCallback = null;
      console.log('Socket.IO disconnected');
    }
  },

  // Check if socket is connected
  isConnected() {
    return socket && socket.connected;
  },

  // Get the socket instance
  getSocket() {
    return socket;
  },
};

export default socketService;