import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Switch from "../../components/ui/Switch";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import {
  Settings,
  Shield,
  Mail,
  Globe,
  Bell,
  Lock,
  Database,
  Save,
} from "@lucide-react";

const SystemSettings = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [settings, setSettings] = useState({
    siteName: "",
    siteUrl: "",
    emailFrom: "",
    emailReplyTo: "",
    defaultTimezone: "",
    maintenanceMode: false,
    allowRegistrations: true,
    sessionTimeout: 30,
    backupFrequency: "daily",
    defaultLanguage: "en",
    twoFactorAuth: false,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "America/New_York" },
    { value: "Europe/London", label: "Europe/London" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo" },
    { value: "Australia/Sydney", label: "Australia/Sydney" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
  ];

  const backupFrequencies = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  useEffect(() => {
    if (user && hasPermission("view", "settings")) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await callApi("GET", "/super-admin/settings");
      setSettings(response || settings);
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch settings",
        type: "error",
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!hasPermission("edit", "settings")) {
      setToast({
        show: true,
        message: "You do not have permission to edit settings",
        type: "error",
      });
      return;
    }

    try {
      await callApi("PATCH", "/super-admin/settings", settings);
      setToast({
        show: true,
        message: "Settings saved successfully",
        type: "success",
      });
      await fetchSettings();
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to save settings",
        type: "error",
      });
    }
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission("view", "settings")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to view system settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences.
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={apiLoading || !hasPermission("edit", "settings")}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          General Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <Input
              value={settings.siteName}
              onChange={(e) => handleInputChange("siteName", e.target.value)}
              placeholder="Your Site Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site URL</label>
            <Input
              value={settings.siteUrl}
              onChange={(e) => handleInputChange("siteUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Default Timezone
            </label>
            <Select
              options={timezones}
              value={settings.defaultTimezone}
              onChange={(value) => handleInputChange("defaultTimezone", value)}
              placeholder="Select Timezone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Default Language
            </label>
            <Select
              options={languages}
              value={settings.defaultLanguage}
              onChange={(value) => handleInputChange("defaultLanguage", value)}
              placeholder="Select Language"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <Switch
            checked={settings.maintenanceMode}
            onChange={(checked) =>
              handleInputChange("maintenanceMode", checked)
            }
            label="Maintenance Mode"
          />
          <Switch
            checked={settings.allowRegistrations}
            onChange={(checked) =>
              handleInputChange("allowRegistrations", checked)
            }
            label="Allow New Registrations"
          />
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Email Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              From Email Address
            </label>
            <Input
              value={settings.emailFrom}
              onChange={(e) => handleInputChange("emailFrom", e.target.value)}
              placeholder="no-reply@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Reply-To Email Address
            </label>
            <Input
              value={settings.emailReplyTo}
              onChange={(e) =>
                handleInputChange("emailReplyTo", e.target.value)
              }
              placeholder="support@example.com"
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Security Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                handleInputChange("sessionTimeout", parseInt(e.target.value))
              }
              placeholder="30"
              min="5"
              max="1440"
            />
          </div>
        </div>
        <div className="mt-6">
          <Switch
            checked={settings.twoFactorAuth}
            onChange={(checked) => handleInputChange("twoFactorAuth", checked)}
            label="Enable Two-Factor Authentication"
          />
        </div>
      </Card>

      {/* Backup Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Backup Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Backup Frequency
            </label>
            <Select
              options={backupFrequencies}
              value={settings.backupFrequency}
              onChange={(value) => handleInputChange("backupFrequency", value)}
              placeholder="Select Frequency"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings;
