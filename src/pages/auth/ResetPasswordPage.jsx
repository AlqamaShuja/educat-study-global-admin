import React from "react";
import { Link } from "react-router-dom";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
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
          Set new password
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Choose a strong password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPasswordForm />

        {/* Security Tips */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Password Security Tips
          </h3>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>• Use at least 8 characters</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Add numbers and special characters</li>
            <li>• Avoid common words or personal information</li>
            <li>• Don't reuse passwords from other accounts</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          Having trouble?{" "}
          <Link
            to="/support"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
