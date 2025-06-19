import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { checkPermission, ROLES } from "../utils/permissions";
import LoadingSpinner from "./ui/LoadingSpinner";
import { AlertTriangle, Lock } from "lucide-react";
import Button from "./ui/Button";

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = "/auth/login",
  unauthorizedPath = "/unauthorized",
}) => {
  const { user, isAuthenticated, isLoading, checkAuthStatus, logout } =
    useAuthStore();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!authChecked) {
        await checkAuthStatus();
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [checkAuthStatus, authChecked]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />
    );
  }

  // Check role-based access
  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.includes(user.role) ||
    user.role === ROLES.SUPER_ADMIN;

  // Check permission-based access
  const hasRequiredPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every((permission) =>
      checkPermission(user.role, permission)
    );

  // Handle unauthorized access
  if (!hasRequiredRole || !hasRequiredPermissions) {
    return (
      <UnauthorizedComponent
        user={user}
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
        unauthorizedPath={unauthorizedPath}
      />
    );
  }

  // User has access, render the protected component
  return children;
};

// Unauthorized Access Component
const UnauthorizedComponent = ({
  user,
  requiredRoles,
  requiredPermissions,
  unauthorizedPath,
}) => {
  const { logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h2>

          {/* Message */}
          <div className="mt-4 space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>

            {user && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Your role:</span> {user.role}
                </p>
                {requiredRoles.length > 0 && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-medium">Required roles:</span>{" "}
                    {requiredRoles.join(", ")}
                  </p>
                )}
                {requiredPermissions.length > 0 && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-medium">Required permissions:</span>{" "}
                    {requiredPermissions.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              Go Back
            </Button>

            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>

            <button
              onClick={handleLogout}
              className="w-full text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
            >
              Sign out and try different account
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3 text-left">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Need access?
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Contact your administrator to request the necessary
                  permissions for this page.
                </p>
                <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for role-based protection
export const withRoleProtection = (WrappedComponent, requiredRoles = []) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Higher-order component for permission-based protection
export const withPermissionProtection = (
  WrappedComponent,
  requiredPermissions = []
) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredPermissions={requiredPermissions}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user } = useAuthStore();

  return {
    hasRole: (role) => {
      if (!user) return false;
      return user.role === role || user.role === ROLES.SUPER_ADMIN;
    },
    hasAnyRole: (roles) => {
      if (!user) return false;
      return roles.includes(user.role) || user.role === ROLES.SUPER_ADMIN;
    },
    hasPermission: (permission) => {
      if (!user) return false;
      return checkPermission(user.role, permission);
    },
    hasAnyPermission: (permissions) => {
      if (!user) return false;
      return permissions.some((permission) =>
        checkPermission(user.role, permission)
      );
    },
    hasAllPermissions: (permissions) => {
      if (!user) return false;
      return permissions.every((permission) =>
        checkPermission(user.role, permission)
      );
    },
    isSuperAdmin: () => {
      return user?.role === ROLES.SUPER_ADMIN;
    },
    isManager: () => {
      return user?.role === ROLES.MANAGER || user?.role === ROLES.SUPER_ADMIN;
    },
    isConsultant: () => {
      return (
        user?.role === ROLES.CONSULTANT ||
        user?.role === ROLES.MANAGER ||
        user?.role === ROLES.SUPER_ADMIN
      );
    },
    isReceptionist: () => {
      return (
        user?.role === ROLES.RECEPTIONIST ||
        user?.role === ROLES.MANAGER ||
        user?.role === ROLES.SUPER_ADMIN
      );
    },
    isStudent: () => {
      return user?.role === ROLES.STUDENT;
    },
  };
};

export default ProtectedRoute;
