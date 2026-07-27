// @ts-nocheck
import { normalizeManga, formatCount } from "../../utils/function";
import CountryBadge from "./CountryBadge";

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
      className="group relative flex-shrink-0 w-[124px] sm:w-[140px] md:w-[156px] rounded-xl overflow-hidden bg-[#141417] border border-zinc-800/60 hover:border-[#EF4444]/50 hover:shadow-lg hover:shadow-[#EF4444]/10 transition-all duration-300"
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
          <span className="absolute top-0 left-0 px-2 py-0.5 bg-[#EF4444] text-white text-[11px] font-black rounded-br-xl leading-tight">
            #{rank}
          </span>
        )}

        <CountryBadge code={m.country} className="absolute top-1.5 right-1.5" />

        {m.rating && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm">
            <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-[9px] font-bold leading-none">{m.rating}</span>
          </span>
        )}

        {m.chapterNumber != null && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[#EF4444]/90 backdrop-blur-sm text-white text-[9px] font-black leading-none">
            Ch {m.chapterNumber}
          </span>
        )}
      </div>

      <div className="p-2 flex flex-col gap-0.5">
        <p className="text-white text-[11px] sm:text-xs font-semibold line-clamp-2 leading-snug group-hover:text-[#EF4444] transition-colors">
          {m.title}
        </p>
        {m.views > 0 && (
          <p className="text-zinc-500 text-[10px] leading-none">{formatCount(m.views)} views</p>
        )}
      </div>
    </a>
  );
};

export default CardSlider;
