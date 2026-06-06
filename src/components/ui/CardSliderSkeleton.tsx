import React from "react";

const CardSliderSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-[130px] md:w-[160px] rounded-xl overflow-hidden bg-[#18181b] border border-zinc-800/50 animate-pulse">
    <div className="aspect-[2/3] bg-zinc-800" />
    <div className="p-2">
      <div className="h-3 bg-zinc-700 rounded w-full mb-1" />
      <div className="h-2 bg-zinc-800 rounded w-2/3" />
    </div>
  </div>
);

export default CardSliderSkeleton;
