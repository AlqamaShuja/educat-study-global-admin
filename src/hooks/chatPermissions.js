// src/utils/chatPermissions.js

// Role hierarchy - higher numbers have more permissions
const ROLE_HIERARCHY = {
  lead: 1,
  receptionist: 2,
  consultant: 3,
  manager: 4,
  super_admin: 5,
};

// Permission definitions
const PERMISSIONS = {
  // Chat permissions
  CHAT_WITH_LEADS: "chat_with_leads",
  CHAT_WITH_CONSULTANTS: "chat_with_consultants",
  CHAT_WITH_MANAGERS: "chat_with_managers",
  CHAT_WITH_RECEPTIONISTS: "chat_with_receptionists",
  CHAT_WITH_ANYONE: "chat_with_anyone",

  // Conversation management
  CREATE_CONVERSATIONS: "create_conversations",
  DELETE_CONVERSATIONS: "delete_conversations",
  ARCHIVE_CONVERSATIONS: "archive_conversations",
  PIN_CONVERSATIONS: "pin_conversations",

  // Message management
  EDIT_OWN_MESSAGES: "edit_own_messages",
  DELETE_OWN_MESSAGES: "delete_own_messages",
  DELETE_ANY_MESSAGES: "delete_any_messages",
  FORWARD_MESSAGES: "forward_messages",

  // File sharing
  UPLOAD_FILES: "upload_files",
  UPLOAD_IMAGES: "upload_images",
  UPLOAD_VIDEOS: "upload_videos",
  UPLOAD_DOCUMENTS: "upload_documents",

  // Monitoring and admin
  VIEW_OFFICE_CONVERSATIONS: "view_office_conversations",
  VIEW_ALL_CONVERSATIONS: "view_all_conversations",
  MONITOR_CONVERSATIONS: "monitor_conversations",
  EXPORT_CONVERSATIONS: "export_conversations",
  MANAGE_USERS: "manage_users",
  SYSTEM_ADMINISTRATION: "system_administration",

  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  VIEW_OFFICE_ANALYTICS: "view_office_analytics",

  // Settings
  MANAGE_OFFICE_SETTINGS: "manage_office_settings",
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  lead: [
    PERMISSIONS.CHAT_WITH_CONSULTANTS,
    PERMISSIONS.EDIT_OWN_MESSAGES,
    PERMISSIONS.DELETE_OWN_MESSAGES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.UPLOAD_IMAGES,
    PERMISSIONS.PIN_CONVERSATIONS,
  ],

  receptionist: [
    PERMISSIONS.CHAT_WITH_CONSULTANTS,
    PERMISSIONS.CHAT_WITH_MANAGERS,
    PERMISSIONS.CREATE_CONVERSATIONS,
    PERMISSIONS.EDIT_OWN_MESSAGES,
    PERMISSIONS.DELETE_OWN_MESSAGES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.UPLOAD_IMAGES,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.FORWARD_MESSAGES,
    PERMISSIONS.ARCHIVE_CONVERSATIONS,
    PERMISSIONS.PIN_CONVERSATIONS,
  ],

  consultant: [
    PERMISSIONS.CHAT_WITH_LEADS,
    PERMISSIONS.CHAT_WITH_MANAGERS,
    PERMISSIONS.CHAT_WITH_RECEPTIONISTS,
    PERMISSIONS.CREATE_CONVERSATIONS,
    PERMISSIONS.EDIT_OWN_MESSAGES,
    PERMISSIONS.DELETE_OWN_MESSAGES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.UPLOAD_IMAGES,
    PERMISSIONS.UPLOAD_VIDEOS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.FORWARD_MESSAGES,
    PERMISSIONS.ARCHIVE_CONVERSATIONS,
    PERMISSIONS.PIN_CONVERSATIONS,
  ],

  manager: [
    PERMISSIONS.CHAT_WITH_LEADS,
    PERMISSIONS.CHAT_WITH_CONSULTANTS,
    PERMISSIONS.CHAT_WITH_RECEPTIONISTS,
    PERMISSIONS.CREATE_CONVERSATIONS,
    PERMISSIONS.DELETE_CONVERSATIONS,
    PERMISSIONS.EDIT_OWN_MESSAGES,
    PERMISSIONS.DELETE_OWN_MESSAGES,
    PERMISSIONS.DELETE_ANY_MESSAGES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.UPLOAD_IMAGES,
    PERMISSIONS.UPLOAD_VIDEOS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.FORWARD_MESSAGES,
    PERMISSIONS.ARCHIVE_CONVERSATIONS,
    PERMISSIONS.PIN_CONVERSATIONS,
    PERMISSIONS.VIEW_OFFICE_CONVERSATIONS,
    PERMISSIONS.MONITOR_CONVERSATIONS,
    PERMISSIONS.EXPORT_CONVERSATIONS,
    PERMISSIONS.VIEW_OFFICE_ANALYTICS,
    PERMISSIONS.MANAGE_OFFICE_SETTINGS,
  ],

  super_admin: [
    PERMISSIONS.CHAT_WITH_ANYONE,
    PERMISSIONS.CREATE_CONVERSATIONS,
    PERMISSIONS.DELETE_CONVERSATIONS,
    PERMISSIONS.EDIT_OWN_MESSAGES,
    PERMISSIONS.DELETE_OWN_MESSAGES,
    PERMISSIONS.DELETE_ANY_MESSAGES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.UPLOAD_IMAGES,
    PERMISSIONS.UPLOAD_VIDEOS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.FORWARD_MESSAGES,
    PERMISSIONS.ARCHIVE_CONVERSATIONS,
    PERMISSIONS.PIN_CONVERSATIONS,
    PERMISSIONS.VIEW_ALL_CONVERSATIONS,
    PERMISSIONS.MONITOR_CONVERSATIONS,
    PERMISSIONS.EXPORT_CONVERSATIONS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_ADMINISTRATION,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
  ],
};

// Chat matrix - who can chat with whom
const CHAT_MATRIX = {
  lead: ["consultant"],
  receptionist: ["consultant", "manager"],
  consultant: ["lead", "receptionist", "manager"],
  manager: ["receptionist", "consultant", "lead"],
  super_admin: ["receptionist", "consultant", "manager", "lead"],
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if a user can chat with another user
 * @param {Object} fromUser - User initiating chat
 * @param {Object} toUser - Target user
 * @returns {boolean}
 */
export const canChatWith = (fromUser, toUser) => {
  if (!fromUser || !toUser || !fromUser.role || !toUser.role) return false;

  // Super admin can chat with anyone
  if (fromUser.role === "super_admin") return true;

  // Check chat matrix
  const allowedRoles = CHAT_MATRIX[fromUser.role] || [];
  return allowedRoles.includes(toUser.role);
};

/**
 * Check if a user can access conversations from a specific office
 * @param {Object} user - User object
 * @param {string} officeId - Office ID to check
 * @returns {boolean}
 */
export const canAccessOffice = (user, officeId) => {
  if (!user) return false;

  // Super admin can access all offices
  if (user.role === "super_admin") return true;

  // Users can only access their own office
  return user.officeId === officeId;
};

/**
 * Check if a user can perform monitoring operations
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canMonitorConversations = (user) => {
  return hasPermission(user, PERMISSIONS.MONITOR_CONVERSATIONS);
};

/**
 * Check if a user can manage other users
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return hasPermission(user, PERMISSIONS.MANAGE_USERS);
};

/**
 * Check if a user can edit/delete a specific message
 * @param {Object} user - User object
 * @param {Object} message - Message object
 * @param {Object} options - Additional options
 * @returns {Object} - { canEdit: boolean, canDelete: boolean }
 */
export const getMessagePermissions = (user, message, options = {}) => {
  if (!user || !message) {
    return { canEdit: false, canDelete: false };
  }

  const isOwnMessage = message.senderId === user.id;
  const { timeLimit = 15 * 60 * 1000 } = options; // 15 minutes default

  // Check if message is too old to edit
  const messageAge = Date.now() - new Date(message.createdAt).getTime();
  const withinTimeLimit = messageAge < timeLimit;

  let canEdit = false;
  let canDelete = false;

  if (isOwnMessage) {
    canEdit =
      hasPermission(user, PERMISSIONS.EDIT_OWN_MESSAGES) &&
      withinTimeLimit &&
      message.type === "text";
    canDelete =
      hasPermission(user, PERMISSIONS.DELETE_OWN_MESSAGES) && withinTimeLimit;
  }

  // Managers and admins can delete any message
  if (hasPermission(user, PERMISSIONS.DELETE_ANY_MESSAGES)) {
    canDelete = true;
  }

  return { canEdit, canDelete };
};

/**
 * Check if a user can upload specific file types
 * @param {Object} user - User object
 * @param {string} fileType - MIME type of the file
 * @returns {boolean}
 */
export const canUploadFileType = (user, fileType) => {
  if (!user || !fileType) return false;

  // Check general file upload permission
  if (!hasPermission(user, PERMISSIONS.UPLOAD_FILES)) return false;

  // Check specific file type permissions
  if (fileType.startsWith("image/")) {
    return hasPermission(user, PERMISSIONS.UPLOAD_IMAGES);
  }

  if (fileType.startsWith("video/")) {
    return hasPermission(user, PERMISSIONS.UPLOAD_VIDEOS);
  }

  // Documents (PDFs, Word docs, etc.)
  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  if (documentTypes.includes(fileType)) {
    return hasPermission(user, PERMISSIONS.UPLOAD_DOCUMENTS);
  }

  // For other file types, check general upload permission
  return true;
};

/**
 * Get maximum file size for user role
 * @param {Object} user - User object
 * @returns {number} - Max file size in bytes
 */
export const getMaxFileSize = (user) => {
  if (!user) return 0;

  const fileSizeLimits = {
    lead: 10 * 1024 * 1024, // 10MB
    receptionist: 25 * 1024 * 1024, // 25MB
    consultant: 50 * 1024 * 1024, // 50MB
    manager: 100 * 1024 * 1024, // 100MB
    super_admin: 200 * 1024 * 1024, // 200MB
  };

  return fileSizeLimits[user.role] || 0;
};

/**
 * Check if a user can create conversations with specific users
 * @param {Object} user - User object
 * @param {Array} targetUsers - Array of target user objects
 * @returns {boolean}
 */
export const canCreateConversationWith = (user, targetUsers) => {
  if (!user || !targetUsers || targetUsers.length === 0) return false;

  // Check if user has permission to create conversations
  if (!hasPermission(user, PERMISSIONS.CREATE_CONVERSATIONS)) {
    // Leads can only chat with assigned consultants (no group creation)
    return user.role === "lead" && targetUsers.length === 1;
  }

  // Check if user can chat with all target users
  return targetUsers.every((targetUser) => canChatWith(user, targetUser));
};

/**
 * Get filtered conversation list based on user permissions
 * @param {Array} conversations - Array of conversation objects
 * @param {Object} user - User object
 * @returns {Array} - Filtered conversations
 */
export const getAccessibleConversations = (conversations, user) => {
  if (!user || !conversations) return [];

  return conversations.filter((conversation) => {
    // Super admins can see all conversations
    if (user.role === "super_admin") return true;

    // Managers can see office conversations
    if (
      user.role === "manager" &&
      canAccessOffice(user, conversation.officeId)
    ) {
      return true;
    }

    // Users can see conversations they're part of
    return conversation.participants?.some((p) => p.userId === user.id);
  });
};

/**
 * Check conversation-level permissions
 * @param {Object} user - User object
 * @param {Object} conversation - Conversation object
 * @returns {Object} - Permission object
 */
export const getConversationPermissions = (user, conversation) => {
  if (!user || !conversation) {
    return {
      canView: false,
      canSendMessages: false,
      canAddParticipants: false,
      canRemoveParticipants: false,
      canArchive: false,
      canDelete: false,
      canExport: false,
    };
  }

  const isParticipant = conversation.participants?.some(
    (p) => p.userId === user.id
  );
  const isManager =
    user.role === "manager" && canAccessOffice(user, conversation.officeId);
  const isSuperAdmin = user.role === "super_admin";

  return {
    canView: isParticipant || isManager || isSuperAdmin,
    canSendMessages: isParticipant,
    canAddParticipants:
      (isParticipant &&
        hasPermission(user, PERMISSIONS.CREATE_CONVERSATIONS)) ||
      isManager ||
      isSuperAdmin,
    canRemoveParticipants: isManager || isSuperAdmin,
    canArchive:
      isParticipant && hasPermission(user, PERMISSIONS.ARCHIVE_CONVERSATIONS),
    canDelete: hasPermission(user, PERMISSIONS.DELETE_CONVERSATIONS),
    canExport: hasPermission(user, PERMISSIONS.EXPORT_CONVERSATIONS),
  };
};

/**
 * Get role hierarchy level
 * @param {string} role - User role
 * @returns {number} - Hierarchy level
 */
export const getRoleHierarchy = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Check if one role has higher authority than another
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} - True if role1 has higher authority
 */
export const hasHigherAuthority = (role1, role2) => {
  return getRoleHierarchy(role1) > getRoleHierarchy(role2);
};

/**
 * Get available chat targets for a user
 * @param {Object} user - User object
 * @param {Array} allUsers - Array of all users
 * @returns {Array} - Array of users that can be chatted with
 */
export const getAvailableChatTargets = (user, allUsers) => {
  if (!user || !allUsers) return [];

  return allUsers.filter(
    (targetUser) => targetUser.id !== user.id && canChatWith(user, targetUser)
  );
};

// Export all permissions for reference
export { PERMISSIONS, ROLE_PERMISSIONS, CHAT_MATRIX, ROLE_HIERARCHY };

export default {
  hasPermission,
  canChatWith,
  canAccessOffice,
  canMonitorConversations,
  canManageUsers,
  getMessagePermissions,
  canUploadFileType,
  getMaxFileSize,
  canCreateConversationWith,
  getAccessibleConversations,
  getConversationPermissions,
  getRoleHierarchy,
  hasHigherAuthority,
  getAvailableChatTargets,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  CHAT_MATRIX,
};
