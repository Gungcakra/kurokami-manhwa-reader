import React from "react";

const CardSliderSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-[130px] md:w-[160px] lg:w-[184px] xl:w-[205px] rounded-xl lg:rounded-2xl overflow-hidden bg-[#111111] border border-[#1c1c1c] animate-pulse">
    <div className="aspect-[2/3] bg-zinc-800" />
    <div className="p-2 lg:p-3">
      <div className="h-3 bg-zinc-700 rounded w-full mb-1" />
      <div className="h-2 bg-zinc-800 rounded w-2/3" />
    </div>
  </div>
);

export default CardSliderSkeleton;
