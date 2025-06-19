import React, { useState } from "react";
import {
  Plus,
  UserPlus,
  Calendar,
  FileText,
  MessageCircle,
  Building,
  Users,
  Phone,
  Mail,
  Video,
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

const QuickActions = ({
  title = "Quick Actions",
  actions = [],
  layout = "grid", // 'grid', 'list', 'compact'
  columns = 3, // for grid layout
  showCategories = true,
  showShortcuts = true,
  allowCustomize = false,
  onActionClick,
  onCustomize,
  className = "",
  variant = "default", // 'default', 'minimal', 'cards'
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAllActions, setShowAllActions] = useState(false);

  // Default actions based on user roles
  const defaultActions = {
    super_admin: [
      {
        id: "create_office",
        title: "Create Office",
        description: "Set up a new office location",
        icon: Building,
        color: "blue",
        category: "management",
        shortcut: "Ctrl+Shift+O",
        count: null,
      },
      {
        id: "create_staff",
        title: "Add Staff Member",
        description: "Create new user account",
        icon: UserPlus,
        color: "green",
        category: "management",
        shortcut: "Ctrl+Shift+U",
      },
      {
        id: "system_settings",
        title: "System Settings",
        description: "Configure system preferences",
        icon: Settings,
        color: "gray",
        category: "management",
      },
      {
        id: "global_reports",
        title: "Global Reports",
        description: "View system-wide analytics",
        icon: FileText,
        color: "purple",
        category: "reports",
      },
    ],
    manager: [
      {
        id: "assign_lead",
        title: "Assign Lead",
        description: "Assign lead to consultant",
        icon: Target,
        color: "orange",
        category: "leads",
        urgent: true,
      },
      {
        id: "schedule_meeting",
        title: "Team Meeting",
        description: "Schedule team meeting",
        icon: Users,
        color: "blue",
        category: "management",
      },
      {
        id: "office_reports",
        title: "Office Reports",
        description: "View office performance",
        icon: FileText,
        color: "purple",
        category: "reports",
      },
    ],
    consultant: [
      {
        id: "book_appointment",
        title: "Book Appointment",
        description: "Schedule student meeting",
        icon: Calendar,
        color: "blue",
        category: "appointments",
        shortcut: "Ctrl+Shift+A",
        count: 3,
      },
      {
        id: "add_student",
        title: "Add Student",
        description: "Register new student",
        icon: UserPlus,
        color: "green",
        category: "students",
        shortcut: "Ctrl+Shift+S",
      },
      {
        id: "send_message",
        title: "Send Message",
        description: "Contact student or colleague",
        icon: MessageCircle,
        color: "indigo",
        category: "communication",
      },
      {
        id: "upload_document",
        title: "Upload Document",
        description: "Add student documents",
        icon: Upload,
        color: "teal",
        category: "documents",
      },
    ],
    receptionist: [
      {
        id: "walk_in_registration",
        title: "Walk-in Registration",
        description: "Register walk-in student",
        icon: UserPlus,
        color: "green",
        category: "students",
        urgent: true,
      },
      {
        id: "appointment_booking",
        title: "Book Appointment",
        description: "Schedule for student",
        icon: Calendar,
        color: "blue",
        category: "appointments",
      },
      {
        id: "phone_call",
        title: "Make Call",
        description: "Contact student or consultant",
        icon: Phone,
        color: "green",
        category: "communication",
      },
    ],
    student: [
      {
        id: "book_appointment",
        title: "Book Appointment",
        description: "Schedule with consultant",
        icon: Calendar,
        color: "blue",
        category: "appointments",
      },
      {
        id: "upload_document",
        title: "Upload Document",
        description: "Submit required documents",
        icon: Upload,
        color: "teal",
        category: "documents",
        count: 2,
      },
      {
        id: "send_message",
        title: "Message Consultant",
        description: "Contact your consultant",
        icon: MessageCircle,
        color: "indigo",
        category: "communication",
      },
      {
        id: "join_meeting",
        title: "Join Meeting",
        description: "Join virtual appointment",
        icon: Video,
        color: "purple",
        category: "appointments",
      },
    ],
  };

  // Merge provided actions with defaults
  const allActions =
    actions.length > 0 ? actions : defaultActions.consultant || [];

  // Get categories
  const categories = [
    { id: "all", name: "All Actions", icon: Zap },
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "students", name: "Students", icon: Users },
    { id: "communication", name: "Communication", icon: MessageCircle },
    { id: "documents", name: "Documents", icon: FileText },
    { id: "management", name: "Management", icon: Settings },
    { id: "reports", name: "Reports", icon: FileText },
    { id: "leads", name: "Leads", icon: Target },
  ];

  // Filter actions by category
  const filteredActions =
    activeCategory === "all"
      ? allActions
      : allActions.filter((action) => action.category === activeCategory);

  // Color configurations
  const colorConfig = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
    indigo: "bg-indigo-500 hover:bg-indigo-600 text-white",
    teal: "bg-teal-500 hover:bg-teal-600 text-white",
    gray: "bg-gray-500 hover:bg-gray-600 text-white",
  };

  // Handle action click
  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  // Render action button based on variant and layout
  const renderAction = (action) => {
    const Icon = action.icon;
    const colorClass = colorConfig[action.color] || colorConfig.blue;

    if (variant === "cards") {
      return (
        <Card
          key={action.id}
          className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-gray-300 dark:hover:border-gray-600"
          onClick={() => handleActionClick(action)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {action.title}
                </h4>
                {action.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {action.urgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
              {action.count && (
                <Badge variant="secondary" className="text-xs">
                  {action.count}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {showShortcuts && action.shortcut && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Shortcut: {action.shortcut}
              </span>
            </div>
          )}
        </Card>
      );
    }

    if (layout === "list") {
      return (
        <button
          key={action.id}
          onClick={() => handleActionClick(action)}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {action.title}
              </div>
              {action.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {action.urgent && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
            {action.count && (
              <Badge variant="secondary" className="text-xs">
                {action.count}
              </Badge>
            )}
            {showShortcuts && action.shortcut && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {action.shortcut}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </button>
      );
    }

    // Grid layout (default)
    return (
      <button
        key={action.id}
        onClick={() => handleActionClick(action)}
        className={`
          relative p-4 rounded-lg transition-all duration-200 text-center group
          ${
            variant === "minimal"
              ? "hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              : `${colorClass} shadow-sm hover:shadow-md`
          }
        `}
      >
        {/* Urgent indicator */}
        {action.urgent && (
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Count badge */}
        {action.count && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
              {action.count}
            </Badge>
          </div>
        )}

        <div className="flex flex-col items-center space-y-2">
          <Icon
            className={`h-6 w-6 ${
              variant === "minimal" ? "text-gray-600 dark:text-gray-400" : ""
            }`}
          />
          <div>
            <div
              className={`font-medium text-sm ${
                variant === "minimal" ? "text-gray-900 dark:text-white" : ""
              }`}
            >
              {action.title}
            </div>
            {layout !== "compact" && action.description && (
              <div
                className={`text-xs mt-1 ${
                  variant === "minimal"
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-white/80"
                }`}
              >
                {action.description}
              </div>
            )}
          </div>
        </div>

        {showShortcuts && action.shortcut && layout !== "compact" && (
          <div
            className={`text-xs mt-2 ${
              variant === "minimal"
                ? "text-gray-500 dark:text-gray-400"
                : "text-white/60"
            }`}
          >
            {action.shortcut}
          </div>
        )}
      </button>
    );
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredActions.length} actions available
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {allowCustomize && (
              <Button variant="outline" size="sm" onClick={onCustomize}>
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        {showCategories && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const hasActions =
                category.id === "all" ||
                allActions.some((action) => action.category === category.id);

              if (!hasActions) return null;

              const CategoryIcon = category.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      activeCategory === category.id
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <CategoryIcon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div
          className={
            layout === "list" || variant === "cards"
              ? "space-y-2"
              : layout === "compact"
              ? `grid grid-cols-4 sm:grid-cols-6 gap-3`
              : `grid grid-cols-2 sm:grid-cols-${columns} gap-4`
          }
        >
          {filteredActions
            .slice(
              0,
              showAllActions ? undefined : layout === "compact" ? 12 : 9
            )
            .map(renderAction)}
        </div>

        {/* Show More Button */}
        {!showAllActions &&
          filteredActions.length > (layout === "compact" ? 12 : 9) && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => setShowAllActions(true)}>
                Show {filteredActions.length - (layout === "compact" ? 12 : 9)}{" "}
                More Actions
              </Button>
            </div>
          )}

        {/* Empty State */}
        {filteredActions.length === 0 && (
          <div className="text-center py-8">
            <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No actions available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try selecting a different category
            </p>
          </div>
        )}

        {/* Keyboard Shortcuts Info */}
        {showShortcuts && layout !== "compact" && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Press keyboard shortcuts for quick access</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuickActions;
