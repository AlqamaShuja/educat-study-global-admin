import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useNotifications from "../../hooks/useNotifications";
import useUIStore from "../../stores/uiStore";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Badge from "../ui/Badge";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { theme, setTheme } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    setMobileMenuOpen(false);
  };

  const getNavigationItems = () => {
    if (!user) {
      return [
        { name: "Home", href: "/", current: location.pathname === "/" },
        {
          name: "About",
          href: "/about",
          current: location.pathname === "/about",
        },
        {
          name: "Contact",
          href: "/contact",
          current: location.pathname === "/contact",
        },
      ];
    }

    // For authenticated users, minimal nav items (since Sidebar handles main navigation)
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        current: location.pathname === "/dashboard",
      },
    ];
  };

  const navigationItems = getNavigationItems();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={user ? "/dashboard" : "/"}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-semibold text-foreground hidden sm:block">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Primary Navigation - Desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    item.current
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="p-2"
                >
                  {theme === "light" ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                </Button>

                {/* Notifications */}
                <Dropdown
                  position="bottom-right"
                  trigger={
                    <button className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </button>
                  }
                  className="w-80"
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <Badge variant="primary" size="sm">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {!notifications?.length ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 border-b border-border hover:bg-muted text-left transition-colors ${
                            !notification.read ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${
                                  !notification.read
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-2 flex-shrink-0"></div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {notifications?.length > 5 && (
                    <div className="p-2 border-t border-border">
                      <Link
                        to="/notifications"
                        className="block w-full text-center text-sm text-primary hover:text-primary-foreground py-2"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </Dropdown>

                {/* Profile dropdown */}
                <Dropdown
                  position="bottom-right"
                  trigger={
                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.role?.replace("_", " ") || "Role"}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  }
                >
                  <Dropdown.Item onClick={() => navigate("/profile")}>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => navigate("/settings")}>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item onClick={handleLogout}>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
              </>
            ) : (
              /* Guest navigation */
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                >
                  Sign in
                </Link>
                <Button onClick={() => navigate("/auth/register")} size="sm">
                  Sign up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  item.current
                    ? "bg-primary/10 border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {user && (
            <div className="pt-4 pb-3 border-t border-border">
              <div className="flex items-center px-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">
                    {user?.name || "User"}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {user?.role?.replace("_", " ") || "Role"}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="ml-auto">
                    <Badge variant="destructive" size="sm">
                      {unreadCount}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/notifications"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" size="sm" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="pt-4 pb-3 border-t border-border">
              <div className="space-y-1">
                <Link
                  to="/auth/login"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import useAuthStore from "../../stores/authStore";
// import useNotificationStore from "../../stores/notificationStore";
// import useUIStore from "../../stores/uiStore";
// import Button from "../ui/Button";
// import Dropdown from "../ui/Dropdown";
// import Badge from "../ui/Badge";

// const Navbar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, logout } = useAuthStore();
//   const { notifications, unreadCount, markAsRead } = useNotificationStore();
//   const { theme, setTheme } = useUIStore();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const getNavigationItems = () => {
//     if (!user) {
//       return [
//         { name: "Home", href: "/", current: location.pathname === "/" },
//         {
//           name: "About",
//           href: "/about",
//           current: location.pathname === "/about",
//         },
//         {
//           name: "Contact",
//           href: "/contact",
//           current: location.pathname === "/contact",
//         },
//       ];
//     }

//     const baseItems = [
//       {
//         name: "Dashboard",
//         href: "/dashboard",
//         current: location.pathname === "/dashboard",
//       },
//     ];

//     const roleSpecificItems = {
//       super_admin: [
//         {
//           name: "Offices",
//           href: "/super-admin/offices",
//           current: location.pathname.startsWith("/super-admin/offices"),
//         },
//         {
//           name: "Staff",
//           href: "/super-admin/staff",
//           current: location.pathname.startsWith("/super-admin/staff"),
//         },
//         {
//           name: "Universities",
//           href: "/super-admin/universities",
//           current: location.pathname.startsWith("/super-admin/universities"),
//         },
//         {
//           name: "Reports",
//           href: "/super-admin/reports",
//           current: location.pathname.startsWith("/super-admin/reports"),
//         },
//       ],
//       manager: [
//         {
//           name: "Team",
//           href: "/manager/team",
//           current: location.pathname.startsWith("/manager/team"),
//         },
//         {
//           name: "Leads",
//           href: "/manager/leads",
//           current: location.pathname.startsWith("/manager/leads"),
//         },
//         {
//           name: "Schedules",
//           href: "/manager/schedules",
//           current: location.pathname.startsWith("/manager/schedules"),
//         },
//       ],
//       consultant: [
//         {
//           name: "My Leads",
//           href: "/consultant/leads",
//           current: location.pathname.startsWith("/consultant/leads"),
//         },
//         {
//           name: "Appointments",
//           href: "/consultant/appointments",
//           current: location.pathname.startsWith("/consultant/appointments"),
//         },
//         {
//           name: "Documents",
//           href: "/consultant/documents",
//           current: location.pathname.startsWith("/consultant/documents"),
//         },
//       ],
//       receptionist: [
//         {
//           name: "Walk-ins",
//           href: "/receptionist/walk-in",
//           current: location.pathname.startsWith("/receptionist/walk-in"),
//         },
//         {
//           name: "Appointments",
//           href: "/receptionist/appointments",
//           current: location.pathname.startsWith("/receptionist/appointments"),
//         },
//         {
//           name: "Calendars",
//           href: "/receptionist/calendars",
//           current: location.pathname.startsWith("/receptionist/calendars"),
//         },
//       ],
//       student: [
//         {
//           name: "Profile",
//           href: "/student/profile",
//           current: location.pathname.startsWith("/student/profile"),
//         },
//         {
//           name: "Applications",
//           href: "/student/applications",
//           current: location.pathname.startsWith("/student/applications"),
//         },
//         {
//           name: "Documents",
//           href: "/student/documents",
//           current: location.pathname.startsWith("/student/documents"),
//         },
//       ],
//     };

//     return [...baseItems, ...(roleSpecificItems[user?.role] || [])];
//   };

//   const navigationItems = getNavigationItems();

//   const handleNotificationClick = (notification) => {
//     if (!notification.readAt) {
//       markAsRead(notification.id);
//     }
//     // Handle navigation based on notification type
//     // This could be enhanced to navigate to specific pages based on notification content
//   };

//   return (
//     <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Logo and primary navigation */}
//           <div className="flex">
//             {/* Logo */}
//             <div className="flex-shrink-0 flex items-center">
//               <Link
//                 to={user ? "/dashboard" : "/"}
//                 className="flex items-center space-x-3"
//               >
//                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold text-sm">A</span>
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900 hidden sm:block">
//                   Admin Panel
//                 </span>
//               </Link>
//             </div>

//             {/* Primary Navigation - Desktop */}
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               {navigationItems.map((item) => (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
//                     item.current
//                       ? "border-blue-500 text-gray-900"
//                       : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
//                   }`}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* Secondary navigation */}
//           <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
//             {user ? (
//               <>
//                 {/* Theme Toggle */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//                   className="p-2"
//                 >
//                   {theme === "light" ? (
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
//                       />
//                     </svg>
//                   )}
//                 </Button>

//                 {/* Notifications */}
//                 <Dropdown
//                   position="bottom-right"
//                   trigger={
//                     <button className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
//                       <svg
//                         className="w-6 h-6"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                         />
//                       </svg>
//                       {unreadCount > 0 && (
//                         <Badge
//                           variant="danger"
//                           size="sm"
//                           className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
//                         >
//                           {unreadCount > 9 ? "9+" : unreadCount}
//                         </Badge>
//                       )}
//                     </button>
//                   }
//                   className="w-80"
//                 >
//                   <div className="p-4 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-sm font-medium text-gray-900">
//                         Notifications
//                       </h3>
//                       {unreadCount > 0 && (
//                         <Badge variant="primary" size="sm">
//                           {unreadCount} new
//                         </Badge>
//                       )}
//                     </div>
//                   </div>

//                   <div className="max-h-64 overflow-y-auto">
//                     {notifications.length === 0 ? (
//                       <div className="p-4 text-center text-gray-500 text-sm">
//                         No notifications
//                       </div>
//                     ) : (
//                       notifications.slice(0, 5).map((notification) => (
//                         <button
//                           key={notification.id}
//                           onClick={() => handleNotificationClick(notification)}
//                           className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
//                             !notification.readAt ? "bg-blue-50" : ""
//                           }`}
//                         >
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1 min-w-0">
//                               <p
//                                 className={`text-sm ${
//                                   !notification.readAt
//                                     ? "font-medium text-gray-900"
//                                     : "text-gray-700"
//                                 }`}
//                               >
//                                 {notification.message}
//                               </p>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {new Date(
//                                   notification.createdAt
//                                 ).toLocaleString()}
//                               </p>
//                             </div>
//                             {!notification.readAt && (
//                               <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2 flex-shrink-0"></div>
//                             )}
//                           </div>
//                         </button>
//                       ))
//                     )}
//                   </div>

//                   {notifications.length > 5 && (
//                     <div className="p-2 border-t border-gray-200">
//                       <Link
//                         to="/notifications"
//                         className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
//                       >
//                         View all notifications
//                       </Link>
//                     </div>
//                   )}
//                 </Dropdown>

//                 {/* Profile dropdown */}
//                 <Dropdown
//                   position="bottom-right"
//                   trigger={
//                     <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
//                       <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                         <span className="text-gray-600 font-medium text-sm">
//                           {user?.name?.charAt(0)?.toUpperCase() || "U"}
//                         </span>
//                       </div>
//                       <div className="hidden md:block text-left">
//                         <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
//                           {user?.name}
//                         </p>
//                         <p className="text-xs text-gray-500 capitalize">
//                           {user?.role?.replace("_", " ")}
//                         </p>
//                       </div>
//                       <svg
//                         className="w-4 h-4 text-gray-500"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </button>
//                   }
//                 >
//                   <Dropdown.Item onClick={() => navigate("/profile")}>
//                     <div className="flex items-center space-x-2">
//                       <svg
//                         className="w-4 h-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       <span>Your Profile</span>
//                     </div>
//                   </Dropdown.Item>

//                   <Dropdown.Item onClick={() => navigate("/settings")}>
//                     <div className="flex items-center space-x-2">
//                       <svg
//                         className="w-4 h-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                       </svg>
//                       <span>Settings</span>
//                     </div>
//                   </Dropdown.Item>

//                   <Dropdown.Divider />

//                   <Dropdown.Item onClick={handleLogout}>
//                     <div className="flex items-center space-x-2">
//                       <svg
//                         className="w-4 h-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                         />
//                       </svg>
//                       <span>Sign out</span>
//                     </div>
//                   </Dropdown.Item>
//                 </Dropdown>
//               </>
//             ) : (
//               /* Guest navigation */
//               <div className="flex items-center space-x-4">
//                 <Link
//                   to="/login"
//                   className="text-gray-500 hover:text-gray-700 text-sm font-medium"
//                 >
//                   Sign in
//                 </Link>
//                 <Button onClick={() => navigate("/signup")} size="sm">
//                   Sign up
//                 </Button>
//               </div>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="flex items-center sm:hidden">
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
//             >
//               <span className="sr-only">Open main menu</span>
//               {mobileMenuOpen ? (
//                 <svg
//                   className="block h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               ) : (
//                 <svg
//                   className="block h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {mobileMenuOpen && (
//         <div className="sm:hidden">
//           <div className="pt-2 pb-3 space-y-1">
//             {navigationItems.map((item) => (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
//                   item.current
//                     ? "bg-blue-50 border-blue-500 text-blue-700"
//                     : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
//                 }`}
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 {item.name}
//               </Link>
//             ))}
//           </div>

//           {user && (
//             <div className="pt-4 pb-3 border-t border-gray-200">
//               <div className="flex items-center px-4">
//                 <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//                   <span className="text-gray-600 font-medium">
//                     {user?.name?.charAt(0)?.toUpperCase() || "U"}
//                   </span>
//                 </div>
//                 <div className="ml-3">
//                   <div className="text-base font-medium text-gray-800">
//                     {user?.name}
//                   </div>
//                   <div className="text-sm text-gray-500 capitalize">
//                     {user?.role?.replace("_", " ")}
//                   </div>
//                 </div>
//                 {unreadCount > 0 && (
//                   <div className="ml-auto">
//                     <Badge variant="danger" size="sm">
//                       {unreadCount}
//                     </Badge>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-3 space-y-1">
//                 <Link
//                   to="/profile"
//                   className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Your Profile
//                 </Link>
//                 <Link
//                   to="/settings"
//                   className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Settings
//                 </Link>
//                 <Link
//                   to="/notifications"
//                   className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Notifications
//                   {unreadCount > 0 && (
//                     <Badge variant="danger" size="sm" className="ml-2">
//                       {unreadCount}
//                     </Badge>
//                   )}
//                 </Link>
//                 <button
//                   onClick={() => {
//                     setMobileMenuOpen(false);
//                     handleLogout();
//                   }}
//                   className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                 >
//                   Sign out
//                 </button>
//               </div>
//             </div>
//           )}

//           {!user && (
//             <div className="pt-4 pb-3 border-t border-gray-200">
//               <div className="space-y-1">
//                 <Link
//                   to="/login"
//                   className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Sign in
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Sign up
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
