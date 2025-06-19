import React, { useState, useMemo } from "react";
import Table from "../ui/Table";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import Badge from "../ui/Badge";

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = false,
  filterable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onSelectionChange,
  filters = [],
  actions = [],
  bulkActions = [],
  exportable = false,
  onExport,
  className = "",
  emptyMessage = "No data available",
  title,
  subtitle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({});

  // Enhanced columns with sorting and selection
  const enhancedColumns = useMemo(() => {
    const cols = [];

    // Add selection column if selectable
    if (selectable) {
      cols.push({
        key: "selection",
        header: (
          <input
            type="checkbox"
            checked={selectedRows.size === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(new Set(data.map((_, index) => index)));
              } else {
                setSelectedRows(new Set());
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        ),
        render: (_, row, index) => (
          <input
            type="checkbox"
            checked={selectedRows.has(index)}
            onChange={(e) => {
              const newSelected = new Set(selectedRows);
              if (e.target.checked) {
                newSelected.add(index);
              } else {
                newSelected.delete(index);
              }
              setSelectedRows(newSelected);
              if (onSelectionChange) {
                onSelectionChange(Array.from(newSelected).map((i) => data[i]));
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        ),
        width: "50px",
      });
    }

    // Add data columns with sorting
    columns.forEach((column) => {
      const enhancedColumn = { ...column };

      if (sortable && column.sortable !== false) {
        enhancedColumn.header = (
          <button
            className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none"
            onClick={() => handleSort(column.key)}
          >
            <span>{column.header}</span>
            {sortConfig.key === column.key && (
              <svg
                className={`w-4 h-4 ${
                  sortConfig.direction === "asc" ? "transform rotate-180" : ""
                }`}
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
            )}
          </button>
        );
      }

      cols.push(enhancedColumn);
    });

    // Add actions column if actions exist
    if (actions.length > 0) {
      cols.push({
        key: "actions",
        header: "Actions",
        render: (_, row, index) => (
          <div className="flex items-center space-x-2">
            {actions.map((action, actionIndex) => (
              <Button
                key={actionIndex}
                variant={action.variant || "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row, index);
                }}
                disabled={action.disabled && action.disabled(row)}
                className={action.className}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        ),
        width: `${actions.length * 80}px`,
      });
    }

    return cols;
  }, [
    columns,
    selectable,
    selectedRows,
    data,
    sortable,
    sortConfig,
    actions,
    onSelectionChange,
  ]);

  // Filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    // Apply column filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const filter = filters.find((f) => f.key === filterKey);
          if (filter && filter.filterFn) {
            return filter.filterFn(row, filterValue);
          }
          return row[filterKey] === filterValue;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, activeFilters, searchable, columns, filters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleBulkAction = (action) => {
    const selectedData = Array.from(selectedRows).map((index) => data[index]);
    action.onClick(selectedData);
    setSelectedRows(new Set()); // Clear selection after action
  };

  if (loading) {
    return (
      <div className={className}>
        {title && (
          <div className="mb-6">
            <LoadingSkeleton width="200px" height="24px" className="mb-2" />
            {subtitle && <LoadingSkeleton width="300px" height="16px" />}
          </div>
        )}
        <LoadingSkeleton.Table
          rows={pageSize}
          columns={enhancedColumns.length}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        {/* Search and Global Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          {searchable && (
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={sortedData.length === 0}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </Button>
            )}

            {(activeFilters &&
              Object.keys(activeFilters).some((key) => activeFilters[key])) ||
            searchTerm ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : null}
          </div>
        </div>

        {/* Filters */}
        {filterable && filters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <Select
                  options={filter.options}
                  value={filter.options?.find(
                    (option) => option.value === activeFilters[filter.key]
                  )}
                  onChange={(option) =>
                    handleFilterChange(filter.key, option?.value || "")
                  }
                  placeholder={`All ${filter.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedRows.size} item{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => handleBulkAction(action)}
                  className={action.className}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      {sortedData.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedData.length} of {sortedData.length} results
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={enhancedColumns}
          data={paginatedData}
          loading={false}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
          striped
        />
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > pageSize && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedData.length}
            itemsPerPage={pageSize}
            showInfo
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
