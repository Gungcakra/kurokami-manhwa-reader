// @ts-nocheck
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import { applySeo, chapterSeo, idFromPath } from "../utils/seo";
import { getAuth } from "../utils/auth";
import { timeAgoShort, isRecent } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUp,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faListUl,
  faBook,
  faSpinner,
  faXmark,
  faSearch,
  faArrowDownUpAcrossLine,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import ChapterSkeleton from "../components/ui/ChapterSkeleton";
import logo from "../assets/images/logos/logo.png";

/** Chapters pulled per request by the picker sidebar. */
const PICKER_PAGE_SIZE = 120;

/**
 * Immersive vertical reader.
 *
 * Chapters swap **in place**: prev/next update `currentId`, which refetches and
 * resets the scroll position rather than doing a full page navigation.
 *
 * The chrome is a floating title pill at the top, a row of circular controls at
 * the bottom of the viewport, and a pair of page-scroll buttons on the right
 * edge. All three slide away while scrolling down and come back on a tap, on a
 * scroll up, or on the space bar.
 */
const Chapter = ({ idChapter }) => {
  // Static build: the page is the /chapter/_ shell, the real id is in the URL
  const [currentId, setCurrentId] = useState(() => (idChapter && idChapter !== "_" ? idChapter : idFromPath()));
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
  /** Timestamp until which scroll events are the app's own, not the reader's. */
  const autoScrollUntil = useRef(0);

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

  useEffect(() => {
    if (chapter?.data && manhwa) applySeo(chapterSeo(chapter.data, manhwa));
  }, [chapter, manhwa]);

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

    // When signed in, also record progress on the account (fire-and-forget;
    // a failure just means this view stays local-only).
    if (getAuth()) {
      apiService.addHistory(mangaId, currentId).catch(() => {});
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

  // ── scroll progress + auto-hide the chrome while scrolling down ──
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);

      const y = window.scrollY;
      // a scroll this code started is not the reader scrolling, so it must not
      // hide the very button that was just pressed
      if (Date.now() >= autoScrollUntil.current) {
        if (y > lastY + 24 && y > 200) setShowControls(false);
        else if (y < lastY - 24) setShowControls(true);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [currentId]);

  /** Circular floating control — the only chrome the reader shows. */
  const Round = ({ icon, label, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="glass w-12 md:w-16 aspect-square rounded-full border border-[#1c1c1c] text-white flex items-center justify-center shadow-lg shadow-black/50 transition-all hover:border-[#EF4444]/60 hover:text-[#EF4444] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-95 hover:cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
    >
      <FontAwesomeIcon icon={icon} className="text-base md:text-xl" />
    </button>
  );

  const scrollTop = () => {
    autoScrollUntil.current = Date.now() + 1000;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // a screenful at a time, matching the reference reader's edge buttons
  const scrollScreen = (dir) => {
    autoScrollUntil.current = Date.now() + 1000;
    window.scrollBy({ top: dir * window.innerHeight * 0.9, behavior: "smooth" });
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col">
      {/* reading progress — a hairline above everything else */}
      <div className="fixed top-0 inset-x-0 z-[130] h-[3px] bg-zinc-900/70">
        <div
          className="h-full grad-primary transition-[width] duration-150 shadow-[0_0_10px_var(--primary-glow)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── floating title pill ── */}
      <div
        className={`fixed top-0 inset-x-0 z-[120] h-[84px] md:h-[116px] flex items-center px-4 md:px-16 transition-all duration-300 ${
          showControls ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-5xl mx-auto w-full">
          <div className="glass flex justify-between items-center gap-4 rounded-2xl px-2 py-1 sm:px-6 sm:py-3 border border-[#1c1c1c] shadow-xl shadow-black/50">
            <a
              href={mangaId ? `/manhwa/${mangaId}` : "/"}
              aria-label="Kembali ke detail manhwa"
              title="Kembali ke detail manhwa"
              className="px-1 py-4 sm:px-4 text-white hover:text-[#EF4444] transition-colors flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </a>

            <div className="flex items-center gap-2 min-w-0 text-sm font-medium">
              <a
                href={mangaId ? `/manhwa/${mangaId}` : "/"}
                className="line-clamp-1 w-fit break-all hover:text-[#EF4444] transition-colors"
              >
                {manhwa?.title ?? "Memuat…"}
              </a>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-[11px] text-zinc-500 flex-shrink-0"
              />
              <span className="whitespace-nowrap text-[#EF4444] font-semibold flex-shrink-0">
                <span className="md:hidden">Ch</span>
                <span className="hidden md:inline">Chapter</span> {chapterNum ?? "…"}
              </span>
            </div>

            <button
              onClick={scrollTop}
              aria-label="Kembali ke atas"
              title="Kembali ke atas"
              className="px-1 py-4 sm:px-4 text-white hover:text-[#EF4444] transition-colors hover:cursor-pointer flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowUp} className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* ── page column (cleared of the fixed title pill) ──
          Tapping anywhere on the pages toggles the chrome. */}
      <div
        className="flex-1 relative flex flex-col pt-[84px] md:pt-[116px]"
        onClick={() => setShowControls((p) => !p)}
      >
        <div className="flex flex-col">
          {loading ? (
            <ChapterSkeleton />
          ) : images.length > 0 ? (
            <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">
              {images.map((image, i) => (
                <img
                  key={`${currentId}-${i}`}
                  src={`${basePath}/${image}`}
                  alt={`Halaman ${i + 1}`}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="w-full object-contain block select-none"
                  draggable={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-zinc-500 text-sm lg:text-base">Gambar chapter tidak ditemukan.</p>
              {mangaId && (
                <a
                  href={`/manhwa/${mangaId}`}
                  className="text-[#EF4444] text-sm font-semibold hover:underline"
                >
                  Kembali ke detail →
                </a>
              )}
            </div>
          )}

          {/* ── end-of-chapter navigation ── */}
          {!loading && images.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-[760px] mx-auto w-full px-4 pt-10 pb-6 flex flex-col items-center gap-5 animate-fade-up"
            >
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <FontAwesomeIcon icon={faCheckCircle} className="text-[#EF4444]" />
                <span>
                  Selesai membaca{" "}
                  <span className="text-white font-bold">Chapter {chapterNum ?? "…"}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <button
                  onClick={() => goTo(prevId)}
                  disabled={!prevId}
                  className="glass flex items-center justify-center gap-2 py-3 rounded-full border border-[#1c1c1c] text-sm font-bold text-white transition-all hover:border-[#EF4444]/50 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none hover:cursor-pointer"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  Sebelumnya
                </button>
                <button
                  onClick={() => goTo(nextId)}
                  disabled={!nextId}
                  className="grad-primary flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_6px_24px_var(--primary-glow)] disabled:opacity-30 disabled:pointer-events-none hover:cursor-pointer"
                >
                  Selanjutnya
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-[#1c1c1c] text-xs lg:text-sm font-semibold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 active:scale-95 transition-all hover:cursor-pointer"
                >
                  <FontAwesomeIcon icon={faListUl} className="text-[11px]" />
                  Daftar Chapter
                </button>
                {mangaId && (
                  <a
                    href={`/manhwa/${mangaId}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-[#1c1c1c] text-xs lg:text-sm font-semibold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 active:scale-95 transition-all"
                  >
                    <FontAwesomeIcon icon={faBook} className="text-[11px]" />
                    Detail Manhwa
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── control bar, floating over the pages ── */}
      <div
        className={`fixed inset-x-0 bottom-8 md:bottom-10 z-[110] flex justify-center pointer-events-none transition-all duration-300 ${
          showControls ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
          <Round
            icon={faChevronLeft}
            label="Chapter sebelumnya"
            onClick={() => goTo(prevId)}
            disabled={!prevId}
          />
          <Round
            icon={faChevronRight}
            label="Chapter selanjutnya"
            onClick={() => goTo(nextId)}
            disabled={!nextId}
          />
          <Round icon={faListUl} label="Daftar chapter" onClick={() => setShowPicker(true)} />
          <Round icon={faArrowUp} label="Kembali ke atas" onClick={scrollTop} />
        </div>
      </div>

      {/* ── page-scroll shortcuts on the right edge ── */}
      <div
        className={`fixed right-3 md:right-6 bottom-[104px] md:bottom-28 z-[100] flex flex-col gap-3 transition-all duration-300 ${
          showControls ? "translate-x-0 opacity-100" : "translate-x-[200%] opacity-0 pointer-events-none"
        }`}
      >
        <Round icon={faChevronUp} label="Gulir ke atas" onClick={() => scrollScreen(-1)} />
        <Round icon={faChevronDown} label="Gulir ke bawah" onClick={() => scrollScreen(1)} />
      </div>

      {/* ── footer ── */}
      <footer className="bg-[#0c0c0c] border-t border-[#1c1c1c] pt-8 lg:pt-12 pb-32 md:pb-36">
        <div className="flex flex-col items-center justify-center gap-5 px-4 text-center">
          <a href="/" className="flex items-center gap-2.5">
            <img src={logo.src} className="w-9 h-9" alt="" />
            <span className="text-xl font-black tracking-tight">
              Kuro<span className="text-[#EF4444]">kami</span>
            </span>
          </a>
          <p className="text-xs md:text-sm font-medium text-zinc-500">
            Copyright ©2025 Kurokami. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* ── chapter picker — overlay sidebar from the right ── */}
      <div
        className={`fixed inset-0 z-[140] transition-opacity duration-300 ${
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
          className={`absolute right-0 top-0 h-full w-[340px] sm:w-[420px] lg:w-[520px] max-w-[88vw] bg-[#0c0c0c] border-l border-[#1c1c1c] flex flex-col shadow-2xl shadow-black/80 transition-transform duration-300 ease-out ${
            showPicker ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* header */}
          <div className="flex items-center justify-between gap-2 px-4 lg:px-5 h-14 lg:h-[68px] border-b border-[#1c1c1c] flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FontAwesomeIcon icon={faListUl} className="text-[#EF4444] text-sm lg:text-lg flex-shrink-0" />
              <h2 className="font-bold text-sm lg:text-lg truncate">Daftar Chapter</h2>
              {chTotal != null && (
                <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-[#EF4444]/15 text-[#EF4444] text-[10px] lg:text-xs font-bold rounded-lg border border-[#EF4444]/20 flex-shrink-0">
                  {chTotal}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              aria-label="Tutup daftar chapter"
              className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all flex-shrink-0 hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* series + filters */}
          <div className="px-3 lg:px-4 py-3 lg:py-4 border-b border-[#1c1c1c] flex flex-col gap-2.5 lg:gap-3 flex-shrink-0">
            {manhwa?.title && (
              <p className="text-[11px] lg:text-sm text-zinc-500 truncate">{manhwa.title}</p>
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
                  className="w-full pl-7 lg:pl-9 pr-3 py-2 lg:py-2.5 bg-white/[0.04] border border-[#1c1c1c] rounded-full text-xs lg:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/50 focus:bg-white/[0.06]"
                />
              </div>
              <button
                onClick={() => setChOrder((o) => (o === "desc" ? "asc" : "desc"))}
                aria-label="Ubah urutan"
                className={`flex items-center gap-1.5 lg:gap-2 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-full text-[11px] lg:text-sm font-semibold border transition-all active:scale-95 flex-shrink-0 hover:cursor-pointer ${
                  chOrder === "asc"
                    ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                    : "bg-white/[0.04] text-zinc-400 border-[#1c1c1c] hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="text-[10px]" />
                {chOrder === "asc" ? "Terlama" : "Terbaru"}
              </button>
            </div>
          </div>

          {/* list */}
          <div ref={pickerScrollRef} className="relative flex-1 overflow-y-auto overscroll-contain p-2.5 lg:p-4 flex flex-col gap-2 lg:gap-3">
            {chapters.length === 0 ? (
              chLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 lg:gap-2">
                  {Array(40)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="h-[42px] lg:h-[54px] rounded-lg bg-white/[0.04] animate-pulse" />
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
                    className="py-2 lg:py-3 rounded-full border border-[#1c1c1c] bg-white/[0.04] text-[11px] lg:text-sm font-bold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 transition-all disabled:opacity-50 flex-shrink-0 hover:cursor-pointer"
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
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 lg:gap-2">
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
                        className={`relative flex flex-col items-center justify-center gap-0.5 h-[42px] lg:h-[54px] px-1 rounded-lg lg:rounded-xl border transition-all active:scale-95 hover:cursor-pointer ${
                          active
                            ? "grad-primary border-[#EF4444] shadow-[0_4px_16px_var(--primary-glow)]"
                            : read
                            ? "bg-white/[0.015] border-[#1c1c1c] hover:border-zinc-700"
                            : "bg-white/[0.03] border-[#1c1c1c] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/40"
                        }`}
                      >
                        <span
                          className={`text-[12px] lg:text-[15px] font-black leading-none tabular-nums ${
                            active ? "text-white" : read ? "text-zinc-500" : "text-zinc-100"
                          }`}
                        >
                          {ch.chapter_number}
                        </span>
                        {fresh && (
                          <span
                            className={`text-[8px] lg:text-[10px] font-bold leading-none ${
                              active ? "text-white/85" : "text-[#EF4444]"
                            }`}
                          >
                            {timeAgoShort(ch.release_date)}
                          </span>
                        )}
                        {!active && read && (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="absolute top-0.5 right-0.5 text-zinc-600 text-[7px] lg:text-[9px]"
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
                    className="py-2 lg:py-3 rounded-full border border-[#1c1c1c] bg-white/[0.04] text-[11px] lg:text-sm font-bold text-zinc-300 hover:text-white hover:border-[#EF4444]/40 transition-all disabled:opacity-50 flex-shrink-0 hover:cursor-pointer"
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
              className="flex items-center justify-center gap-2 px-4 py-3 lg:py-4 border-t border-[#1c1c1c] text-[11px] lg:text-sm font-semibold text-zinc-400 hover:text-[#EF4444] transition-colors flex-shrink-0"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <FontAwesomeIcon icon={faBook} className="text-[10px] lg:text-xs" />
              Buka detail manhwa
            </a>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Chapter;
