// @ts-nocheck
import {
  normalizeManga,
  timeAgoShort,
  isRecent,
  formatCount,
} from "../../utils/function";
import CountryBadge from "./CountryBadge";

/**
 * Poster card used across every grid.
 *
 * Accepts the raw API item via `manga` (preferred), or the legacy
 * img/title/link props still passed by a few call sites.
 */
const Card = ({ manga, img, title, link, chapter }) => {
  const m = manga
    ? normalizeManga(manga)
    : {
        id: link,
        title: title ?? "",
        cover: img ?? "",
        country: "",
        rating: null,
        views: 0,
        chapterNumber: chapter?.[0]?.chapter_number ?? null,
        chapterTime: chapter?.[0]?.created_at ?? "",
      };

  const fresh = m.chapterTime && isRecent(m.chapterTime, 3);

  return (
    <a
      href={`/manhwa/${m.id}`}
      className="group flex flex-col rounded-xl lg:rounded-2xl overflow-hidden bg-[#141417] border border-zinc-800/60 hover:border-[#EF4444]/50 hover:shadow-lg hover:shadow-[#EF4444]/10 transition-all duration-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

        {/* top-left: freshness */}
        <div className="absolute top-1.5 left-1.5 lg:top-2.5 lg:left-2.5 flex items-center gap-1 lg:gap-1.5">
          {m.chapterTime && (
            <span className="px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md bg-black/70 backdrop-blur-sm text-[9px] lg:text-[11px] font-bold text-zinc-200 leading-none">
              {timeAgoShort(m.chapterTime)}
            </span>
          )}
          {fresh && (
            <span className="px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md bg-[#EF4444] text-white text-[9px] lg:text-[11px] font-black leading-none tracking-wide">
              NEW
            </span>
          )}
        </div>

        {/* top-right: origin */}
        <CountryBadge code={m.country} className="absolute top-1.5 right-1.5 lg:top-2.5 lg:right-2.5" />

        {/* bottom-left: rating */}
        {m.rating && (
          <span className="absolute bottom-1.5 left-1.5 lg:bottom-2.5 lg:left-2.5 flex items-center gap-0.5 lg:gap-1 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md bg-black/70 backdrop-blur-sm">
            <svg className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-[9px] lg:text-[11px] font-bold leading-none">{m.rating}</span>
          </span>
        )}

        {/* bottom-right: latest chapter */}
        {m.chapterNumber != null && (
          <span className="absolute bottom-1.5 right-1.5 lg:bottom-2.5 lg:right-2.5 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md bg-[#EF4444]/90 backdrop-blur-sm text-white text-[9px] lg:text-[11px] font-black leading-none">
            Ch {m.chapterNumber}
          </span>
        )}
      </div>

      <div className="p-2 lg:p-3 flex flex-col gap-1 lg:gap-1.5">
        <p className="text-white text-[11px] sm:text-xs lg:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-[#EF4444] transition-colors">
          {m.title}
        </p>
        {m.views > 0 && (
          <p className="text-zinc-500 text-[10px] lg:text-xs leading-none">{formatCount(m.views)} views</p>
        )}
      </div>
    </a>
  );
};

export default Card;
