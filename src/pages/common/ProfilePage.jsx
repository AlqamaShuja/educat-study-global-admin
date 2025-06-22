import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  Bell,
  Shield,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      timezone: user?.timezone || "UTC",
      language: user?.language || "en",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
  };

  const handleProfileUpdate = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateProfile(formData);
      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      resetPasswordForm();
      toast.success("Password changed successfully", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="p-6 border border-blue-200 bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          Profile Photo
        </h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white border-4 border-blue-200 flex items-center justify-center">
                <User className="h-12 w-12 text-blue-500" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-blue-800">
              Upload a new profile photo (JPG, PNG, GIF, max 5MB)
            </p>
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 border border-blue-200 bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Personal Information
        </h3>
        <form
          onSubmit={handleProfileSubmit(handleProfileUpdate)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Name
              </label>
              <Input
                {...registerProfile("name")}
                error={profileErrors.name?.message}
                className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
                leftIcon={<User className="h-4 w-4 text-blue-500" />}
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              {...registerProfile("email")}
              error={profileErrors.email?.message}
              className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
              leftIcon={<Mail className="h-4 w-4 text-blue-500" />}
            />
          </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              {...registerProfile("phone")}
              error={profileErrors.phone?.message}
              className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
              leftIcon={<Phone className="h-4 w-4 text-blue-500" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Address
            </label>
            <Input
              {...registerProfile("address")}
              error={profileErrors.address?.message}
              className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
              leftIcon={<MapPin className="h-4 w-4 text-blue-500" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Bio
            </label>
            <textarea
              {...registerProfile("bio")}
              rows={4}
              className="w-full px-3 py-2 border border-blue-200 bg-white text-blue-800 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Tell us about yourself..."
            />
            {profileErrors.bio && (
              <p className="mt-1 text-sm text-purple-600">
                {profileErrors.bio.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Timezone
              </label>
              <select
                {...registerProfile("timezone")}
                className="w-full px-3 py-2 border border-blue-200 bg-white text-blue-800 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="America/Los_Angeles">
                  America/Los Angeles (PST)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Language
              </label>
              <select
                {...registerProfile("language")}
                className="w-full px-3 py-2 border border-blue-200 bg-white text-blue-800 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isProfileSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              variant="primary"
            >
              {isProfileSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="p-6 border border-blue-200 bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-500" />
          Change Password
        </h3>
        <form
          onSubmit={handlePasswordSubmit(handlePasswordChange)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                {...registerPassword("currentPassword")}
                error={passwordErrors.currentPassword?.message}
                className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500 pr-10"
                leftIcon={<Lock className="h-4 w-4 text-blue-500" />}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                {...registerPassword("newPassword")}
                error={passwordErrors.newPassword?.message}
                className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500 pr-10"
                leftIcon={<Lock className="h-4 w-4 text-blue-500" />}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              {...registerPassword("confirmPassword")}
              error={passwordErrors.confirmPassword?.message}
              className="border-blue-200 bg-white text-blue-800 focus:ring-purple-500 focus:border-purple-500"
              leftIcon={<Lock className="h-4 w-4 text-blue-500" />}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPasswordSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              variant="primary"
            >
              {isPasswordSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6 border border-blue-200 bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">
              Add an extra layer of security to your account
            </p>
            <p className="text-sm text-blue-600">
              Enable 2FA via authenticator app or SMS
            </p>
          </div>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
          >
            Enable 2FA
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6 border border-blue-200 bg-white">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-500" />
          Active Sessions
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-800">Current Session</p>
              <p className="text-sm text-blue-600">
                Chrome on Windows • 192.168.1.1 • Last active: Just now
              </p>
            </div>
            <Badge variant="success" className="bg-blue-100 text-blue-800">
              Active
            </Badge>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-200 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sign Out All Other Sessions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card className="p-6 border border-blue-200 bg-white">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-500" />
        Notification Preferences
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Email Notifications</p>
            <p className="text-sm text-blue-600">Receive updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-blue-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Push Notifications</p>
            <p className="text-sm text-blue-600">Receive real-time alerts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-blue-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            variant="primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderPrivacyTab = () => (
    <Card className="p-6 border border-blue-200 bg-white">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-500" />
        Privacy Settings
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Profile Visibility</p>
            <p className="text-sm text-blue-600">
              Control who can see your profile
            </p>
          </div>
          <select className="px-3 py-2 border border-blue-200 bg-white text-blue-800 rounded-md focus:ring-purple-500 focus:border-purple-500">
            <option value="public">Public</option>
            <option value="contacts">Contacts Only</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Data Sharing</p>
            <p className="text-sm text-blue-600">
              Allow data sharing with third parties
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-blue-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
          >
            Download Data
          </Button>
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-200 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </header>

        {/* User Info Card */}
        <Card className="p-6 border border-blue-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-blue-800">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-blue-600">{user?.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-1 bg-blue-100 text-blue-800"
                >
                  {user?.role?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveTab("profile")}
              className="border-blue-200 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="bg-white border border-blue-200 rounded-lg p-2 flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors duration-200
                  ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-blue-600 hover:bg-blue-200"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "notifications" && renderNotificationsTab()}
        {activeTab === "privacy" && renderPrivacyTab()}
      </div>
    </div>
  );
};

export default ProfilePage;
