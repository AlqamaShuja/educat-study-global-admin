import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  trendLabel = "vs last period",
  changeType = "percentage", // 'percentage', 'absolute', 'custom'
  prefix = "",
  suffix = "",
  color = "blue",
  size = "default", // 'sm', 'default', 'lg'
  variant = "default", // 'default', 'minimal', 'bordered', 'gradient'
  showTrendIcon = true,
  loading = false,
  onClick,
  onRefresh,
  className = "",
  footer,
  showActions = false,
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "bg-blue-500",
      iconText: "text-white",
      accent: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "bg-green-500",
      iconText: "text-white",
      accent: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: "bg-yellow-500",
      iconText: "text-white",
      accent: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      icon: "bg-red-500",
      iconText: "text-white",
      accent: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: "bg-purple-500",
      iconText: "text-white",
      accent: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-700",
      icon: "bg-gray-500",
      iconText: "text-white",
      accent: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-600",
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: "p-4",
      iconContainer: "w-10 h-10",
      iconSize: "h-5 w-5",
      titleSize: "text-sm",
      valueSize: "text-xl",
      subtitleSize: "text-xs",
      trendSize: "text-xs",
    },
    default: {
      padding: "p-6",
      iconContainer: "w-12 h-12",
      iconSize: "h-6 w-6",
      titleSize: "text-base",
      valueSize: "text-2xl",
      subtitleSize: "text-sm",
      trendSize: "text-sm",
    },
    lg: {
      padding: "p-8",
      iconContainer: "w-14 h-14",
      iconSize: "h-7 w-7",
      titleSize: "text-lg",
      valueSize: "text-3xl",
      subtitleSize: "text-base",
      trendSize: "text-base",
    },
  };

  const config = colorConfig[color];
  const sizeConf = sizeConfig[size];

  // Determine trend display
  const getTrendDisplay = () => {
    if (trend === undefined || trendValue === undefined) return null;

    let trendDirection = trend;
    let displayValue = trendValue;

    // Auto-detect trend from value if not explicitly provided
    if (typeof trend === "number") {
      trendDirection = trend > 0 ? "up" : trend < 0 ? "down" : "flat";
      displayValue = Math.abs(trend);
    } else if (typeof trendValue === "number") {
      trendDirection = trendValue > 0 ? "up" : trendValue < 0 ? "down" : "flat";
      displayValue = Math.abs(trendValue);
    }

    // Format display value
    let formattedValue = displayValue;
    if (changeType === "percentage") {
      formattedValue = `${displayValue.toFixed(1)}%`;
    } else if (changeType === "absolute") {
      formattedValue = displayValue.toLocaleString();
    }

    // Get appropriate icon and color
    let TrendIcon = Minus;
    let trendColor = "text-gray-500 dark:text-gray-400";
    let TrendArrow = null;

    if (trendDirection === "up") {
      TrendIcon = TrendingUp;
      TrendArrow = ArrowUpRight;
      trendColor = "text-green-600 dark:text-green-400";
    } else if (trendDirection === "down") {
      TrendIcon = TrendingDown;
      TrendArrow = ArrowDownRight;
      trendColor = "text-red-600 dark:text-red-400";
    }

    return {
      icon: showTrendIcon ? TrendIcon : TrendArrow,
      color: trendColor,
      value: formattedValue,
      direction: trendDirection,
    };
  };

  const trendDisplay = getTrendDisplay();

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return "bg-white dark:bg-gray-800 border-0 shadow-none";
      case "bordered":
        return `bg-white dark:bg-gray-800 border-2 ${config.border}`;
      case "gradient":
        return `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white border-0`;
      default:
        return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={`${getVariantStyles()} ${className}`}>
        <div className={sizeConf.padding}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div
                className={`${sizeConf.iconContainer} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`}
              />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
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
            ? "cursor-pointer hover:shadow-md transition-all duration-200"
            : ""
        } 
        ${className}
      `}
      onClick={onClick}
    >
      <div className={sizeConf.padding}>
        <div className="flex items-start justify-between">
          {/* Left Section - Icon, Title, Value */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Icon */}
            {Icon && (
              <div
                className={`
                ${sizeConf.iconContainer} 
                ${variant === "gradient" ? "bg-white/20" : config.icon} 
                rounded-lg flex items-center justify-center flex-shrink-0
              `}
              >
                <Icon
                  className={`
                  ${sizeConf.iconSize} 
                  ${variant === "gradient" ? "text-white" : config.iconText}
                `}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3
                className={`
                ${sizeConf.titleSize} font-medium 
                ${
                  variant === "gradient"
                    ? "text-white/90"
                    : "text-gray-600 dark:text-gray-400"
                }
                mb-1
              `}
              >
                {title}
              </h3>

              {/* Value */}
              <div
                className={`
                ${sizeConf.valueSize} font-bold 
                ${
                  variant === "gradient"
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }
                mb-1
              `}
              >
                {prefix}
                {value}
                {suffix}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p
                  className={`
                  ${sizeConf.subtitleSize} 
                  ${
                    variant === "gradient"
                      ? "text-white/80"
                      : "text-gray-500 dark:text-gray-400"
                  }
                `}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Trend & Actions */}
          <div className="flex flex-col items-end space-y-2">
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
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Trend Display */}
            {trendDisplay && (
              <div className="text-right">
                <div
                  className={`
                  flex items-center space-x-1 
                  ${
                    variant === "gradient"
                      ? "text-white/90"
                      : trendDisplay.color
                  }
                `}
                >
                  <trendDisplay.icon className="h-4 w-4" />
                  <span className={`${sizeConf.trendSize} font-medium`}>
                    {trendDisplay.direction === "up"
                      ? "+"
                      : trendDisplay.direction === "down"
                      ? "-"
                      : ""}
                    {trendDisplay.value}
                  </span>
                </div>
                {trendLabel && (
                  <div
                    className={`
                    text-xs mt-1
                    ${
                      variant === "gradient"
                        ? "text-white/70"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                  >
                    {trendLabel}
                  </div>
                )}
              </div>
            )}

            {/* External Link Indicator */}
            {onClick && (
              <ExternalLink
                className={`
                h-4 w-4 
                ${variant === "gradient" ? "text-white/60" : "text-gray-400"}
              `}
              />
            )}
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

// Preset variants for common use cases
export const SimpleStatsCard = ({ label, value, change, ...props }) => (
  <StatsCard
    title={label}
    value={value}
    trendValue={change}
    variant="minimal"
    size="sm"
    {...props}
  />
);

export const DetailedStatsCard = ({
  title,
  value,
  subtitle,
  change,
  target,
  icon,
  ...props
}) => {
  const progress = target ? (value / target) * 100 : null;

  return (
    <StatsCard
      title={title}
      value={value}
      subtitle={subtitle}
      trendValue={change}
      icon={icon}
      showActions={true}
      footer={
        target && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target</span>
              <span className="font-medium">{target}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress >= 100
                    ? "bg-green-500"
                    : progress >= 75
                    ? "bg-blue-500"
                    : progress >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {progress?.toFixed(1)}% of target
            </div>
          </div>
        )
      }
      {...props}
    />
  );
};

export default StatsCard;
