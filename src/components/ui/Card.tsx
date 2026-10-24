// @ts-nocheck
import {
  normalizeManga,
  timeAgoShort,
  isRecent,
  formatCount,
} from "../../utils/function";
import CountryBadge from "./CountryBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

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
      className="card-modern group flex flex-col overflow-hidden"
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
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-[9px] lg:text-xs" />
            <span className="text-white text-[9px] lg:text-[11px] font-bold leading-none">{m.rating}</span>
          </span>
        )}

        {/* bottom-right: latest chapter */}
        {m.chapterNumber != null && (
          <span className="grad-primary absolute bottom-1.5 right-1.5 lg:bottom-2.5 lg:right-2.5 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md text-white text-[9px] lg:text-[11px] font-black leading-none shadow-[0_2px_10px_var(--primary-glow)]">
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
