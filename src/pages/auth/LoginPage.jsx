import React, { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import LoginForm from "../../components/auth/LoginForm";
import { getDefaultRouteByRole } from "../../config/routes";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

//   const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (isAuthenticated && user) {
        const pathname = getDefaultRouteByRole(user.role);
      navigate(pathname, { replace: true });
    }
  }, [isAuthenticated, user]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 px-3 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EduCRM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link
            to="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            create a new account
          </Link>
        </p> */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />

        {/* Additional Links */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                Need help?
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4 text-sm">
            <Link
              to="/support"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Contact Support
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              to="/help"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2025 Admin Panel. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link
            to="/privacy"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
