// ToastContext.js
import React, { createContext, useState, useContext, useCallback } from "react";
import Toast from "../components/ui/Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, type = "info", duration = 5000, position }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration, position }]);
      setTimeout(() => removeToast(id), duration + 300);
    },
    [removeToast]
  );

  const toast = {
    success: (msg, opts = {}) =>
      showToast({ message: msg, type: "success", ...opts }),
    error: (msg, opts = {}) =>
      showToast({ message: msg, type: "error", ...opts }),
    info: (msg, opts = {}) =>
      showToast({ message: msg, type: "info", ...opts }),
    warning: (msg, opts = {}) =>
      showToast({ message: msg, type: "warning", ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          position={t.position}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
