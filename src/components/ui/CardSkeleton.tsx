const CardSkeleton: React.FC = () => (
  <div className="flex flex-col rounded-xl overflow-hidden bg-[#18181b] border border-zinc-800/50 animate-pulse">
    <div className="aspect-[2/3] bg-zinc-800" />
    <div className="p-2">
      <div className="h-3 bg-zinc-700 rounded w-full mb-1" />
      <div className="h-3 bg-zinc-700 rounded w-2/3" />
      <div className="h-2 bg-zinc-800 rounded w-1/2 mt-1.5" />
    </div>
  </div>
);

export default CardSkeleton;
