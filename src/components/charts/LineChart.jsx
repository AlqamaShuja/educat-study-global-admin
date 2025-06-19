import React, { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

const LineChart = ({
  data = [],
  title,
  subtitle,
  lines = [{ dataKey: "value", stroke: "#3B82F6", name: "Value" }],
  xAxisKey = "date",
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showBrush = false,
  showTrend = true,
  formatValue = (value) => value,
  formatXAxis = (value) => value,
  referenceLines = [],
  className = "",
  loading = false,
  error = null,
}) => {
  // Calculate trend for the first line
  const trendData = useMemo(() => {
    if (!showTrend || !data.length || !lines.length) return null;

    const primaryLine = lines[0];
    const values = data
      .map((item) => item[primaryLine.dataKey])
      .filter((val) => val !== null && val !== undefined);

    if (values.length < 2) return null;

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentChange = (change / firstValue) * 100;

    return {
      change,
      percentChange,
      trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
      firstValue,
      lastValue,
    };
  }, [data, lines, showTrend]);

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
                className="w-3 h-3 rounded-full"
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
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
        {(title || trendData) && (
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

            {/* Trend Indicator */}
            {trendData && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatValue(trendData.lastValue)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {trendData.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {trendData.trend === "down" && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {trendData.trend === "flat" && (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <Badge
                      variant={
                        trendData.trend === "up"
                          ? "success"
                          : trendData.trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {trendData.percentChange > 0 ? "+" : ""}
                      {trendData.percentChange.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
              )}

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
                  y={refLine.value}
                  stroke={refLine.color || "#EF4444"}
                  strokeDasharray="5 5"
                  label={refLine.label}
                />
              ))}

              {/* Data Lines */}
              {lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth || 2}
                  name={line.name}
                  dot={
                    line.showDots !== false
                      ? {
                          fill: line.stroke,
                          strokeWidth: 2,
                          r: 4,
                        }
                      : false
                  }
                  activeDot={
                    line.showActiveDot !== false
                      ? {
                          r: 6,
                          fill: line.stroke,
                          stroke: "#fff",
                          strokeWidth: 2,
                        }
                      : false
                  }
                  connectNulls={line.connectNulls !== false}
                />
              ))}

              {/* Brush for zooming */}
              {showBrush && (
                <Brush dataKey={xAxisKey} height={30} stroke="#3B82F6" />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Stats */}
        {lines.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lines.map((line, index) => {
                const values = data
                  .map((item) => item[line.dataKey])
                  .filter((val) => val !== null && val !== undefined);
                const avg =
                  values.length > 0
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : 0;
                const max = values.length > 0 ? Math.max(...values) : 0;

                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: line.stroke }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {line.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Avg: {formatValue(avg)} | Max: {formatValue(max)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LineChart;
