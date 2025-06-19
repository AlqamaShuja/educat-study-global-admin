import React from "react";

const LoadingSkeleton = ({
  width = "100%",
  height = "1rem",
  className = "",
  variant = "default",
  count = 1,
  circle = false,
}) => {
  const baseClasses = "bg-gray-200 animate-pulse";

  const variants = {
    default: "rounded",
    text: "rounded h-4",
    card: "rounded-lg h-48",
    avatar: "rounded-full w-10 h-10",
    button: "rounded-lg h-10",
  };

  const skeletonClasses = `${baseClasses} ${
    circle ? "rounded-full" : variants[variant]
  } ${className}`;

  const renderSkeleton = () => (
    <div
      className={skeletonClasses}
      style={{ width, height: circle ? width : height }}
    />
  );

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

// Skeleton components for common patterns
const SkeletonCard = ({ className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
  >
    <LoadingSkeleton variant="text" width="60%" className="mb-4" />
    <LoadingSkeleton variant="text" width="100%" className="mb-2" />
    <LoadingSkeleton variant="text" width="80%" className="mb-4" />
    <LoadingSkeleton variant="button" width="120px" />
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }, (_, index) => (
            <th key={index} className="px-6 py-3">
              <LoadingSkeleton variant="text" width="80%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <LoadingSkeleton variant="text" width="90%" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonList = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <LoadingSkeleton circle width="40px" height="40px" />
        <div className="flex-1">
          <LoadingSkeleton variant="text" width="60%" className="mb-2" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

LoadingSkeleton.Card = SkeletonCard;
LoadingSkeleton.Table = SkeletonTable;
LoadingSkeleton.List = SkeletonList;

export default LoadingSkeleton;
