import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = ({ customItems = null, className = "" }) => {
  const location = useLocation();

  const generateBreadcrumbItems = () => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items = [{ label: "Dashboard", href: "/dashboard" }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      const labels = {
        "super-admin": "Super Admin",
        manager: "Manager",
        consultant: "Consultant",
        receptionist: "Receptionist",
        student: "Student",
        offices: "Offices",
        staff: "Staff",
        universities: "Universities",
        courses: "Courses",
        leads: "Leads",
        appointments: "Appointments",
        documents: "Documents",
        tasks: "Tasks",
        reports: "Reports",
        profile: "Profile",
        applications: "Applications",
        settings: "Settings",
        notifications: "Notifications",
        create: "Create",
        edit: "Edit",
        view: "View",
      };

      // Skip dashboard as it's already added
      if (segment !== "dashboard") {
        items.push({
          label:
            labels[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      }
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex mb-6 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}

            {item.isLast ? (
              <span className="text-sm font-medium text-gray-500 truncate">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
