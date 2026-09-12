// @ts-nocheck
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import { timeAgoShort, isRecent } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faListUl,
  faBook,
  faHouse,
  faChevronUp,
  faSpinner,
  faXmark,
  faSearch,
  faArrowDownUpAcrossLine,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import ChapterSkeleton from "../components/ui/ChapterSkeleton";

/** Chapters pulled per request by the picker sidebar. */
const PICKER_PAGE_SIZE = 120;

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

  // ── chapter picker (right-hand overlay) ──
  const [showPicker, setShowPicker] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chLoading, setChLoading] = useState(false);
  const [chPage, setChPage] = useState(1);
  const [chTotalPages, setChTotalPages] = useState(undefined);
  const [chTotal, setChTotal] = useState(undefined);
  const [chQuery, setChQuery] = useState("");
  const [chSearch, setChSearch] = useState("");
  const [chOrder, setChOrder] = useState("desc");
  const [readMap, setReadMap] = useState({});

  // the page the current view started from — pages after it append, so a jump
  // straight to page 8 still replaces rather than concatenating onto page 1
  const [chStartPage, setChStartPage] = useState(1);

  const mangaIdRef = useRef(null);
  const searchTimer = useRef(null);
  const pickerScrollRef = useRef(null);
  const activeRowRef = useRef(null);
  const jumpedRef = useRef(false);
  /** Guards the one-shot centring so later paging does not yank the list back. */
  const centeredRef = useRef(false);
  /**
   * Scroll metrics captured just before older pages are prepended.
   *
   * Both values are recorded up front and the target position is computed from
   * them, rather than adjusting whatever scrollTop happens to be at the time:
   * clicking "muat sebelumnya" leaves focus on a button at the top of the list,
   * and the browser pulls the scroller back to 0 before the effect can run.
   * Restoring by growth delta (not by anchoring to a row) also keeps the list
   * still regardless of row heights.
   */
  const prevHeightRef = useRef(null);

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
    setShowPicker(false);
    // keep the URL in sync so refresh/share lands on the right chapter
    window.history.pushState({}, "", `/chapter/${id}`);
  }, []);

  // ── chapter picker ──

  // debounce typing so a 900-chapter series is not queried on every keystroke
  const onPickerSearch = (value) => {
    setChQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setChSearch(value.trim()), 400);
  };

  // any change of filter restarts paging from the top
  useEffect(() => {
    setChPage(1);
    setChStartPage(1);
  }, [chSearch, chOrder]);

  // re-arm the jump-to-current-chapter behaviour each time the panel is reopened
  useEffect(() => {
    if (!showPicker) {
      jumpedRef.current = false;
      centeredRef.current = false;
    }
  }, [showPicker]);

  // fetched lazily: the list is only worth a request once the panel is opened
  useEffect(() => {
    if (!showPicker || !mangaId) return;
    let cancelled = false;
    setChLoading(true);
    apiService
      .getChapterList(mangaId, chPage, PICKER_PAGE_SIZE, chOrder, chSearch)
      .then((r) => {
        if (cancelled) return;
        const data = r?.data ?? [];
        // the starting page replaces, later pages append ("Muat lebih banyak")
        setChapters((prev) => (chPage === chStartPage ? data : [...prev, ...data]));
        setChTotalPages(r?.meta?.total_page);
        setChTotal(r?.meta?.total_record);
        setChLoading(false);

        /**
         * Open on the chapter being read, not on the newest one.
         *
         * With 900+ chapters sorted newest-first, page 1 is nowhere near where
         * the reader actually is, and reaching it would mean pressing "muat
         * lebih banyak" a dozen times. Chapters are numbered ~1..total, so the
         * descending index of chapter N is about (total - N) — close enough to
         * land on the right page even when the numbering has gaps.
         */
        const total = r?.meta?.total_record;
        if (
          !jumpedRef.current &&
          !chSearch &&
          chOrder === "desc" &&
          chapterNum != null &&
          total
        ) {
          jumpedRef.current = true;
          if (!data.some((c) => c.chapter_id === currentId)) {
            const idx = Math.max(0, Math.round(total - chapterNum));
            const target = Math.min(
              Math.floor(idx / PICKER_PAGE_SIZE) + 1,
              r?.meta?.total_page ?? 1
            );
            if (target !== chPage) {
              setChStartPage(target);
              setChPage(target);
            }
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showPicker, mangaId, chPage, chOrder, chSearch]);

  /**
   * Load the page *before* the current window.
   *
   * Opening on the chapter being read can land deep in the list, so paging has
   * to work upward as well as downward — otherwise a reader on chapter 1 can
   * only reach newer chapters by searching or flipping the sort order.
   */
  const loadPrevPage = () => {
    if (chStartPage <= 1 || chLoading || !mangaId) return;
    const target = chStartPage - 1;
    // keep focus off the button we are about to move, so the browser does not
    // scroll it back into view mid-update
    document.activeElement?.blur?.();
    setChLoading(true);
    const box = pickerScrollRef.current;
    prevHeightRef.current = box
      ? { height: box.scrollHeight, top: box.scrollTop }
      : null;

    apiService
      .getChapterList(mangaId, target, PICKER_PAGE_SIZE, chOrder, chSearch)
      .then((r) => {
        setChapters((prev) => [...(r?.data ?? []), ...prev]);
        setChStartPage(target);
        setChLoading(false);
      });
  };

  // keep the anchored row under the same pixel after older pages are prepended
  useLayoutEffect(() => {
    const prev = prevHeightRef.current;
    if (prev == null) return;
    prevHeightRef.current = null;
    const box = pickerScrollRef.current;
    if (box) box.scrollTop = prev.top + (box.scrollHeight - prev.height);
  }, [chapters]);

  // centre the chapter being read inside the panel's own scroller (never the
  // page behind it, which is why this does not use scrollIntoView)
  useEffect(() => {
    if (!showPicker || chLoading || prevHeightRef.current != null || centeredRef.current) return;
    const row = activeRowRef.current;
    const box = pickerScrollRef.current;
    // no active row on this page yet — leave the flag unset so the jump's own
    // page still gets centred when it arrives
    if (!row || !box) return;
    centeredRef.current = true;
    box.scrollTop = row.offsetTop - box.clientHeight / 2 + row.offsetHeight / 2;
  }, [showPicker, chLoading, chapters]);

  // refresh read markers each time the panel opens
  useEffect(() => {
    if (!showPicker) return;
    try {
      setReadMap(JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}"));
    } catch {
      setReadMap({});
    }
  }, [showPicker, currentId]);

  // lock the page behind the overlay
  useEffect(() => {
    document.body.style.overflow = showPicker ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPicker]);

  // ── keyboard navigation ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowPicker(false);
        return;
      }
      if (e.target.tagName === "INPUT") return;
      // while the picker is open the arrows belong to it, not to the reader
      if (showPicker) return;
      if (e.key === "ArrowLeft") goTo(prevId);
      else if (e.key === "ArrowRight") goTo(nextId);
      else if (e.key === " ") setShowControls((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, goTo, showPicker]);

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
                aria-label="Detail manhwa"
                title="Detail manhwa"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1f] border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-[#EF4444]/60 transition-all flex-shrink-0"
              >
                <FontAwesomeIcon icon={faBook} className="text-xs" />
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

            {/* the chapter indicator doubles as the picker trigger — it is the
                most reachable spot on a phone and needs no extra icon slot */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker(true);
              }}
              aria-label="Pilih chapter"
              aria-expanded={showPicker}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#1a1a1f] border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-[#EF4444]/60 active:scale-95 transition-all hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faListUl} className="text-[11px] text-[#EF4444]" />
              <span className="text-[11px] font-bold">
                {chapterNum != null ? `Ch ${chapterNum}` : "Chapter"}
              </span>
            </button>

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

      {/* ── chapter picker — overlay sidebar from the right ── */}
      <div
        className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
          showPicker ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowPicker(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Pilih chapter"
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-[340px] sm:w-[420px] max-w-[88vw] bg-[#0e0e11] border-l border-zinc-800 flex flex-col shadow-2xl shadow-black/80 transition-transform duration-300 ease-out ${
            showPicker ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* header */}
          <div className="flex items-center justify-between gap-2 px-4 h-14 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FontAwesomeIcon icon={faListUl} className="text-[#EF4444] text-sm flex-shrink-0" />
              <h2 className="font-bold text-sm truncate">Daftar Chapter</h2>
              {chTotal != null && (
                <span className="px-2 py-0.5 bg-[#EF4444]/15 text-[#EF4444] text-[10px] font-bold rounded-lg border border-[#EF4444]/20 flex-shrink-0">
                  {chTotal}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              aria-label="Tutup daftar chapter"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all flex-shrink-0 hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* series + filters */}
          <div className="px-3 py-3 border-b border-zinc-800/70 flex flex-col gap-2.5 flex-shrink-0">
            {manhwa?.title && (
              <p className="text-[11px] text-zinc-500 truncate">{manhwa.title}</p>
            )}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={chQuery}
                  onChange={(e) => onPickerSearch(e.target.value)}
                  placeholder="Cari chapter…"
                  className="w-full pl-7 pr-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/50"
                />
              </div>
              <button
                onClick={() => setChOrder((o) => (o === "desc" ? "asc" : "desc"))}
                aria-label="Ubah urutan"
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 flex-shrink-0 hover:cursor-pointer ${
                  chOrder === "asc"
                    ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                    : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="text-[10px]" />
                {chOrder === "asc" ? "Terlama" : "Terbaru"}
              </button>
            </div>
          </div>

          {/* list */}
          <div ref={pickerScrollRef} className="relative flex-1 overflow-y-auto overscroll-contain p-2.5 flex flex-col gap-2">
            {chapters.length === 0 ? (
              chLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {Array(40)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="h-[42px] rounded-lg bg-zinc-800/40 animate-pulse" />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-600">
                  <FontAwesomeIcon icon={faListUl} className="text-3xl opacity-40" />
                  <p className="text-xs">Chapter tidak ditemukan</p>
                </div>
              )
            ) : (
              <>
                {chStartPage > 1 && (
                  <button
                    onClick={loadPrevPage}
                    disabled={chLoading}
                    className="py-2 rounded-xl border border-zinc-800 bg-zinc-800/40 text-[11px] font-bold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 transition-all disabled:opacity-50 flex-shrink-0 hover:cursor-pointer"
                  >
                    {chLoading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#EF4444]" />
                    ) : (
                      "↑ Muat chapter sebelumnya"
                    )}
                  </button>
                )}

                {/* Number tiles rather than full-width rows: a 900-chapter series
                    is navigated by number, and 4-5 per row puts ~10x more of it
                    on screen at once. */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {chapters.map((ch) => {
                    const active = ch.chapter_id === currentId;
                    const read = !!readMap[ch.chapter_id];
                    // Only fresh chapters carry a timestamp — on a years-old back
                    // catalogue every tile would otherwise read "1thn", which is
                    // noise rather than information.
                    const fresh = isRecent(ch.release_date, 14);
                    return (
                      <button
                        key={ch.chapter_id}
                        ref={active ? activeRowRef : undefined}
                        data-ch={ch.chapter_id}
                        onClick={() => goTo(ch.chapter_id)}
                        title={`Chapter ${ch.chapter_number}${ch.chapter_title ? ` — ${ch.chapter_title}` : ""}`}
                        aria-current={active ? "true" : undefined}
                        className={`relative flex flex-col items-center justify-center gap-0.5 h-[42px] px-1 rounded-lg border transition-all active:scale-95 hover:cursor-pointer ${
                          active
                            ? "bg-[#EF4444] border-[#EF4444] shadow-md shadow-[#EF4444]/30"
                            : read
                            ? "bg-zinc-900/60 border-zinc-800/50 hover:border-zinc-700"
                            : "bg-zinc-800/40 border-zinc-700/40 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/40"
                        }`}
                      >
                        <span
                          className={`text-[12px] font-black leading-none tabular-nums ${
                            active ? "text-white" : read ? "text-zinc-500" : "text-zinc-100"
                          }`}
                        >
                          {ch.chapter_number}
                        </span>
                        {fresh && (
                          <span
                            className={`text-[8px] font-bold leading-none ${
                              active ? "text-white/85" : "text-[#EF4444]"
                            }`}
                          >
                            {timeAgoShort(ch.release_date)}
                          </span>
                        )}
                        {!active && read && (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="absolute top-0.5 right-0.5 text-zinc-600 text-[7px]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {chTotalPages != null && chPage < chTotalPages && (
                  <button
                    onClick={() => setChPage((n) => n + 1)}
                    disabled={chLoading}
                    className="py-2 rounded-xl border border-zinc-800 bg-zinc-800/40 text-[11px] font-bold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 transition-all disabled:opacity-50 flex-shrink-0 hover:cursor-pointer"
                  >
                    {chLoading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#EF4444]" />
                    ) : (
                      `Muat lebih banyak (${chPage}/${chTotalPages})`
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* footer shortcut back to the series */}
          {mangaId && (
            <a
              href={`/manhwa/${mangaId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 border-t border-zinc-800 text-[11px] font-semibold text-zinc-400 hover:text-[#EF4444] transition-colors flex-shrink-0"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <FontAwesomeIcon icon={faBook} className="text-[10px]" />
              Buka detail manhwa
            </a>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Chapter;
