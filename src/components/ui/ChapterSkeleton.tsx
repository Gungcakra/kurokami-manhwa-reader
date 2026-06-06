// Fixed page heights to simulate manga strips without random values
const PAGE_HEIGHTS = [580, 520, 640, 500, 560, 480];

const ChapterSkeleton: React.FC = () => (
  <div className="bg-[#09090b] min-h-screen flex flex-col animate-pulse">
    {/* Nav bar skeleton */}
    <div className="sticky top-0 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/50 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 bg-zinc-700/40 rounded-xl flex-shrink-0" />
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="h-3 w-36 bg-zinc-700/40 rounded-md" />
            <div className="h-2.5 w-20 bg-zinc-800/60 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-7 w-16 bg-zinc-800/50 rounded-xl" />
          <div className="h-7 w-16 bg-zinc-700/40 rounded-xl" />
        </div>
      </div>
    </div>

    {/* Manga page strips */}
    <div className="flex flex-col items-center w-full flex-1 gap-px bg-[#09090b]">
      {PAGE_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-full md:w-[720px] max-w-3xl bg-zinc-800/30 flex-shrink-0"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>

    {/* Bottom nav skeleton */}
    <div className="border-t border-zinc-800/50 bg-[#09090b]/90">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 bg-zinc-700/40 rounded-xl flex-shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-36 bg-zinc-700/40 rounded-md" />
            <div className="h-2.5 w-20 bg-zinc-800/60 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-7 w-16 bg-zinc-800/50 rounded-xl" />
          <div className="h-7 w-16 bg-zinc-700/40 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default ChapterSkeleton;
