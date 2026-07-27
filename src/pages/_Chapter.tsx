// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faList,
  faHouse,
  faChevronUp,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import ChapterSkeleton from "../components/ui/ChapterSkeleton";

/**
 * Immersive vertical reader.
 *
 * Chapters swap **in place**: prev/next update `currentId`, which refetches and
 * resets the scroll position rather than doing a full page navigation.
 * Tapping the page area toggles the top/bottom control bars.
 */
const Chapter = ({ idChapter }) => {
  const [currentId, setCurrentId] = useState(idChapter);
  const [chapter, setChapter] = useState(null);
  const [manhwa, setManhwa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  const mangaIdRef = useRef(null);

  // ── fetch chapter ──
  useEffect(() => {
    setLoading(true);
    apiService.getChapterDetail(currentId).then((data) => {
      setChapter(data);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [currentId]);

  // ── fetch the parent series (only when it actually changes) ──
  const mangaId = chapter?.data?.manga_id;
  useEffect(() => {
    if (!mangaId || mangaIdRef.current === mangaId) return;
    mangaIdRef.current = mangaId;
    apiService.getDetail(mangaId).then((d) => setManhwa(d?.data ?? null));
  }, [mangaId]);

  // ── persist reading history + read-chapter marker ──
  useEffect(() => {
    if (!chapter?.data || !manhwa) return;
    try {
      const read = JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}");
      read[currentId] = Date.now();
      localStorage.setItem("kurokami_read_chapters", JSON.stringify(read));
      localStorage.setItem(`kurokami_last_read_${mangaId}`, currentId);

      const hist = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
      hist[mangaId] = {
        manga_id: mangaId,
        title: manhwa.title,
        cover: manhwa.cover_image_url,
        chapter_id: currentId,
        chapter_number: chapter.data.chapter_number,
        ts: Date.now(),
      };
      localStorage.setItem("kurokami_history", JSON.stringify(hist));
    } catch {
      /* localStorage unavailable — reading still works */
    }
  }, [chapter, manhwa, currentId, mangaId]);

  const prevId = chapter?.data?.prev_chapter_id;
  const nextId = chapter?.data?.next_chapter_id;
  const chapterNum = chapter?.data?.chapter_number;
  const images = chapter?.data?.chapter?.data ?? [];
  const basePath = chapter?.data?.base_url
    ? `${chapter.data.base_url}/${chapter.data.chapter?.path}`
    : "";

  const goTo = useCallback((id) => {
    if (!id) return;
    setCurrentId(id);
    setShowControls(true);
    // keep the URL in sync so refresh/share lands on the right chapter
    window.history.pushState({}, "", `/chapter/${id}`);
  }, []);

  // ── keyboard navigation ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") goTo(prevId);
      else if (e.key === "ArrowRight") goTo(nextId);
      else if (e.key === " ") setShowControls((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, goTo]);

  // ── scroll progress + auto-hide controls while scrolling down ──
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);

      const y = window.scrollY;
      if (y > lastY + 24 && y > 200) setShowControls(false);
      else if (y < lastY - 24) setShowControls(true);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NavButton = ({ id, dir, label }) =>
    id ? (
      <button
        onClick={() => goTo(id)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:cursor-pointer ${
          dir === "next"
            ? "bg-[#EF4444] text-white hover:bg-[#DC2626]"
            : "bg-[#1a1a1f] border border-zinc-700/60 text-zinc-300 hover:border-[#EF4444]/60 hover:text-white"
        }`}
      >
        {dir === "prev" && <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />}
        <span className="hidden sm:inline">{label}</span>
        {dir === "next" && <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />}
      </button>
    ) : (
      <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1a1a1f]/40 border border-zinc-800/40 text-zinc-700 cursor-default">
        {dir === "prev" && <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />}
        <span className="hidden sm:inline">{label}</span>
        {dir === "next" && <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />}
      </span>
    );

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      {/* ── top bar ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/60 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <a
              href="/"
              aria-label="Beranda"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1f] border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-[#EF4444]/60 transition-all flex-shrink-0"
            >
              <FontAwesomeIcon icon={faHouse} className="text-xs" />
            </a>
            {mangaId && (
              <a
                href={`/manhwa/${mangaId}`}
                aria-label="Daftar chapter"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1f] border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-[#EF4444]/60 transition-all flex-shrink-0"
              >
                <FontAwesomeIcon icon={faList} className="text-xs" />
              </a>
            )}
            <div className="min-w-0 ml-1">
              <p className="text-white text-xs font-bold truncate">{manhwa?.title ?? "Memuat…"}</p>
              {chapterNum != null && (
                <p className="text-[#EF4444] text-[10px] font-bold">Chapter {chapterNum}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <NavButton id={prevId} dir="prev" label="Prev" />
            <NavButton id={nextId} dir="next" label="Next" />
          </div>
        </div>

        {/* reading progress */}
        <div className="h-[2px] bg-zinc-800/60">
          <div
            className="h-full bg-[#EF4444] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── pages ── */}
      <main className="flex-1 pt-14" onClick={() => setShowControls((p) => !p)}>
        {loading ? (
          <ChapterSkeleton />
        ) : images.length > 0 ? (
          <div className="flex flex-col items-center w-full">
            {images.map((image, i) => (
              <img
                key={`${currentId}-${i}`}
                src={`${basePath}/${image}`}
                alt={`Halaman ${i + 1}`}
                loading={i < 3 ? "eager" : "lazy"}
                className="w-full max-w-3xl block select-none"
                draggable={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-zinc-500 text-sm">Gambar chapter tidak ditemukan.</p>
            {mangaId && (
              <a href={`/manhwa/${mangaId}`} className="text-[#EF4444] text-sm font-semibold hover:underline">
                Kembali ke detail →
              </a>
            )}
          </div>
        )}
      </main>

      {/* ── end-of-chapter actions ── */}
      {!loading && images.length > 0 && (
        <section className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-8 flex flex-col items-center gap-4">
          <p className="text-zinc-500 text-xs">
            Selesai membaca <span className="text-white font-bold">Chapter {chapterNum}</span>
          </p>
          <div className="flex items-center gap-2">
            <NavButton id={prevId} dir="prev" label="Chapter Sebelumnya" />
            <NavButton id={nextId} dir="next" label="Chapter Selanjutnya" />
          </div>
          {mangaId && (
            <a
              href={`/manhwa/${mangaId}`}
              className="text-[11px] text-zinc-500 hover:text-[#EF4444] font-semibold transition-colors"
            >
              ← Lihat semua chapter
            </a>
          )}
        </section>
      )}

      {/* ── bottom bar ── */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800/60 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          <NavButton id={prevId} dir="prev" label="Prev" />

          <div className="flex items-center gap-2">
            {loading && <FontAwesomeIcon icon={faSpinner} className="text-[#EF4444] text-xs animate-spin" />}
            <span className="text-[11px] font-bold text-zinc-400">
              {chapterNum != null ? `Ch ${chapterNum}` : "—"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="Kembali ke atas"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1f] border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-[#EF4444]/60 transition-all hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
            </button>
          </div>

          <NavButton id={nextId} dir="next" label="Next" />
        </div>
      </div>

      {/* keeps the last page clear of the fixed bottom bar */}
      <div className="h-14" />
    </div>
  );
};

export default Chapter;
