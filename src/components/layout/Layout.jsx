import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuthStore from "../../stores/authStore";
import useUIStore from "../../stores/uiStore";

const Layout = ({ children }) => {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, theme } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`h-screen w-screen overflow-hidden bg-background text-foreground`}
    >
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-card shadow-lg transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0 bg-background text-foreground" : "-translate-x-full"}
          lg:translate-x-0
          ${isSidebarOpen ? "w-64" : "lg:hidden"}
        `}
      >
        <Sidebar onClose={() => setMobileMenuOpen(false)} user={user} />
      </div>

      {/* Main layout with header and content */}
      <div className={`flex flex-col h-full ${isSidebarOpen ? "lg:pl-64": "lg:pl-0"}`}>
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 h-16 z-40 shadow-md ${isSidebarOpen ? "lg:left-64": "lg:left-0"}`}>
          <Header
            onMenuClick={() => setMobileMenuOpen(true)}
            onSidebarToggle={toggleSidebar}
            user={user}
          />
        </div>

        {/* Content area with scroll */}
        <main className="mt-16 flex-1 overflow-auto p-3 lg:p-4">
          <div className="min-w-[768px] max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
