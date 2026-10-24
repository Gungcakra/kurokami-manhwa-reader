// @ts-nocheck
import { normalizeManga, formatCount } from "../../utils/function";
import CountryBadge from "./CountryBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

/**
 * Compact poster used inside the horizontal rails (Trending / Rekomendasi).
 * Pass the raw API item as `manga`; legacy img/title/link props still work.
 */
const CardSlider = ({ manga, img, title, link, chapter, rating, rank }) => {
  const m = manga
    ? normalizeManga(manga)
    : {
        id: link,
        title: title ?? "",
        portrait: img ?? "",
        rating,
        views: 0,
        country: "",
        chapterNumber: chapter ?? null,
      };

  return (
    <a
      href={`/manhwa/${m.id}`}
      className="card-modern group relative flex-shrink-0 w-[124px] sm:w-[140px] md:w-[156px] lg:w-[184px] xl:w-[205px] overflow-hidden"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        <img
          src={m.portrait || m.cover}
          alt={m.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

        {rank != null && (
          <span className="absolute top-0 left-0 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-[#EF4444] text-white text-[11px] lg:text-[13px] font-black rounded-br-xl leading-tight">
            #{rank}
          </span>
        )}

        <CountryBadge code={m.country} className="absolute top-1.5 right-1.5 lg:top-2.5 lg:right-2.5" />

        {m.rating && (
          <span className="absolute bottom-1.5 left-1.5 lg:bottom-2.5 lg:left-2.5 flex items-center gap-0.5 lg:gap-1 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md bg-black/70 backdrop-blur-sm">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-[9px] lg:text-xs" />
            <span className="text-white text-[9px] lg:text-[11px] font-bold leading-none">{m.rating}</span>
          </span>
        )}

        {m.chapterNumber != null && (
          <span className="absolute bottom-1.5 right-1.5 lg:bottom-2.5 lg:right-2.5 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md grad-primary backdrop-blur-sm text-white text-[9px] lg:text-[11px] font-black leading-none">
            Ch {m.chapterNumber}
          </span>
        )}
      </div>

      <div className="p-2 lg:p-3 flex flex-col gap-0.5 lg:gap-1">
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

export default CardSlider;
