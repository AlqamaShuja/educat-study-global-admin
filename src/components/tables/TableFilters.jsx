import React, { useState } from "react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";
import PropTypes from 'prop-types';

const TableFilters = ({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  showDateRange = false,
  onDateRangeChange,
  className = "",
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);

    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    }
  };

  const clearAllFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
    onClearFilters();
  };

  const hasActiveFilters = () => {
    const hasRegularFilters = Object.keys(activeFilters).some(
      (key) => activeFilters[key]
    );
    const hasDateFilters = dateRange.startDate || dateRange.endDate;
    return hasRegularFilters || hasDateFilters;
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-700"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Regular Filters */}
        {filters.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>

            {filter.type === "select" || !filter.type ? (
              <Select
                options={filter.options || []}
                value={filter.options?.find(
                  (option) => option.value === activeFilters[filter.key]
                )}
                onChange={(option) =>
                  handleFilterChange(filter.key, option?.value || "")
                }
                placeholder={
                  filter.placeholder || `All ${filter.label.toLowerCase()}`
                }
                className="w-full"
              />
            ) : filter.type === "text" ? (
              <Input
                type="text"
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                placeholder={
                  filter.placeholder ||
                  `Filter by ${filter.label.toLowerCase()}`
                }
                className="w-full"
              />
            ) : filter.type === "number" ? (
              <Input
                type="number"
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                placeholder={
                  filter.placeholder ||
                  `Filter by ${filter.label.toLowerCase()}`
                }
                className="w-full"
              />
            ) : filter.type === "date" ? (
              <Input
                type="date"
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full"
              />
            ) : null}
          </div>
        ))}

        {/* Date Range Filter */}
        {showDateRange && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
                min={dateRange.startDate}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange("status", "active")}
          className={`${
            activeFilters.status === "active"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : ""
          }`}
        >
          Active Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange("created", "today")}
          className={`${
            activeFilters.created === "today"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : ""
          }`}
        >
          Created Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange("created", "this_week")}
          className={`${
            activeFilters.created === "this_week"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : ""
          }`}
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange("created", "this_month")}
          className={`${
            activeFilters.created === "this_month"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : ""
          }`}
        >
          This Month
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>

            {/* Regular Filter Tags */}
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value) return null;

              const filter = filters.find((f) => f.key === key);
              const option = filter?.options?.find(
                (opt) => opt.value === value
              );
              const displayValue = option?.label || value;

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {filter?.label}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, "")}
                    className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  >
                    <svg
                      className="h-2 w-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 8 8"
                    >
                      <path strokeLinecap="round" d="m1 1 6 6m0-6-6 6" />
                    </svg>
                  </button>
                </span>
              );
            })}

            {/* Date Range Tags */}
            {dateRange.startDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                From: {new Date(dateRange.startDate).toLocaleDateString()}
                <button
                  onClick={() => handleDateRangeChange("startDate", "")}
                  className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path strokeLinecap="round" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )}

            {dateRange.endDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                To: {new Date(dateRange.endDate).toLocaleDateString()}
                <button
                  onClick={() => handleDateRangeChange("endDate", "")}
                  className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path strokeLinecap="round" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined common filters
export const commonFilters = {
  status: {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
    ],
  },

  role: {
    key: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "", label: "All Roles" },
      { value: "super_admin", label: "Super Admin" },
      { value: "manager", label: "Manager" },
      { value: "consultant", label: "Consultant" },
      { value: "receptionist", label: "Receptionist" },
      { value: "student", label: "Student" },
    ],
  },

  priority: {
    key: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "", label: "All Priorities" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },

  type: {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "", label: "All Types" },
      { value: "in_person", label: "In Person" },
      { value: "virtual", label: "Virtual" },
    ],
  },

  dateCreated: {
    key: "created",
    label: "Created",
    type: "select",
    options: [
      { value: "", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "yesterday", label: "Yesterday" },
      { value: "this_week", label: "This Week" },
      { value: "last_week", label: "Last Week" },
      { value: "this_month", label: "This Month" },
      { value: "last_month", label: "Last Month" },
    ],
  },

  search: {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search...",
  },
};

export default TableFilters;


TableFilters.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'text', 'number', 'date']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string,
          label: PropTypes.string
        })
      ),
      placeholder: PropTypes.string
    })
  ),
  activeFilters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  showDateRange: PropTypes.bool,
  onDateRangeChange: PropTypes.func,
  className: PropTypes.string
};