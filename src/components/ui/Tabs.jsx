import React, { useState } from "react";

const Tabs = ({
  defaultTab = 0,
  children,
  className = "",
  variant = "default",
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  const variants = {
    default: {
      container: "border-b border-gray-200",
      tab: "py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300",
      activeTab:
        "py-2 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-500",
    },
    pills: {
      container: "flex space-x-1 bg-gray-100 p-1 rounded-lg",
      tab: "px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md hover:bg-white",
      activeTab:
        "px-3 py-1.5 text-sm font-medium text-blue-600 bg-white rounded-md shadow-sm",
    },
  };

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={variants[variant].container}>
        <nav className="-mb-px flex space-x-8">
          {React.Children.map(children, (child, index) => (
            <button
              key={index}
              className={
                activeTab === index
                  ? variants[variant].activeTab
                  : variants[variant].tab
              }
              onClick={() => handleTabChange(index)}
              type="button"
            >
              {child.props.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">{React.Children.toArray(children)[activeTab]}</div>
    </div>
  );
};

const TabPanel = ({ children, label }) => {
  return <div>{children}</div>;
};

Tabs.Panel = TabPanel;

export default Tabs;
