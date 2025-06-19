import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, ArrowLeft, Home, LogOut, HelpCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const roleRoutes = {
      super_admin: "/super-admin/dashboard",
      manager: "/manager/dashboard",
      consultant: "/consultant/dashboard",
      receptionist: "/receptionist/dashboard",
      student: "/student/dashboard",
    };

    const dashboardRoute = roleRoutes[user?.role] || "/dashboard";
    navigate(dashboardRoute);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 403 Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don't have permission to access this page. Contact your
            administrator if you believe this is an error.
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Signed in as:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-gray-500 dark:text-gray-500 capitalize">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button onClick={handleGoHome} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>

          <Button variant="outline" onClick={handleGoBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 space-y-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Need Help?
            </h3>
            <div className="space-y-2">
              <Link
                to="/help"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <HelpCircle className="h-4 w-4 inline mr-2" />
                Help Center
              </Link>
              <Link
                to="/support"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Contact Support
              </Link>
              <Link
                to="/permissions"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>

        {/* Permission Info */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <HelpCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Why am I seeing this?
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This page requires specific permissions that your current role
                doesn't have. Contact your system administrator to request
                access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <p>Error Code: 403 | Forbidden Access</p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
