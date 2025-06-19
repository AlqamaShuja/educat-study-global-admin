import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  const { resetPassword, validateResetToken, isLoading, error } =
    useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    const checkToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        return;
      }

      try {
        const result = await validateResetToken(token, email);
        setTokenValid(result.valid);
      } catch (err) {
        setTokenValid(false);
      }
    };

    checkToken();
  }, [token, email, validateResetToken]);

  const onSubmit = async (data) => {
    if (!token || !email) {
      setError("root", { message: "Invalid reset link" });
      return;
    }

    try {
      const result = await resetPassword(token, email, data.password);
      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } else {
        setError("root", {
          message: result.error || "Failed to reset password",
        });
      }
    } catch (err) {
      setError("root", { message: "An unexpected error occurred" });
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Validating reset link...
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button as={Link} to="/auth/forgot-password" className="w-full">
              Request new reset link
            </Button>

            <Button
              as={Link}
              to="/auth/login"
              variant="outline"
              className="w-full"
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your password has been successfully reset.
            </p>
            <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              Redirecting to sign in page in 3 seconds...
            </p>
          </div>

          <div className="mt-8">
            <Button as={Link} to="/auth/login" className="w-full">
              Continue to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set new password
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                {...register("password")}
                error={errors.password?.message}
                disabled={isSubmitting || isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Password strength:
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength.strength <= 2
                        ? "text-red-600"
                        : passwordStrength.strength <= 3
                        ? "text-yellow-600"
                        : passwordStrength.strength <= 4
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pl-10 pr-10"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                disabled={isSubmitting || isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isSubmitting || isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Password must contain:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li
                className={`flex items-center ${
                  password && password.length >= 8
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }`}
              >
                <CheckCircle
                  className={`mr-2 h-3 w-3 ${
                    password && password.length >= 8
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                At least 8 characters
              </li>
              <li
                className={`flex items-center ${
                  password && /[a-z]/.test(password)
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }`}
              >
                <CheckCircle
                  className={`mr-2 h-3 w-3 ${
                    password && /[a-z]/.test(password)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                One lowercase letter
              </li>
              <li
                className={`flex items-center ${
                  password && /[A-Z]/.test(password)
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }`}
              >
                <CheckCircle
                  className={`mr-2 h-3 w-3 ${
                    password && /[A-Z]/.test(password)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                One uppercase letter
              </li>
              <li
                className={`flex items-center ${
                  password && /\d/.test(password)
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }`}
              >
                <CheckCircle
                  className={`mr-2 h-3 w-3 ${
                    password && /\d/.test(password)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                One number
              </li>
            </ul>
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
        <div className="mt-6 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
