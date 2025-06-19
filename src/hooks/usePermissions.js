import useAuthStore from "../stores/authStore";
import { checkPermission } from "../utils/permissions";

const usePermissions = () => {
  const { user } = useAuthStore();

  const hasPermission = (permission, resource) => {
    if (!user || !user.role) return false;
    return checkPermission(user.role, permission, resource);
  };

  const canAccessRoute = (routePath) => {
    if (!user || !user.role) return false;
    // Map routes to required permissions (could be moved to config)
    const routePermissions = {
      "/super-admin/*": ["manage", "system"],
      "/manager/*": ["manage", "office"],
      "/consultant/*": ["view", "leads"],
      "/receptionist/*": ["manage", "appointments"],
      "/student/*": ["view", "profile"],
    };

    for (const [pattern, [action, resource]] of Object.entries(
      routePermissions
    )) {
      if (routePath.match(new RegExp(`^${pattern.replace("*", ".*")}$`))) {
        return hasPermission(action, resource);
      }
    }
    return true; // Default to allow if no specific permission is defined
  };

  return {
    hasPermission,
    canAccessRoute,
    role: user?.role || null,
  };
};

export default usePermissions;
