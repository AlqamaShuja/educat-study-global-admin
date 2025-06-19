// OAuthRedirectPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const OAuthRedirectPage = () => {
  const { handleOAuthRedirect, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      const result = await handleOAuthRedirect();
      if (result?.success) navigate("/dashboard");
      else navigate("/auth/login");
    };
    completeLogin();
  }, [handleOAuthRedirect, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Finishing login process...
        </p>
      </div>
    </div>
  );
};

export default OAuthRedirectPage;
