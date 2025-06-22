import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import { getDefaultRouteByRole } from "../../config/routes";

const NotFoundPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    console.log(user, ":asjcnasascknasnca");
    
    const pathname = getDefaultRouteByRole(user.role);
    navigate(pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-background text-foreground flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              404
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

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
        </div>

        {/* Helpful Links */}
        <div className="mt-8 space-y-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Popular Pages
            </h3>
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Profile Settings
              </Link>
              <Link
                to="/help"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Help Center
              </Link>
              <Link
                to="/support"
                className="block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Search className="h-4 w-4" />
            <span>Try searching for what you need</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <p>Error Code: 404 | Page Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
