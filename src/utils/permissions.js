import { PERMISSIONS, ROLES } from "./constants";

// Role-based permission map
const permissionMap = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.EDIT_STAFF,
    PERMISSIONS.DELETE_STAFF,
    PERMISSIONS.CREATE_STAFF,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.DELETE_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_UNIVERSITIES,
    PERMISSIONS.EDIT_UNIVERSITIES,
    PERMISSIONS.DELETE_UNIVERSITIES,
    PERMISSIONS.CREATE_UNIVERSITIES,
    PERMISSIONS.VIEW_OFFICES,
    PERMISSIONS.EDIT_OFFICES,
    PERMISSIONS.DELETE_OFFICES,
    PERMISSIONS.CREATE_OFFICES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.DELETE_REPORTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.DELETE_APPOINTMENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.EDIT_STAFF,
    PERMISSIONS.CREATE_STAFF,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.VIEW_UNIVERSITIES,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_OFFICES,
  ],
  [ROLES.CONSULTANT]: [
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.VIEW_UNIVERSITIES,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.EDIT_STUDENTS,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.VIEW_UNIVERSITIES,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.VIEW_STUDENTS,
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
  ],
};

// Main function to check a specific permission
export const checkPermission = (userRole, permission) => {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return permissionMap[userRole]?.includes(permission) || false;
};

// Utility to check if a user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  return checkPermission(user.role, permission);
};

// Utility to get all permissions for a role
export const getRolePermissions = (role) => {
  return permissionMap[role] || [];
};

// Utility to check if a user can access a specific route
export const canAccessRoute = (user, routePermissions = []) => {
  if (!user || !user.role) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;
  return routePermissions.some((permission) =>
    checkPermission(user.role, permission)
  );
};

// Utility to filter accessible routes based on user permissions
export const filterAccessibleRoutes = (user, routes) => {
  if (!user || !user.role) return [];
  return routes.filter((route) => {
    if (!route.permissions) return true; // Public route
    return canAccessRoute(user, route.permissions);
  });
};

// Check multiple permissions at once
export const checkMultiplePermissions = (userRole, permissions) => {
  if (!userRole || !permissions) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return permissions.every((permission) =>
    checkPermission(userRole, permission)
  );
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return permissions.some((permission) =>
    checkPermission(userRole, permission)
  );
};

// Get user's permissions as a readable list
export const getUserPermissions = (userRole) => {
  if (!userRole) return [];
  return permissionMap[userRole] || [];
};

// Check resource-level permissions (backward compatible)
export const canAccessResource = (userRole, resource, action = "view") => {
  if (!userRole) return false;
  const permission = `${action}_${resource}`.toLowerCase();
  return checkPermission(userRole, permission);
};

// Default export
export default {
  checkPermission,
  hasPermission,
  getRolePermissions,
  canAccessRoute,
  filterAccessibleRoutes,
  checkMultiplePermissions,
  hasAnyPermission,
  getUserPermissions,
  canAccessResource,
};
