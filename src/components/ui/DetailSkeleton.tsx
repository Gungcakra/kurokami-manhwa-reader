const DetailSkeleton: React.FC = () => (
  <div className="bg-[#09090b] min-h-screen animate-pulse">
    {/* Hero */}
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-zinc-800/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b]" />
      <div className="relative max-w-screen-xl mx-auto px-4 pt-8 pb-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end">
        {/* Cover */}
        <div className="w-36 md:w-44 flex-shrink-0 mx-auto md:mx-0 rounded-2xl bg-zinc-700/50" style={{ aspectRatio: "2/3" }} />

        {/* Info */}
        <div className="flex-1 pb-1 flex flex-col items-center md:items-start gap-3 w-full">
          <div className="h-8 bg-zinc-700/40 rounded-xl w-3/4" />
          <div className="h-4 bg-zinc-800/60 rounded-lg w-1/2" />
          <div className="flex gap-2 flex-wrap">
            <div className="h-6 w-20 bg-zinc-700/40 rounded-full" />
            <div className="h-6 w-16 bg-zinc-700/40 rounded-full" />
            <div className="h-6 w-14 bg-zinc-700/40 rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="h-3.5 w-28 bg-zinc-800/60 rounded-lg" />
            <div className="h-3.5 w-24 bg-zinc-800/60 rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-screen-xl mx-auto px-4 pb-8">
      {/* Genre tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-16 bg-zinc-800/50 rounded-full" />
        ))}
      </div>

      {/* Read buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="h-10 w-36 bg-zinc-700/40 rounded-xl" />
        <div className="h-10 w-36 bg-zinc-800/50 rounded-xl" />
      </div>

      {/* Synopsis */}
      <div className="bg-[#18181b] rounded-2xl p-4 mb-5 border border-zinc-800/40 space-y-2.5">
        <div className="h-4 w-24 bg-zinc-700/50 rounded-md" />
        <div className="h-3.5 bg-zinc-800/60 rounded w-full" />
        <div className="h-3.5 bg-zinc-800/60 rounded w-full" />
        <div className="h-3.5 bg-zinc-800/60 rounded w-5/6" />
        <div className="h-3.5 bg-zinc-800/60 rounded w-4/5" />
      </div>

      {/* Chapter list */}
      <div className="bg-[#18181b] rounded-2xl border border-zinc-800/40">
        {/* Chapter header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/40">
          <div className="h-5 w-36 bg-zinc-700/50 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-36 bg-zinc-800/50 rounded-xl" />
            <div className="h-8 w-8 bg-zinc-800/50 rounded-xl" />
          </div>
        </div>

        {/* Chapter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-800/25 border border-zinc-800/30">
              <div className="w-20 h-28 flex-shrink-0 rounded-xl bg-zinc-700/40" />
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="h-5 bg-zinc-700/40 rounded-lg w-3/4" />
                <div className="h-4 bg-zinc-800/60 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="flex justify-center items-center gap-1.5 px-4 pb-5 pt-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="w-9 h-9 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DetailSkeleton;
