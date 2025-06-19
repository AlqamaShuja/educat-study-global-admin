import React, { useState, useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon, Eye, EyeOff, Info } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const PieChart = ({
  data = [],
  title,
  subtitle,
  dataKey = "value",
  nameKey = "name",
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  showPercentages = true,
  colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
  ],
  innerRadius = 0,
  outerRadius = "80%",
  cx = "50%",
  cy = "50%",
  formatValue = (value) => value,
  className = "",
  loading = false,
  error = null,
  onClick,
  showValueList = true,
  sortBy = "value", // 'value', 'name', 'none'
  sortOrder = "desc", // 'asc', 'desc'
  minSlicePercent = 2, // Minimum percentage to show as separate slice
  othersLabel = "Others",
}) => {
  const [hiddenSegments, setHiddenSegments] = useState(new Set());

  // Process and sort data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let processed = [...data];

    // Calculate total for percentage calculations
    const total = processed.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );

    // Add percentage to each item
    processed = processed.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item[dataKey] || 0) / total) * 100 : 0,
      originalIndex: index,
      color: colors[index % colors.length],
    }));

    // Group small slices into "Others" if specified
    if (minSlicePercent > 0) {
      const significantItems = processed.filter(
        (item) => item.percentage >= minSlicePercent
      );
      const smallItems = processed.filter(
        (item) => item.percentage < minSlicePercent
      );

      if (smallItems.length > 0) {
        const othersValue = smallItems.reduce(
          (sum, item) => sum + (item[dataKey] || 0),
          0
        );
        const othersPercentage = smallItems.reduce(
          (sum, item) => sum + item.percentage,
          0
        );

        processed = [
          ...significantItems,
          {
            [nameKey]: othersLabel,
            [dataKey]: othersValue,
            percentage: othersPercentage,
            isOthers: true,
            color: colors[significantItems.length % colors.length],
            items: smallItems,
          },
        ];
      }
    }

    // Sort data
    if (sortBy !== "none") {
      processed.sort((a, b) => {
        let aVal = sortBy === "value" ? a[dataKey] : a[nameKey];
        let bVal = sortBy === "value" ? b[dataKey] : b[nameKey];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return processed;
  }, [
    data,
    dataKey,
    nameKey,
    colors,
    sortBy,
    sortOrder,
    minSlicePercent,
    othersLabel,
  ]);

  // Filter out hidden segments for display
  const visibleData = useMemo(() => {
    return processedData.filter((_, index) => !hiddenSegments.has(index));
  }, [processedData, hiddenSegments]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData.length) return null;

    const total = processedData.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );
    const visibleTotal = visibleData.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );
    const largest = processedData.reduce(
      (max, item) => ((item[dataKey] || 0) > (max[dataKey] || 0) ? item : max),
      processedData[0]
    );

    return {
      total,
      visibleTotal,
      largest,
      segments: processedData.length,
      visibleSegments: visibleData.length,
    };
  }, [processedData, visibleData, dataKey]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-900 dark:text-white">
            {data[nameKey]}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Value:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatValue(data[dataKey])}
            </span>
          </div>
          <div className="flex justify-between space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Percentage:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        {data.isOthers && data.items && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Includes {data.items.length} items:
            </p>
            <div className="space-y-1">
              {data.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  {item[nameKey]}: {formatValue(item[dataKey])}
                </div>
              ))}
              {data.items.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{data.items.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Custom label renderer
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    if (!showLabels || percent < 0.05) return null; // Don't show labels for slices < 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {showPercentages ? `${(percent * 100).toFixed(0)}%` : name}
      </text>
    );
  };

  // Toggle segment visibility
  const toggleSegment = (index) => {
    const newHidden = new Set(hiddenSegments);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenSegments(newHidden);
  };

  // Handle pie slice click
  const handleClick = (data, index) => {
    if (onClick) {
      onClick(data, index);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
              {subtitle && (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              )}
            </div>
          )}
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Failed to load chart data
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {error}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <PieChartIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No data available
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Data will appear here when available
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        {(title || stats) && (
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatValue(stats.visibleTotal)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.visibleSegments} of {stats.segments} segments
                </div>
                {stats.largest && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Largest: {stats.largest[nameKey]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div style={{ height }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={visibleData}
                    cx={cx}
                    cy={cy}
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    fill="#8884d8"
                    dataKey={dataKey}
                    onClick={handleClick}
                  >
                    {visibleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  {showTooltip && <Tooltip content={<CustomTooltip />} />}
                  {showLegend && (
                    <Legend
                      wrapperStyle={{
                        color: "rgb(107 114 128)",
                        fontSize: "14px",
                      }}
                    />
                  )}
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Value List */}
          {showValueList && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Breakdown
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {processedData.length} items
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processedData.map((item, index) => {
                  const isHidden = hiddenSegments.has(index);

                  return (
                    <div
                      key={index}
                      className={`
                        flex items-center justify-between p-2 rounded-lg transition-all
                        ${
                          isHidden
                            ? "bg-gray-100 dark:bg-gray-700 opacity-50"
                            : "bg-gray-50 dark:bg-gray-700"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item[nameKey]}
                          </div>
                          {item.isOthers && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.items?.length} items
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatValue(item[dataKey])}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSegment(index)}
                          className="p-1"
                        >
                          {isHidden ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {stats?.visibleSegments} of {stats?.segments} segments
            </div>
            <div>Total: {formatValue(stats?.visibleTotal)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PieChart;
