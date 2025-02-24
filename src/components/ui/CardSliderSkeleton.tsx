import React from "react";

const CardSliderSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-2 animate-pulse">
      <div className="relative bg-gray-300 w-full h-56 rounded-md"></div>
      <div className="mt-2">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4 mt-1"></div>
      </div>
    </div>
  );
};

export default CardSliderSkeleton;
