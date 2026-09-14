// @ts-nocheck
import { normalizeManga, timeAgoShort, isRecent } from "../../utils/function";
import CountryBadge from "./CountryBadge";

/**
 * List-view row for "Update Terbaru": cover thumb on the left, title on top,
 * and the 3 most recent chapters stacked underneath with their release times.
 * Falls back to the single latest chapter when the endpoint has no `chapters[]`.
 */
const UpdateRow = ({ manga }) => {
  const m = normalizeManga(manga);

  const rows =
    m.chapters.length > 0
      ? m.chapters
      : m.chapterNumber != null
      ? [{ chapter_id: m.chapterId, chapter_number: m.chapterNumber, created_at: m.chapterTime }]
      : [];

  return (
    <div className="flex gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#141417] border border-zinc-800/60 hover:border-[#EF4444]/40 transition-all duration-200">
      <a href={`/manhwa/${m.id}`} className="relative flex-shrink-0 group">
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          className="w-14 h-[76px] sm:w-16 sm:h-[88px] lg:w-[76px] lg:h-[106px] rounded-lg lg:rounded-xl object-cover bg-zinc-900 group-hover:opacity-80 transition-opacity"
        />
        <CountryBadge code={m.country} className="absolute -bottom-1 -right-1" />
      </a>

      <div className="flex flex-col min-w-0 flex-1 gap-1.5 lg:gap-2">
        <a
          href={`/manhwa/${m.id}`}
          className="text-white text-xs sm:text-sm lg:text-base font-bold line-clamp-2 leading-snug hover:text-[#EF4444] transition-colors"
        >
          {m.title}
        </a>

        <div className="flex flex-col gap-1">
          {rows.map((c) => (
            <a
              key={c.chapter_id}
              href={`/chapter/${c.chapter_id}`}
              className="flex items-center justify-between gap-2 group/ch"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] lg:text-[13px] text-zinc-400 group-hover/ch:text-[#EF4444] transition-colors truncate">
                  Chapter {c.chapter_number}
                </span>
                {isRecent(c.created_at, 1) && (
                  <span className="px-1 py-px rounded bg-[#EF4444] text-white text-[8px] font-black leading-none flex-shrink-0">
                    NEW
                  </span>
                )}
              </span>
              <span className="text-[10px] lg:text-xs text-zinc-600 flex-shrink-0">
                {timeAgoShort(c.created_at)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateRow;
