import React from "react";

const CardSliderSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center rounded-md xl:w-[250px] w-[150px] bg-accent overflow-hidden animate-pulse">
      <div className="rounded-t-md xl:h-[300px] h-[200px] w-full bg-gray-300"></div>
      <div className="mt-2 w-full">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 mx-auto"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  );
};

export default CardSliderSkeleton;
