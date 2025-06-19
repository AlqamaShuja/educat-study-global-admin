import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import SignupForm from "../../components/auth/SignupForm";

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignupSuccess = (userData) => {
    // For new signups, typically redirect to onboarding or profile completion
    const roleRoutes = {
      super_admin: "/super-admin/dashboard",
      manager: "/manager/dashboard",
      consultant: "/consultant/dashboard",
      receptionist: "/receptionist/dashboard",
      student: "/student/profile", // Students might need to complete profile first
    };

    const redirectTo = roleRoutes[userData.role] || "/dashboard";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm onSuccess={handleSignupSuccess} />

        {/* Account Types Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Account Types
          </h3>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <p>
              <strong>Student:</strong> Book appointments, upload documents,
              track progress
            </p>
            <p>
              <strong>Consultant:</strong> Manage students, schedule meetings,
              review applications
            </p>
            <p>
              <strong>Receptionist:</strong> Handle walk-ins, book appointments,
              manage calendars
            </p>
            <p>
              <strong>Manager:</strong> Oversee office operations, manage staff,
              view reports
            </p>
          </div>
        </div>

        {/* Additional Info */}
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
        <p>
          By creating an account, you agree to our{" "}
          <Link
            to="/terms"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
