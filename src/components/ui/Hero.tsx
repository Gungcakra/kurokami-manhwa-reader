// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { apiService } from "../../utils/api";
import { normalizeManga, formatCount } from "../../utils/function";
import CountryBadge from "./CountryBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faPlay, faStar } from "@fortawesome/free-solid-svg-icons";

/**
 * Featured banner carousel. One large landscape card at a time on mobile,
 * auto-advancing, with a slide indicator and arrow controls on desktop.
 */
const Hero = ({ items = [], loading }) => {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const list = items.slice(0, 8);

  useEffect(() => {
    if (list.length < 2) return;
    timer.current = setInterval(() => setIdx((p) => (p + 1) % list.length), 6000);
    return () => clearInterval(timer.current);
  }, [list.length]);

  const go = (n) => {
    clearInterval(timer.current);
    setIdx((n + list.length) % list.length);
  };

  // "Mulai Baca" must open chapter 1, but list endpoints only return the latest
  // chapter — so look the first one up for the visible slide. Fetching lazily
  // per slide (rather than for all 8 up front) keeps the home page's initial
  // request burst unchanged; apiService caches the result per series.
  const currentId = list[idx]?.manga_id;
  const [firstChapterId, setFirstChapterId] = useState(null);

  useEffect(() => {
    if (!currentId) return;
    let cancelled = false;
    setFirstChapterId(null);
    apiService.getFirstChapter(currentId).then((ch) => {
      if (!cancelled) setFirstChapterId(ch?.chapter_id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  if (loading) {
    return (
      <div className="w-full h-[220px] sm:h-[300px] md:h-[360px] rounded-2xl bg-[#141417] border border-zinc-800/60 animate-pulse" />
    );
  }
  if (list.length === 0) return null;

  const m = normalizeManga(list[idx]);

  return (
    <section className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] rounded-2xl overflow-hidden border border-zinc-800/60 group">
      {/* backdrop */}
      <img
        key={m.id}
        src={m.cover}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

      <div className="relative h-full flex items-center gap-4 sm:gap-6 px-4 sm:px-8">
        {/* poster */}
        <a href={`/manhwa/${m.id}`} className="flex-shrink-0 hidden sm:block">
          <img
            src={m.portrait || m.cover}
            alt={m.title}
            className="w-[112px] md:w-[140px] aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-2xl shadow-black/60"
          />
        </a>

        {/* copy */}
        <div className="flex flex-col gap-2 min-w-0 max-w-xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-[#EF4444] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              Featured
            </span>
            {m.format && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">
                {m.format}
              </span>
            )}
            <CountryBadge code={m.country} />
          </div>

          <a
            href={`/manhwa/${m.id}`}
            className="text-lg sm:text-2xl md:text-3xl font-black leading-tight line-clamp-2 hover:text-[#EF4444] transition-colors"
          >
            {m.title}
          </a>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-zinc-400">
            {m.rating && (
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                {m.rating}
              </span>
            )}
            {m.views > 0 && <span>{formatCount(m.views)} views</span>}
            {m.chapterNumber != null && <span>Ch {m.chapterNumber}</span>}
            {m.year && <span>{m.year}</span>}
          </div>

          <p className="hidden md:block text-zinc-400 text-xs leading-relaxed line-clamp-2">
            {manga_desc(list[idx])}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <a
              href={firstChapterId ? `/chapter/${firstChapterId}` : `/manhwa/${m.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-[#EF4444]/25"
            >
              <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
              Mulai Baca
            </a>
            <a
              href={`/manhwa/${m.id}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              Detail
            </a>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button
        onClick={() => go(idx - 1)}
        aria-label="Sebelumnya"
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/50 hover:bg-[#EF4444] text-white opacity-0 group-hover:opacity-100 transition-all hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
      </button>
      <button
        onClick={() => go(idx + 1)}
        aria-label="Berikutnya"
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/50 hover:bg-[#EF4444] text-white opacity-0 group-hover:opacity-100 transition-all hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all hover:cursor-pointer ${
              i === idx ? "w-5 bg-[#EF4444]" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

/** Strip the raw description down to a short teaser */
function manga_desc(raw) {
  const d = raw?.description || "";
  return d.replace(/\s+/g, " ").trim();
}

export default Hero;
