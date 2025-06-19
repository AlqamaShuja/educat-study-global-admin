// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Role Definitions
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  CONSULTANT: "consultant",
  RECEPTIONIST: "receptionist",
  STUDENT: "student",
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    GOOGLE_OAUTH: "/auth/google",
    FACEBOOK_OAUTH: "/auth/facebook",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    TOGGLE_STATUS: (id) => `/users/${id}/status`,
  },
  OFFICES: {
    LIST: "/offices",
    CREATE: "/offices",
    UPDATE: (id) => `/offices/${id}`,
    DELETE: (id) => `/offices/${id}`,
    ASSIGN_STAFF: (id) => `/offices/${id}/staff`,
  },
  LEADS: {
    LIST: "/leads",
    CREATE: "/leads",
    UPDATE: (id) => `/leads/${id}`,
    ASSIGN: (id) => `/leads/${id}/assign`,
    REASSIGN: (id) => `/leads/${id}/reassign`,
    IMPORT: "/leads/import",
    EXPORT: "/leads/export",
  },
  APPOINTMENTS: {
    LIST: "/appointments",
    CREATE: "/appointments",
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`,
    CONFIRM: (id) => `/appointments/${id}/confirm`,
  },
  DOCUMENTS: {
    LIST: "/documents",
    UPLOAD: "/documents/upload",
    DELETE: (id) => `/documents/${id}`,
  },
  UNIVERSITIES: {
    LIST: "/universities",
    CREATE: "/universities",
    UPDATE: (id) => `/universities/${id}`,
    DELETE: (id) => `/universities/${id}`,
  },
  COURSES: {
    LIST: "/courses",
    CREATE: "/courses",
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    SEND: "/notifications/send",
    READ: (id) => `/notifications/${id}/read`,
  },
  REPORTS: {
    GENERATE: "/reports/generate",
    EXPORT: "/reports/export",
  },
  MESSAGES: {
    LIST: (recipientId) => `/messages/${recipientId}`,
    SEND: "/messages/send",
  },
};

// Statuses
export const LEAD_STATUSES = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  IN_PROGRESS: "in_progress",
  CONVERTED: "converted",
  LOST: "lost",
};

export const APPOINTMENT_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 25, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

// Date Formats
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const COUNTRY_OPTION = [
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Sweden", label: "Sweden" },
  { value: "France", label: "France" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Ireland", label: "Ireland" },
  { value: "Norway", label: "Norway" },
  { value: "Denmark", label: "Denmark" },
  { value: "Pakistan", label: "Pakistan" },
];
