import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const MetricsWidget = ({
  title = "Metrics Overview",
  metrics = [],
  timeframe = "7d",
  showSparklines = true,
  showComparison = true,
  showTrends = true,
  allowTimeframeChange = true,
  allowRefresh = true,
  allowExport = true,
  className = "",
  onTimeframeChange,
  onRefresh,
  onExport,
  onMetricClick,
  loading = false,
  error = null,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [expandedMetrics, setExpandedMetrics] = useState(new Set());

  const timeframeOptions = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  // Process metrics data
  const processedMetrics = useMemo(() => {
    return metrics.map((metric) => {
      const current = metric.current || 0;
      const previous = metric.previous || 0;
      const target = metric.target;

      // Calculate change
      const change =
        previous !== 0 ? ((current - previous) / previous) * 100 : 0;
      const trend = change > 0 ? "up" : change < 0 ? "down" : "flat";

      // Calculate target progress
      const targetProgress = target ? (current / target) * 100 : null;

      // Determine status
      let status = "neutral";
      if (metric.status) {
        status = metric.status;
      } else if (targetProgress) {
        if (targetProgress >= 100) status = "excellent";
        else if (targetProgress >= 80) status = "good";
        else if (targetProgress >= 60) status = "warning";
        else status = "critical";
      } else if (change > 10) status = "excellent";
      else if (change > 0) status = "good";
      else if (change > -10) status = "warning";
      else status = "critical";

      return {
        ...metric,
        change,
        trend,
        targetProgress,
        status,
      };
    });
  }, [metrics]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  // Toggle metric expansion
  const toggleMetricExpansion = (metricId) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricId)) {
      newExpanded.delete(metricId);
    } else {
      newExpanded.add(metricId);
    }
    setExpandedMetrics(newExpanded);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      excellent: "text-green-600 dark:text-green-400",
      good: "text-blue-600 dark:text-blue-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      critical: "text-red-600 dark:text-red-400",
      neutral: "text-gray-600 dark:text-gray-400",
    };
    return colors[status] || colors.neutral;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
      case "good":
        return CheckCircle;
      case "warning":
      case "critical":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  // Mini sparkline component
  const MiniSparkline = ({ data, trend }) => {
    if (!data || data.length === 0) return null;

    const color =
      trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7280";

    return (
      <div className="w-16 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Failed to load metrics
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
              {processedMetrics.length} metrics tracked
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Timeframe Selector */}
            {allowTimeframeChange && (
              <select
                value={selectedTimeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* Action Buttons */}
            {allowRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            {allowExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-4">
          {processedMetrics.map((metric, index) => {
            const isExpanded = expandedMetrics.has(metric.id || index);
            const StatusIcon = getStatusIcon(metric.status);
            const TrendIcon =
              metric.trend === "up"
                ? TrendingUp
                : metric.trend === "down"
                ? TrendingDown
                : Activity;

            return (
              <div
                key={metric.id || index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Metric Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Status Icon */}
                    <div
                      className={`
                      p-2 rounded-lg
                      ${
                        metric.status === "excellent" ||
                        metric.status === "good"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : metric.status === "warning"
                          ? "bg-yellow-100 dark:bg-yellow-900/20"
                          : metric.status === "critical"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-gray-100 dark:bg-gray-700"
                      }
                    `}
                    >
                      <StatusIcon
                        className={`h-4 w-4 ${getStatusColor(metric.status)}`}
                      />
                    </div>

                    {/* Metric Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {metric.name}
                        </h4>
                        <Badge
                          variant={
                            metric.status === "excellent" ||
                            metric.status === "good"
                              ? "success"
                              : metric.status === "warning"
                              ? "warning"
                              : metric.status === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      {metric.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {metric.description}
                        </p>
                      )}
                    </div>

                    {/* Current Value */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.formatValue
                          ? metric.formatValue(metric.current)
                          : metric.current}
                      </div>
                      {metric.unit && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {metric.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trend and Actions */}
                  <div className="flex items-center space-x-3 ml-4">
                    {/* Trend Indicator */}
                    {showTrends && (
                      <div
                        className={`
                        flex items-center space-x-1
                        ${
                          metric.trend === "up"
                            ? "text-green-600 dark:text-green-400"
                            : metric.trend === "down"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                      >
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {metric.change > 0 ? "+" : ""}
                          {metric.change.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {/* Sparkline */}
                    {showSparklines && metric.sparklineData && (
                      <MiniSparkline
                        data={metric.sparklineData}
                        trend={metric.trend}
                      />
                    )}

                    {/* Expand Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMetricExpansion(metric.id || index)}
                      className="p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Previous Value */}
                      {showComparison && metric.previous !== undefined && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Previous Period
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {metric.formatValue
                              ? metric.formatValue(metric.previous)
                              : metric.previous}
                          </div>
                        </div>
                      )}

                      {/* Target */}
                      {metric.target && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Target
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {metric.formatValue
                              ? metric.formatValue(metric.target)
                              : metric.target}
                          </div>
                          {metric.targetProgress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{metric.targetProgress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    metric.targetProgress >= 100
                                      ? "bg-green-500"
                                      : metric.targetProgress >= 80
                                      ? "bg-blue-500"
                                      : metric.targetProgress >= 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      metric.targetProgress,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Info */}
                      {metric.additionalInfo && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Additional Information
                          </div>
                          <div className="space-y-1">
                            {Object.entries(metric.additionalInfo).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                                    {key.replace("_", " ")}:
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {value}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMetricClick && onMetricClick(metric)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {processedMetrics.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No metrics available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Metrics will appear here when data is available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricsWidget;
