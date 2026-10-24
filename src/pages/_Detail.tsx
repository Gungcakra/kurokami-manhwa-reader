// @ts-nocheck
import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { getAuth } from "../utils/auth";
import { timeAgo } from "../utils/function";
import CountryBadge from "../components/ui/CountryBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faStar,
  faUser,
  faPen,
  faSearch,
  faBookmark,
  faPlay,
  faEye,
  faLayerGroup,
  faCheckCircle,
  faForwardFast,
} from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
import Pagination from "../components/ui/Pagination";
import DetailSkeleton from "../components/ui/DetailSkeleton";
import ShareButton from "../components/ui/ShareButton";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import BottomNav from "../components/common/BottomNav";

const fmt = (n: number) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};
const isNew7 = (d: string) => Date.now() - new Date(d).getTime() < 7 * 86_400_000;

interface DetailProps { id: string }
const PAGE_SIZE = 24;

const Detail = ({ id }: DetailProps) => {
  const [manhwa,      setManhwa]      = useState<any>(null);
  const [chapters,    setChapters]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingCh,   setLoadingCh]   = useState(true);
  const [reversed,    setReversed]    = useState(false);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState<number | undefined>();
  const [totalRecord, setTotalRecord] = useState<number | undefined>();
  const [search,      setSearch]      = useState("");
  const [expandSyn,   setExpandSyn]   = useState(false);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [readMap,     setReadMap]     = useState<Record<string, number>>({});
  const [lastReadId,  setLastReadId]  = useState<string | null>(null);
  const [lastReadNum, setLastReadNum] = useState<number | null>(null);
  const [firstCh,     setFirstCh]     = useState<any>(null);

  useEffect(() => {
    const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
    setBookmarked(bm.includes(id));
    setReadMap(JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}"));

    // When signed in, the server is the source of truth. Reconcile this manga's
    // state (and refresh the local mirror other pages read) in the background.
    if (getAuth()) {
      apiService
        .getBookmarks()
        .then((r) => {
          const ids = (r?.data ?? []).map((m: any) => m.manga_id);
          localStorage.setItem("kurokami_bookmarks", JSON.stringify(ids));
          setBookmarked(ids.includes(id));
        })
        .catch(() => {/* offline / token expired — keep the local view */});
    }

    const lastId = localStorage.getItem(`kurokami_last_read_${id}`);
    setLastReadId(lastId);
    // The reader writes the chapter number into history, so "Lanjut Ch.N" works
    // even when that chapter sits on a page of the list we are not showing.
    const hist = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
    const entry = hist?.[id];
    setLastReadNum(entry?.chapter_id === lastId ? entry?.chapter_number ?? null : null);
  }, [id]);

  /**
   * Chapter 1 of the whole series.
   *
   * It cannot be derived from `chapters`: that array holds one page of results
   * in whatever direction the user is sorting, so its last element is the oldest
   * chapter *on this page*, not the first chapter of the series.
   */
  useEffect(() => {
    apiService.getFirstChapter(id).then(setFirstCh);
  }, [id]);

  useEffect(() => {
    apiService.getDetail(id).then((r) => { setManhwa(r?.data ?? null); setLoading(false); });
  }, [id]);

  useEffect(() => {
    setLoadingCh(true);
    apiService.getChapterList(id, page, PAGE_SIZE, reversed ? "asc" : "desc", search).then((r) => {
      setChapters(r?.data ?? []);
      setTotalPages(r?.meta?.total_page);
      setTotalRecord(r?.meta?.total_record);
      setLoadingCh(false);
    });
  }, [id, page, reversed, search]);

  const toggleBookmark = () => {
    const wasBookmarked = bookmarked;
    const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
    const next = wasBookmarked ? bm.filter((b: string) => b !== id) : [...bm, id];

    // Optimistic: flip the UI + local mirror immediately.
    localStorage.setItem("kurokami_bookmarks", JSON.stringify(next));
    setBookmarked(!wasBookmarked);

    // When signed in, persist to the account; roll back if the server rejects.
    if (getAuth()) {
      const call = wasBookmarked
        ? apiService.removeBookmark(id)
        : apiService.addBookmark(id);
      call.catch(() => {
        localStorage.setItem("kurokami_bookmarks", JSON.stringify(bm));
        setBookmarked(wasBookmarked);
      });
    }
  };

  const markRead = (cid: string, num?: number) => {
    const h = JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}");
    h[cid] = Date.now();
    localStorage.setItem("kurokami_read_chapters", JSON.stringify(h));
    localStorage.setItem(`kurokami_last_read_${id}`, cid);
    setReadMap((p) => ({ ...p, [cid]: Date.now() }));
    setLastReadId(cid);
    if (num != null) setLastReadNum(num);
  };

  const synopsis   = manhwa?.synopsis || manhwa?.description || "";
  const longSyn    = synopsis.length > 300;
  const showSyn    = longSyn && !expandSyn ? synopsis.slice(0, 300) + "…" : synopsis;
  const genres     = manhwa?.taxonomy?.Genre ?? [];

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />
      {loading ? <DetailSkeleton /> : (
        <>
          {/* ═══════════════ HERO ═══════════════ */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-[0.15]"
              style={{ backgroundImage: `url(${manhwa.cover_portrait_url || manhwa.cover_image_url})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/50 via-transparent to-[#000000]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/55 to-transparent" />

            <div className="relative max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12 lg:py-16">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-7 lg:gap-11">

                {/* Cover */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <div className="absolute -inset-2 rounded-3xl bg-[#EF4444]/15 blur-xl" />
                  <img src={manhwa.cover_image_url} alt={manhwa.title}
                    loading="eager"
                    className="relative w-32 sm:w-40 md:w-48 lg:w-60 xl:w-[272px] rounded-2xl lg:rounded-3xl border border-white/10 shadow-2xl shadow-black/70" />
                  {manhwa.status === 1 && (
                    <span className="absolute -top-2.5 lg:-top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 lg:gap-1.5 px-2.5 py-0.5 lg:px-4 lg:py-1.5 bg-emerald-500 text-white text-[10px] lg:text-xs font-black rounded-full whitespace-nowrap shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ONGOING
                    </span>
                  )}
                </div>

                {/* ── Info block — all grouped ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 lg:gap-4 text-center sm:text-left">

                  {/* 1. Type */}
                  {manhwa.taxonomy?.Type?.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {manhwa.taxonomy.Type.map((t) => (
                        <span key={t.slug}
                          className="px-2 py-0.5 lg:px-3 lg:py-1 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 rounded lg:rounded-md text-[10px] lg:text-xs font-black uppercase tracking-widest">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 2. Title */}
                  <div className="min-w-0 w-full">
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight break-words hyphens-auto">
                      {manhwa.title}
                    </h1>
                    {manhwa.alternative_title && (
                      <p className="text-zinc-500 text-xs sm:text-sm lg:text-base mt-1 lg:mt-2 break-words line-clamp-2">
                        {manhwa.alternative_title}
                      </p>
                    )}
                  </div>

                  {/* 3. Author / Artist — grouped */}
                  {(manhwa.taxonomy?.Author?.length > 0 || manhwa.taxonomy?.Artist?.length > 0) && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 lg:gap-x-6 gap-y-1 text-xs lg:text-sm text-zinc-400">
                      {manhwa.taxonomy?.Author?.length > 0 && (
                        <span className="flex items-center gap-1 min-w-0 max-w-full">
                          <FontAwesomeIcon icon={faUser} className="text-zinc-600 text-[9px] lg:text-xs flex-shrink-0" />
                          <span className="truncate">{manhwa.taxonomy.Author.map((a) => a.name).join(", ")}</span>
                        </span>
                      )}
                      {manhwa.taxonomy?.Artist?.length > 0 && (
                        <span className="flex items-center gap-1 min-w-0 max-w-full">
                          <FontAwesomeIcon icon={faPen} className="text-zinc-600 text-[9px] lg:text-xs flex-shrink-0" />
                          <span className="truncate">{manhwa.taxonomy.Artist.map((a) => a.name).join(", ")}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* 4. Stats — rating, status, chapter count grouped together */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 lg:gap-2.5">
                    {manhwa.user_rate && (
                      <span className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1 lg:px-4 lg:py-2 bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full text-xs lg:text-sm font-bold">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-[10px] lg:text-xs" />
                        {manhwa.user_rate}
                      </span>
                    )}
                    <span className={`flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 rounded-full border text-xs lg:text-sm font-semibold ${
                      manhwa.status === 1
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800/60 border-zinc-700/40 text-zinc-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${manhwa.status === 1 ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                      {manhwa.status === 1 ? "Ongoing" : "Selesai"}
                    </span>
                    {totalRecord != null && (
                      <span className="flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 bg-white/5 border border-white/10 rounded-full text-xs lg:text-sm font-semibold text-zinc-300">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-[#EF4444] text-[10px] lg:text-xs" />
                        {totalRecord} Chapter
                      </span>
                    )}
                    {manhwa.view_count > 0 && (
                      <span className="flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 bg-white/5 border border-white/10 rounded-full text-xs lg:text-sm font-semibold text-zinc-300">
                        <FontAwesomeIcon icon={faEye} className="text-zinc-500 text-[10px] lg:text-xs" />
                        {fmt(manhwa.view_count)}
                      </span>
                    )}
                    {manhwa.bookmark_count > 0 && (
                      <span className="flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 bg-white/5 border border-white/10 rounded-full text-xs lg:text-sm font-semibold text-zinc-300">
                        <FontAwesomeIcon icon={faBookmark} className="text-zinc-500 text-[10px] lg:text-xs" />
                        {fmt(manhwa.bookmark_count)}
                      </span>
                    )}
                    {manhwa.release_year && (
                      <span className="flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 bg-white/5 border border-white/10 rounded-full text-xs lg:text-sm font-semibold text-zinc-300">
                        {manhwa.release_year}
                      </span>
                    )}
                    {manhwa.country_id && (
                      <span className="flex items-center gap-1.5 lg:gap-2 px-2.5 py-1 lg:px-4 lg:py-2 bg-white/5 border border-white/10 rounded-full text-xs lg:text-sm font-semibold text-zinc-300">
                        <CountryBadge code={manhwa.country_id} />
                      </span>
                    )}
                  </div>

                  {/* 5. Genre tags — below stats */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {genres.map((g) => (
                        <a key={g.slug} href={`/explore?genre=${g.slug}`}
                          className="px-2 py-0.5 lg:px-3.5 lg:py-1.5 bg-zinc-800/70 hover:bg-[#EF4444]/15 hover:text-[#EF4444] hover:border-[#EF4444]/30 text-zinc-400 border border-zinc-700/40 rounded-full text-[10px] lg:text-xs transition-all">
                          {g.name}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* 6. Action buttons — resume/start, jump to ch.1, share, bookmark.
                      Primary CTA owns its own row on phones; the secondary
                      controls share a row of equal-width buttons beneath it and
                      flow inline from `sm` up via `sm:contents`. */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 lg:gap-3 pt-1 lg:pt-3 w-full">
                    {lastReadId ? (
                      <a href={`/chapter/${lastReadId}`} onClick={() => markRead(lastReadId, lastReadNum)}
                        className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 lg:px-8 lg:py-4 grad-primary hover:brightness-110 active:scale-[0.98] text-white rounded-full text-sm lg:text-base font-black transition-all shadow-[0_6px_24px_var(--primary-glow)]">
                        <FontAwesomeIcon icon={faPlay} className="text-xs lg:text-sm" />
                        {lastReadNum != null ? `Lanjut Ch.${lastReadNum}` : "Lanjutkan Baca"}
                      </a>
                    ) : (
                      <a href={firstCh ? `/chapter/${firstCh.chapter_id}` : undefined}
                        onClick={() => firstCh && markRead(firstCh.chapter_id, firstCh.chapter_number)}
                        aria-disabled={!firstCh}
                        className={`flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-black transition-all shadow-lg ${
                          firstCh
                            ? "grad-primary hover:brightness-110 active:scale-[0.98] text-white shadow-[0_6px_24px_var(--primary-glow)]"
                            : "bg-[#EF4444]/40 text-white/70 shadow-none pointer-events-none"
                        }`}>
                        <FontAwesomeIcon icon={faPlay} className="text-xs lg:text-sm" />
                        Mulai Baca
                      </a>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto sm:contents">
                      {/* jumping back to the very first chapter stays available
                          once a resume button has taken the primary slot */}
                      {lastReadId && firstCh && firstCh.chapter_id !== lastReadId && (
                        <a href={`/chapter/${firstCh.chapter_id}`}
                          onClick={() => markRead(firstCh.chapter_id, firstCh.chapter_number)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 lg:px-5 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm lg:text-base font-semibold border bg-white/5 text-zinc-300 border-white/10 hover:text-white hover:border-white/20 active:scale-[0.98] transition-all">
                          <FontAwesomeIcon icon={faForwardFast} className="text-xs lg:text-sm rotate-180" />
                          Ch.{firstCh.chapter_number}
                        </a>
                      )}

                      <ShareButton className="flex-1 sm:flex-none" />

                      <button onClick={toggleBookmark}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 lg:px-5 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm lg:text-base font-semibold border transition-all hover:cursor-pointer active:scale-[0.98] ${
                          bookmarked
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30"
                            : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                        }`}>
                        <FontAwesomeIcon icon={faBookmark} className="text-xs lg:text-sm" />
                        {bookmarked ? "Tersimpan" : "Simpan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════ BODY ═══════════════ */}
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 pb-10 lg:pb-16 w-full flex-1 mt-5 lg:mt-8">

            {/* Synopsis — di atas chapter list, text justify */}
            {synopsis && (
              <div className="bg-[#111111] rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-8 mb-5 lg:mb-8 border border-[#1c1c1c]">
                <h3 className="text-sm lg:text-xl font-bold text-white mb-2.5 lg:mb-4">Sinopsis</h3>
                <p className="text-zinc-300 text-[13px] sm:text-sm lg:text-base leading-relaxed text-justify break-words">{showSyn}</p>
                {longSyn && (
                  <button onClick={() => setExpandSyn(!expandSyn)}
                    className="text-[#EF4444] text-xs lg:text-sm mt-2 lg:mt-3 hover:underline hover:cursor-pointer font-semibold">
                    {expandSyn ? "Sembunyikan ↑" : "Selengkapnya ↓"}
                  </button>
                )}
              </div>
            )}

            {/* Chapter list */}
            <div className="bg-[#111111] rounded-2xl lg:rounded-3xl border border-[#1c1c1c] overflow-hidden">

              {/* header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-5 lg:px-7 py-3.5 lg:py-5 border-b border-[#1c1c1c] bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-[#EF4444] text-sm lg:text-lg" />
                  <h3 className="font-bold text-sm sm:text-base lg:text-xl">Daftar Chapter</h3>
                  {totalRecord != null && (
                    <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-[#EF4444]/15 text-[#EF4444] text-xs lg:text-sm font-bold rounded-lg border border-[#EF4444]/20">
                      {totalRecord}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                    <input type="text" placeholder="Cari chapter…" value={search} inputMode="numeric"
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="w-full sm:w-36 lg:w-52 pl-7 lg:pl-9 pr-3 py-2 sm:py-1.5 lg:py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs lg:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/50" />
                  </div>
                  <button onClick={() => { setReversed(!reversed); setPage(1); }}
                    className={`flex items-center gap-1.5 lg:gap-2 px-3 py-2 sm:py-1.5 lg:px-5 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold border transition-all hover:cursor-pointer active:scale-95 flex-shrink-0 ${
                      reversed ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30" : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                    }`}>
                    <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="text-xs lg:text-sm" />
                    {reversed ? "Terlama" : "Terbaru"}
                  </button>
                </div>
              </div>

              {/* cards */}
              {loadingCh ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 lg:gap-4 p-3.5 lg:p-6">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 lg:gap-4 p-3.5 lg:p-5 rounded-2xl bg-zinc-800/30 animate-pulse">
                      <div className="w-12 h-[68px] lg:w-16 lg:h-[92px] flex-shrink-0 rounded-xl bg-zinc-700/50" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 bg-zinc-700/50 rounded-lg w-3/4" />
                        <div className="h-3 bg-zinc-800/70 rounded-lg w-1/2" />
                        <div className="h-3 bg-zinc-800/50 rounded-lg w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-4xl lg:text-5xl" />
                  <p className="text-sm lg:text-base">Chapter tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-4 p-3 sm:p-3.5 lg:p-6">
                  {chapters.map((ch) => {
                    const read  = !!readMap[ch.chapter_id];
                    const fresh = isNew7(ch.release_date) && !read;
                    return (
                      <a key={ch.chapter_id} href={`/chapter/${ch.chapter_id}`}
                        onClick={() => markRead(ch.chapter_id, ch.chapter_number)}
                        className={`group relative flex items-center gap-3 lg:gap-4 p-3 sm:p-3.5 lg:p-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
                          read
                            ? "bg-zinc-900/60 border-[#1c1c1c] hover:border-zinc-700/50"
                            : "bg-zinc-800/20 border-[#1c1c1c] hover:bg-[#EF4444]/5 hover:border-[#EF4444]/30 hover:shadow-md hover:shadow-[#EF4444]/8"
                        }`}>

                        <div className={`absolute left-0 inset-y-0 w-[3px] ${read ? "bg-zinc-700/40" : "bg-[#EF4444]"}`} />

                        <div className="w-12 h-[68px] lg:w-16 lg:h-[92px] flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900/80 ml-1">
                          {ch.thumbnail_image_url ? (
                            <img src={ch.thumbnail_image_url} alt="" loading="lazy"
                              className={`w-full h-full object-cover transition-transform duration-300 ${!read ? "group-hover:scale-105" : ""}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-zinc-600 font-black text-sm lg:text-lg">{ch.chapter_number}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm lg:text-base font-bold leading-none transition-colors ${read ? "text-zinc-500" : "text-white group-hover:text-[#EF4444]"}`}>
                              Ch.{ch.chapter_number}
                            </span>
                            {fresh && (
                              <span className="px-1.5 py-0.5 lg:px-2 lg:py-1 bg-[#EF4444] text-white text-[9px] lg:text-[11px] font-black rounded tracking-wide leading-none">
                                BARU
                              </span>
                            )}
                            {read && <FontAwesomeIcon icon={faCheckCircle} className="text-zinc-600 text-[10px]" />}
                          </div>
                          {ch.chapter_title && (
                            <p className="text-zinc-400 text-[11px] lg:text-[13px] truncate break-words">{ch.chapter_title}</p>
                          )}
                          <div className="flex items-center gap-2 lg:gap-2.5 mt-1 lg:mt-1.5 text-[10px] lg:text-xs text-zinc-600">
                            <span className="flex items-center gap-0.5">
                              <FontAwesomeIcon icon={faEye} />
                              {fmt(ch.view_count)}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(ch.release_date)}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="px-4 lg:px-6 pb-5 lg:pb-8">
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  totalPages={totalPages}
                  hasNext={chapters.length === PAGE_SIZE}
                />
              </div>
            </div>
          </div>
        </>
      )}
      <ButtonCorner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Detail;
