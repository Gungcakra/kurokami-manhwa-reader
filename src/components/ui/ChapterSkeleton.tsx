// Fixed page heights to simulate manga strips without random values
const PAGE_HEIGHTS = [580, 520, 640, 500, 560, 480];

/** Placeholder strips sized to the reader's 800px reading column. */
const ChapterSkeleton: React.FC = () => (
  <div className="max-w-[800px] mx-auto w-full flex flex-col items-center animate-pulse">
    {PAGE_HEIGHTS.map((h, i) => (
      <div
        key={i}
        className="w-full bg-zinc-800/30 border-b border-[#000000] flex-shrink-0"
        style={{ height: `${h}px` }}
      />
    ))}
  </div>
);

export default ChapterSkeleton;
