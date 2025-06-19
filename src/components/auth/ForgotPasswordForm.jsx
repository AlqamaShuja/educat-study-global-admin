import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError("root", {
          message: result.error || "Failed to send reset email",
        });
      }
    } catch (err) {
      setError("root", { message: "An unexpected error occurred" });
    }
  };

  const resendEmail = async () => {
    const email = getValues("email");
    if (email) {
      try {
        const result = await forgotPassword(email);
        if (!result.success) {
          setError("root", {
            message: result.error || "Failed to resend email",
          });
        }
      } catch (err) {
        setError("root", { message: "An unexpected error occurred" });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {getValues("email")}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Didn't receive the email?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>Check your spam folder, or</p>
                    <button
                      onClick={resendEmail}
                      disabled={isLoading}
                      className="font-medium underline hover:no-underline disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "click here to resend"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              as={Link}
              to="/auth/login"
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot your password?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register("email")}
                error={errors.email?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {(errors.root || error) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.root?.message || error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset password
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6">
          <Link
            to="/auth/login"
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Still having trouble? Contact our{" "}
            <Link
              to="/support"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline"
            >
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
