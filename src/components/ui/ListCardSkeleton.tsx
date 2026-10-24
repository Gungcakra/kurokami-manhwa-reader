import React from "react";

const ListCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 lg:gap-3.5 px-3 py-2.5 lg:px-4 lg:py-3.5 border-b border-[#1c1c1c] animate-pulse">
    <div className="w-5 h-4 lg:w-7 lg:h-6 bg-zinc-700 rounded flex-shrink-0" />
    <div className="w-10 h-14 lg:w-12 lg:h-16 bg-zinc-700 rounded-lg flex-shrink-0" />
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="h-3 bg-zinc-700 rounded w-full" />
      <div className="h-2 bg-zinc-800 rounded w-1/2" />
    </div>
  </div>
);

export default ListCardSkeleton;
