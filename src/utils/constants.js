export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  CONSULTANT: "consultant",
  RECEPTIONIST: "receptionist",
  STUDENT: "student",
};

export const PERMISSIONS = {
  // Staff Management
  VIEW_STAFF: "view_staff",
  EDIT_STAFF: "edit_staff",
  DELETE_STAFF: "delete_staff",
  CREATE_STAFF: "create_staff",

  // Lead Management
  VIEW_LEADS: "view_leads",
  EDIT_LEADS: "edit_leads",
  DELETE_LEADS: "delete_leads",
  CREATE_LEADS: "create_leads",
  ASSIGN_LEADS: "assign_leads",

  // Office Management
  VIEW_OFFICES: "view_offices",
  EDIT_OFFICES: "edit_offices",
  DELETE_OFFICES: "delete_offices",
  CREATE_OFFICES: "create_offices",

  // University Management
  VIEW_UNIVERSITIES: "view_universities",
  EDIT_UNIVERSITIES: "edit_universities",
  DELETE_UNIVERSITIES: "delete_universities",
  CREATE_UNIVERSITIES: "create_universities",

  // Course Management
  VIEW_COURSES: "view_courses",
  EDIT_COURSES: "edit_courses",
  DELETE_COURSES: "delete_courses",
  CREATE_COURSES: "create_courses",

  // Student Management
  VIEW_STUDENTS: "view_students",
  EDIT_STUDENTS: "edit_students",
  DELETE_STUDENTS: "delete_students",

  // Profile Management
  VIEW_PROFILE: "view_profile",
  EDIT_PROFILE: "edit_profile",

  // Appointment Management
  VIEW_APPOINTMENTS: "view_appointments",
  EDIT_APPOINTMENTS: "edit_appointments",
  DELETE_APPOINTMENTS: "delete_apointments",
  CREATE_APPOINTMENTS: "create_appointments",

  // Document Management
  VIEW_DOCUMENTS: "view_documents",
  EDIT_DOCUMENTS: "edit_documents",
  DELETE_DOCUMENTS: "delete_documents",
  UPLOAD_DOCUMENTS: "upload_documents",

  // Report Management
  VIEW_REPORTS: "view_reports",
  EDIT_REPORTS: "edit_reports",
  DELETE_REPORTS: "delete_reports",
  CREATE_REPORTS: "create_reports",

  // System Settings
  VIEW_SETTINGS: "view_settings",
  EDIT_SETTINGS: "edit_settings",

  // Notification Management
  VIEW_NOTIFICATIONS: "view_notifications",
  SEND_NOTIFICATIONS: "send_notifications",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_DATA: "export_data",
};

export const DOCUMENT_TYPES = {
  PASSPORT: "passport",
  TRANSCRIPT: "transcript",
  DIPLOMA: "diploma",
  IELTS: "ielts",
  TOEFL: "toefl",
  RECOMMENDATION: "recommendation",
  SOP: "sop",
  CV: "cv",
  FINANCIAL: "financial",
  OTHER: "other",
};

export const LEAD_SOURCES = {
  WALK_IN: "walk_in",
  ONLINE: "online",
  REFERRAL: "referral",
};

export const APPOINTMENT_TYPES = {
  IN_PERSON: "in_person",
  VIRTUAL: "virtual",
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export const NOTIFICATION_TYPES = {
  EMAIL: "email",
  SMS: "sms",
  IN_APP: "in_app",
  PUSH: "push",
};

export const STUDY_LEVELS = {
  BACHELOR: "bachelor",
  MASTER: "master",
  PHD: "phd",
  DIPLOMA: "diploma",
  CERTIFICATE: "certificate",
};

export const COUNTRIES = {
  PAKISTAN: "Pakistan",
  UAE: "United Arab Emirates",
  UK: "United Kingdom",
  CANADA: "Canada",
  AUSTRALIA: "Australia",
  USA: "United States",
  GERMANY: "Germany",
  FRANCE: "France",
  NETHERLANDS: "Netherlands",
};

export const APPLICATION_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  WAITLISTED: "waitlisted",
};

export const LEAD_STATUSES = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  IN_PROGRESS: "in_progress",
  CONVERTED: "converted",
  LOST: "lost",
};

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
};

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5,
};

export const UNIVERSITY_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export const BACKUP_FREQUENCIES = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const SESSION_TIMEOUT_MINUTES = [5, 10, 15, 30, 60, 120];

export const PAGE_SIZES = [10, 25, 50, 100];

export const API_ENDPOINTS = {
  AUTH: "/auth",
  USERS: "/users",
  LEADS: "/leads",
  OFFICES: "/offices",
  APPOINTMENTS: "/appointments",
  DOCUMENTS: "/documents",
  UNIVERSITIES: "/universities",
  COURSES: "/courses",
  NOTIFICATIONS: "/notifications",
  REPORTS: "/reports",
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  THEME: "theme_preference",
  LANGUAGE: "language_preference",
  NOTIFICATIONS: "notification_settings",
};

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const DEFAULT_PAGE_SIZE = {
  STAFF_PAGE_SIZE: 50,
  LEAD_PAGE_SIZE: 100,
  UNIVERSITY_PAGE_SIZE: 25,
};

export const CSV_UPLOAD_TEMPLATES = {
  STAFF: {
    headers: ["name", "email", "password", "phone", "officeId"],
    required: ["name", "email", "password"],
    optional: ["phone", "officeId"],
  },
  UNIVERSITIES: {
    headers: ["name", "country", "city", "website", "email", "phone", "status"],
    required: ["name", "country"],
    optional: ["city", "website", "email", "phone", "status"],
  },
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action.",
  SERVER_ERROR: "Server error. Please try again later.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  VALIDATION_ERROR: "Invalid input data. Please check all fields.",
};
