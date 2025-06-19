import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  trendLabel = "vs last period",
  change,
  changeLabel,
  color = "blue",
  size = "default", // 'sm', 'default', 'lg'
  variant = "default", // 'default', 'outline', 'gradient'
  loading = false,
  onClick,
  onRefresh,
  onExport,
  onFilter,
  showActions = false,
  children,
  className = "",
  footer,
  sparklineData = [],
  showSparkline = false,
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: "bg-yellow-500",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      icon: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: "bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-700",
      icon: "bg-gray-500",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-600",
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: "p-4",
      iconSize: "h-8 w-8",
      titleSize: "text-sm",
      valueSize: "text-xl",
      subtitleSize: "text-xs",
    },
    default: {
      padding: "p-6",
      iconSize: "h-10 w-10",
      titleSize: "text-base",
      valueSize: "text-2xl",
      subtitleSize: "text-sm",
    },
    lg: {
      padding: "p-8",
      iconSize: "h-12 w-12",
      titleSize: "text-lg",
      valueSize: "text-3xl",
      subtitleSize: "text-base",
    },
  };

  const config = colorConfig[color];
  const sizeConf = sizeConfig[size];

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!trend) return null;

    const isPositive =
      trend === "up" || (typeof trend === "number" && trend > 0);
    const isNegative =
      trend === "down" || (typeof trend === "number" && trend < 0);

    let TrendIcon = Minus;
    let trendColor = "text-gray-500";

    if (isPositive) {
      TrendIcon = TrendingUp;
      trendColor = "text-green-600 dark:text-green-400";
    } else if (isNegative) {
      TrendIcon = TrendingDown;
      trendColor = "text-red-600 dark:text-red-400";
    }

    return { TrendIcon, trendColor, isPositive, isNegative };
  };

  const trendDisplay = getTrendDisplay();

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return `border-2 ${config.border} bg-white dark:bg-gray-800`;
      case "gradient":
        return `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white border-0`;
      default:
        return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
    }
  };

  // Mini sparkline component
  const MiniSparkline = ({ data }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 60;
        const y = 20 - ((value - min) / range) * 20;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width="60" height="20" className="opacity-75">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={`${getVariantStyles()} ${className}`}>
        <div className={sizeConf.padding}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`${sizeConf.iconSize} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`}
                />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`
        ${getVariantStyles()} 
        ${
          onClick
            ? "cursor-pointer hover:shadow-lg transition-all duration-200"
            : ""
        } 
        ${className}
      `}
      onClick={onClick}
    >
      <div className={sizeConf.padding}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div
                    className={`
                    ${sizeConf.iconSize} 
                    ${variant === "gradient" ? "bg-white/20" : config.icon} 
                    rounded-lg flex items-center justify-center
                  `}
                  >
                    <Icon
                      className={`
                      h-5 w-5 
                      ${variant === "gradient" ? "text-white" : "text-white"}
                    `}
                    />
                  </div>
                )}
                <h3
                  className={`
                  ${sizeConf.titleSize} font-medium 
                  ${
                    variant === "gradient"
                      ? "text-white"
                      : "text-gray-900 dark:text-white"
                  }
                `}
                >
                  {title}
                </h3>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-1">
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefresh();
                      }}
                      className="p-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  {onFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilter();
                      }}
                      className="p-1"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                  {onExport && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExport();
                      }}
                      className="p-1"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Value */}
            {value !== undefined && (
              <div className="mb-2">
                <div
                  className={`
                  ${sizeConf.valueSize} font-bold 
                  ${
                    variant === "gradient"
                      ? "text-white"
                      : "text-gray-900 dark:text-white"
                  }
                `}
                >
                  {value}
                </div>
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p
                className={`
                ${sizeConf.subtitleSize} 
                ${
                  variant === "gradient"
                    ? "text-white/80"
                    : "text-gray-600 dark:text-gray-400"
                }
                mb-3
              `}
              >
                {subtitle}
              </p>
            )}

            {/* Trend and Change */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Trend */}
                {trendDisplay && (
                  <div className="flex items-center space-x-2">
                    <div
                      className={`
                      flex items-center space-x-1 
                      ${
                        variant === "gradient"
                          ? "text-white/90"
                          : trendDisplay.trendColor
                      }
                    `}
                    >
                      <trendDisplay.TrendIcon className="h-4 w-4" />
                      {trendValue && (
                        <span className="text-sm font-medium">
                          {typeof trendValue === "number"
                            ? `${trendValue > 0 ? "+" : ""}${trendValue.toFixed(
                                1
                              )}%`
                            : trendValue}
                        </span>
                      )}
                    </div>
                    {trendLabel && (
                      <span
                        className={`
                        text-xs 
                        ${
                          variant === "gradient"
                            ? "text-white/70"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                      >
                        {trendLabel}
                      </span>
                    )}
                  </div>
                )}

                {/* Change Indicator */}
                {change !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant={
                        change > 0
                          ? "success"
                          : change < 0
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {change > 0 ? "+" : ""}
                      {change}
                      {changeLabel && ` ${changeLabel}`}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Sparkline */}
              {showSparkline && sparklineData.length > 0 && (
                <div
                  className={`
                  ${variant === "gradient" ? "text-white/80" : config.text}
                `}
                >
                  <MiniSparkline data={sparklineData} />
                </div>
              )}

              {/* External Link */}
              {onClick && (
                <ExternalLink
                  className={`
                  h-4 w-4 
                  ${variant === "gradient" ? "text-white/60" : "text-gray-400"}
                `}
                />
              )}
            </div>

            {/* Custom Children */}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`
            mt-4 pt-4 border-t 
            ${
              variant === "gradient"
                ? "border-white/20"
                : "border-gray-200 dark:border-gray-700"
            }
          `}
          >
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
};

// Preset dashboard card variants for common use cases
export const StatsCard = ({
  value,
  label,
  change,
  trend,
  icon: Icon,
  ...props
}) => (
  <DashboardCard
    title={label}
    value={value}
    trend={trend}
    trendValue={change}
    icon={Icon}
    size="default"
    {...props}
  />
);

export const MetricCard = ({
  metric,
  title,
  subtitle,
  target,
  progress,
  icon: Icon,
  ...props
}) => {
  const progressPercent = target ? (metric / target) * 100 : 0;

  return (
    <DashboardCard
      title={title}
      value={metric}
      subtitle={subtitle}
      icon={Icon}
      {...props}
    >
      {target && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Target</span>
            <span className="font-medium">{target}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercent >= 100
                  ? "bg-green-500"
                  : progressPercent >= 75
                  ? "bg-blue-500"
                  : progressPercent >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {progressPercent.toFixed(1)}% of target
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export const KPICard = ({
  kpi,
  title,
  benchmark,
  status = "neutral",
  icon: Icon,
  ...props
}) => {
  const statusConfig = {
    excellent: { color: "green", label: "Excellent" },
    good: { color: "blue", label: "Good" },
    warning: { color: "yellow", label: "Needs Attention" },
    critical: { color: "red", label: "Critical" },
    neutral: { color: "gray", label: "Neutral" },
  };

  const config = statusConfig[status];

  return (
    <DashboardCard
      title={title}
      value={kpi}
      icon={Icon}
      color={config.color}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          {benchmark && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Benchmark: {benchmark}
            </div>
          )}
        </div>
        <Badge
          variant={
            status === "excellent" || status === "good"
              ? "success"
              : status === "warning"
              ? "warning"
              : status === "critical"
              ? "destructive"
              : "secondary"
          }
        >
          {config.label}
        </Badge>
      </div>
    </DashboardCard>
  );
};

export default DashboardCard;
