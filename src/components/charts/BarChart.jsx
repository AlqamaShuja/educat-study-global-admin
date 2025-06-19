import React, { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { BarChart3, TrendingUp, Info, Target } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

const BarChart = ({
  data = [],
  title,
  subtitle,
  bars = [{ dataKey: "value", fill: "#3B82F6", name: "Value" }],
  xAxisKey = "name",
  height = 300,
  layout = "horizontal", // 'horizontal' or 'vertical'
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showValues = false,
  formatValue = (value) => value,
  formatXAxis = (value) => value,
  referenceLines = [],
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
  stackId,
  maxBarSize = 60,
  className = "",
  loading = false,
  error = null,
  onClick,
  showComparison = false,
  comparisonData = [],
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length || !bars.length) return null;

    const primaryBar = bars[0];
    const values = data
      .map((item) => item[primaryBar.dataKey])
      .filter((val) => val !== null && val !== undefined);

    if (!values.length) return null;

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxItem = data.find((item) => item[primaryBar.dataKey] === max);

    return {
      total,
      average,
      max,
      min,
      maxItem,
      count: values.length,
    };
  }, [data, bars]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {formatXAxis(label)}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}:
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Custom label component for values on bars
  const CustomLabel = ({ x, y, width, height, value }) => {
    if (!showValues) return null;

    return (
      <text
        x={layout === "horizontal" ? x + width / 2 : x + width + 5}
        y={layout === "horizontal" ? y - 5 : y + height / 2}
        fill="#6B7280"
        textAnchor={layout === "horizontal" ? "middle" : "start"}
        dy={layout === "horizontal" ? 0 : "0.35em"}
        fontSize={12}
        fontWeight={500}
      >
        {formatValue(value)}
      </text>
    );
  };

  // Handle bar click
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
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
              <div className="grid grid-cols-2 gap-4 text-right">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatValue(stats.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatValue(stats.average)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Average
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              layout={layout}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={handleClick}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
              )}

              {layout === "horizontal" ? (
                <>
                  <XAxis
                    dataKey={xAxisKey}
                    tickFormatter={formatXAxis}
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={formatValue}
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    type="number"
                    tickFormatter={formatValue}
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey={xAxisKey}
                    tickFormatter={formatXAxis}
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                </>
              )}

              {showTooltip && <Tooltip content={<CustomTooltip />} />}

              {showLegend && (
                <Legend
                  wrapperStyle={{
                    color: "rgb(107 114 128)",
                    fontSize: "14px",
                  }}
                />
              )}

              {/* Reference Lines */}
              {referenceLines.map((refLine, index) => (
                <ReferenceLine
                  key={index}
                  y={layout === "horizontal" ? refLine.value : undefined}
                  x={layout === "vertical" ? refLine.value : undefined}
                  stroke={refLine.color || "#EF4444"}
                  strokeDasharray="5 5"
                  label={refLine.label}
                />
              ))}

              {/* Data Bars */}
              {bars.map((bar, barIndex) => (
                <Bar
                  key={barIndex}
                  dataKey={bar.dataKey}
                  fill={bar.fill}
                  name={bar.name}
                  stackId={stackId}
                  maxBarSize={maxBarSize}
                  radius={bar.radius || [2, 2, 0, 0]}
                  label={showValues ? <CustomLabel /> : undefined}
                >
                  {/* Individual bar colors */}
                  {bar.useGradient &&
                    data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                </Bar>
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Statistics */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Highest
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stats.maxItem ? formatXAxis(stats.maxItem[xAxisKey]) : "N/A"}
                </div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {formatValue(stats.max)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Total
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stats.count} items
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatValue(stats.total)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Average
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  per item
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {formatValue(stats.average)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Range
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  min - max
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {formatValue(stats.min)} - {formatValue(stats.max)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Section */}
        {showComparison && comparisonData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Comparison with Previous Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonData.map((comparison, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {comparison.label}
                    </span>
                    <Badge
                      variant={
                        comparison.change > 0
                          ? "success"
                          : comparison.change < 0
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {comparison.change > 0 ? "+" : ""}
                      {comparison.change.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="mt-1">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatValue(comparison.current)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      vs {formatValue(comparison.previous)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BarChart;
