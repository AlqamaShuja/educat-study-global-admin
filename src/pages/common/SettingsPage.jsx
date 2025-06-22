import React, { useState } from "react";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Monitor,
  Smartphone,
  Mail,
  MessageCircle,
  Calendar,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  ChevronRight,
  User,
  Lock,
  Palette,
  HardDrive,
  Zap,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// Mock components - replace with your actual imports


const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: Shield,
      color: "from-violet-500 to-purple-500",
    },
    {
      id: "data",
      label: "Data & Storage",
      icon: Database,
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const ToggleSwitch = ({ defaultChecked = false, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="sr-only peer"
        onChange={onChange}
      />
      <div className="w-14 h-7 bg-blue-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 shadow-inner"></div>
    </label>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Language & Region
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-3">
              Language
            </label>
            <select className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/50 backdrop-blur focus:border-purple-400 focus:ring-4 focus:ring-purple-200 transition-all">
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-3">
              Timezone
            </label>
            <select className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/50 backdrop-blur focus:border-purple-400 focus:ring-4 focus:ring-purple-200 transition-all">
              <option value="UTC">🌍 UTC</option>
              <option value="America/New_York">🗽 Eastern Time</option>
              <option value="America/Chicago">🏙️ Central Time</option>
              <option value="America/Denver">🏔️ Mountain Time</option>
              <option value="America/Los_Angeles">🌴 Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-3">
              Date Format
            </label>
            <select className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/50 backdrop-blur focus:border-purple-400 focus:ring-4 focus:ring-purple-200 transition-all">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            System Preferences
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Save className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800">
                  Auto-save drafts
                </h4>
                <p className="text-blue-600">
                  Automatically save your work every 30 seconds
                </p>
              </div>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Zap className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800">
                  Keyboard shortcuts
                </h4>
                <p className="text-blue-800">
                  Enable keyboard shortcuts for faster navigation
                </p>
              </div>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Notification Channels
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Bell,
              label: "Push Notifications",
              desc: "Browser notifications",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Mail,
              label: "Email Notifications",
              desc: "Email alerts and updates",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: Smartphone,
              label: "SMS Notifications",
              desc: "Text message alerts",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: MessageCircle,
              label: "In-App Messages",
              desc: "Messages within the application",
              color: "from-violet-500 to-purple-500",
            },
          ].map((channel, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-r from-white/80 to-blue-50/50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 bg-gradient-to-r ${channel.color} rounded-xl shadow-lg`}
                  >
                    <channel.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800">
                      {channel.label}
                    </h4>
                    <p className="text-blue-600 text-sm">{channel.desc}</p>
                  </div>
                </div>
                <ToggleSwitch defaultChecked={true} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Notification Types
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "New appointments",
            "Meeting reminders",
            "Document updates",
            "System alerts",
            "Weekly reports",
            "Account changes",
          ].map((type, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            >
              <span className="text-sm font-medium text-blue-700">{type}</span>
              <ToggleSwitch defaultChecked={true} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Theme Selection
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              id: "light",
              label: "Light",
              icon: Sun,
              gradient: "from-yellow-400 to-orange-500",
            },
            {
              id: "dark",
              label: "Dark",
              icon: Moon,
              gradient: "from-slate-700 to-slate-900",
            },
            {
              id: "system",
              label: "System",
              icon: Monitor,
              gradient: "from-blue-500 to-blue-800",
            },
          ].map((themeOption) => (
            <button
              key={themeOption.id}
              className="group p-6 border-2 border-blue-200 rounded-2xl flex flex-col items-center space-y-4 transition-all duration-300 hover:border-purple-400 hover:shadow-lg bg-white/50 backdrop-blur"
            >
              <div
                className={`p-4 bg-gradient-to-r ${themeOption.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <themeOption.icon className="h-8 w-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-blue-800">
                {themeOption.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
            <Monitor className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Display Options
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800">
                  Compact mode
                </h4>
                <p className="text-blue-600">
                  Show more content with reduced spacing
                </p>
              </div>
            </div>
            <ToggleSwitch />
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Zap className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800">
                  Show animations
                </h4>
                <p className="text-blue-800">
                  Enable smooth transitions and animations
                </p>
              </div>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Privacy Controls
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800">
                  Activity tracking
                </h4>
                <p className="text-blue-600">
                  Track your activity for analytics and improvements
                </p>
              </div>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Globe className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800">
                  Show online status
                </h4>
                <p className="text-blue-800">
                  Let others see when you're online
                </p>
              </div>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Data Sharing
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <span className="text-sm font-medium text-blue-700">
              Share usage data
            </span>
            <ToggleSwitch />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <span className="text-sm font-medium text-purple-700">
              Marketing communications
            </span>
            <ToggleSwitch />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Data Management
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800">
                  Export Data
                </h4>
                <p className="text-blue-600">Download a copy of your data</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <RefreshCw className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800">
                  Clear Cache
                </h4>
                <p className="text-blue-800">
                  Clear cached data to free up space
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-800">
                  Delete Account
                </h4>
                <p className="text-red-600">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Storage Overview
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="text-blue-700">Used Storage</span>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              2.4 GB of 10 GB
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-800 h-4 rounded-full shadow-lg transition-all duration-1000"
                style={{ width: "24%" }}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                24%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-blue-700">Documents</span>
              </div>
              <span className="text-2xl font-bold text-blue-800">1.8 GB</span>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-purple-700">Images</span>
              </div>
              <span className="text-2xl font-bold text-purple-800">0.6 GB</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-xl text-blue-600 max-w-2xl mx-auto">
            Customize your experience and manage your account preferences with
            our beautiful interface
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-2">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        w-full flex items-center space-x-4 px-6 py-4 text-left rounded-xl transition-all duration-300 group
                        ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-blue-500 to-blue-800 text-white shadow-lg transform scale-105"
                            : "text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md"
                        }
                      `}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          activeSection === section.id
                            ? "bg-white/20"
                            : `bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-300`
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            activeSection === section.id
                              ? "text-white"
                              : "text-white"
                          }`}
                        />
                      </div>
                      <span className="font-semibold text-lg">
                        {section.label}
                      </span>
                      <ChevronRight
                        className={`h-5 w-5 ml-auto transition-transform duration-300 ${
                          activeSection === section.id
                            ? "rotate-90"
                            : "group-hover:translate-x-1"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeSection === "general" && renderGeneralSettings()}
            {activeSection === "notifications" && renderNotificationSettings()}
            {activeSection === "appearance" && renderAppearanceSettings()}
            {activeSection === "privacy" && renderPrivacySettings()}
            {activeSection === "data" && renderDataSettings()}

            {/* Save Button */}
            <div className="mt-12 flex justify-center">
              <Button
                size="lg"
                className="px-12 py-4 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <Save className="h-6 w-6 mr-3" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
