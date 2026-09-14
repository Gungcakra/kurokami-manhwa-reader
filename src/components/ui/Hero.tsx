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
      <div className="w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] xl:h-[470px] rounded-2xl lg:rounded-3xl bg-[#141417] border border-zinc-800/60 animate-pulse" />
    );
  }
  if (list.length === 0) return null;

  const m = normalizeManga(list[idx]);

  return (
    <section className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] xl:h-[470px] rounded-2xl lg:rounded-3xl overflow-hidden border border-zinc-800/60 group">
      {/* backdrop */}
      <img
        key={m.id}
        src={m.cover}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

      <div className="relative h-full flex items-center gap-4 sm:gap-6 lg:gap-9 px-4 sm:px-8 lg:px-12">
        {/* poster */}
        <a href={`/manhwa/${m.id}`} className="flex-shrink-0 hidden sm:block">
          <img
            src={m.portrait || m.cover}
            alt={m.title}
            className="w-[112px] md:w-[140px] lg:w-[185px] xl:w-[215px] aspect-[2/3] object-cover rounded-xl lg:rounded-2xl border border-white/10 shadow-2xl shadow-black/60"
          />
        </a>

        {/* copy */}
        <div className="flex flex-col gap-2 lg:gap-3 min-w-0 max-w-xl lg:max-w-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 lg:px-3 lg:py-1 rounded lg:rounded-md bg-[#EF4444] text-white text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest">
              Featured
            </span>
            {m.format && (
              <span className="px-2 py-0.5 lg:px-3 lg:py-1 rounded lg:rounded-md bg-white/10 text-zinc-200 text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wide">
                {m.format}
              </span>
            )}
            <CountryBadge code={m.country} />
          </div>

          <a
            href={`/manhwa/${m.id}`}
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight line-clamp-2 hover:text-[#EF4444] transition-colors"
          >
            {m.title}
          </a>

          <div className="flex flex-wrap items-center gap-x-3 lg:gap-x-4 gap-y-1 text-[11px] sm:text-xs lg:text-sm text-zinc-400">
            {m.rating && (
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <FontAwesomeIcon icon={faStar} className="text-[10px] lg:text-xs" />
                {m.rating}
              </span>
            )}
            {m.views > 0 && <span>{formatCount(m.views)} views</span>}
            {m.chapterNumber != null && <span>Ch {m.chapterNumber}</span>}
            {m.year && <span>{m.year}</span>}
          </div>

          <p className="hidden md:block text-zinc-400 text-xs lg:text-sm xl:text-base leading-relaxed line-clamp-2 lg:line-clamp-3">
            {manga_desc(list[idx])}
          </p>

          <div className="flex items-center gap-2 lg:gap-3 mt-1 lg:mt-2">
            <a
              href={firstChapterId ? `/chapter/${firstChapterId}` : `/manhwa/${m.id}`}
              className="flex items-center gap-2 px-4 py-2 lg:px-7 lg:py-3.5 bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] text-white rounded-xl lg:rounded-2xl text-xs sm:text-sm lg:text-base font-black transition-all shadow-lg shadow-[#EF4444]/25"
            >
              <FontAwesomeIcon icon={faPlay} className="text-[10px] lg:text-xs" />
              Mulai Baca
            </a>
            <a
              href={`/manhwa/${m.id}`}
              className="px-4 py-2 lg:px-7 lg:py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl lg:rounded-2xl text-xs sm:text-sm lg:text-base font-semibold transition-all"
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
        className="hidden sm:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-black/50 hover:bg-[#EF4444] text-white opacity-0 group-hover:opacity-100 transition-all hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs lg:text-base" />
      </button>
      <button
        onClick={() => go(idx + 1)}
        aria-label="Berikutnya"
        className="hidden sm:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-black/50 hover:bg-[#EF4444] text-white opacity-0 group-hover:opacity-100 transition-all hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-xs lg:text-base" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 lg:bottom-5 right-4 lg:right-6 flex items-center gap-1.5 lg:gap-2">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 lg:h-2 rounded-full transition-all hover:cursor-pointer ${
              i === idx ? "w-5 lg:w-8 bg-[#EF4444]" : "w-1.5 lg:w-2 bg-white/40 hover:bg-white/70"
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
