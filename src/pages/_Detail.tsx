// @ts-nocheck
import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { timeAgo } from "../utils/function";
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
} from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
import Pagination from "../components/ui/Pagination";
import DetailSkeleton from "../components/ui/DetailSkeleton";
import Footer from "../components/common/Footer";

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

  useEffect(() => {
    const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
    setBookmarked(bm.includes(id));
    setReadMap(JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}"));
    setLastReadId(localStorage.getItem(`kurokami_last_read_${id}`));
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
  }, [page, reversed, search]);

  const toggleBookmark = () => {
    const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
    const next = bookmarked ? bm.filter((b: string) => b !== id) : [...bm, id];
    localStorage.setItem("kurokami_bookmarks", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  const markRead = (cid: string) => {
    const h = JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}");
    h[cid] = Date.now();
    localStorage.setItem("kurokami_read_chapters", JSON.stringify(h));
    localStorage.setItem(`kurokami_last_read_${id}`, cid);
    setReadMap((p) => ({ ...p, [cid]: Date.now() }));
    setLastReadId(cid);
  };

  const synopsis   = manhwa?.synopsis || manhwa?.description || "";
  const longSyn    = synopsis.length > 300;
  const showSyn    = longSyn && !expandSyn ? synopsis.slice(0, 300) + "…" : synopsis;
  const firstCh    = chapters[chapters.length - 1];
  const lastReadCh = chapters.find((c) => c.chapter_id === lastReadId);
  const genres     = manhwa?.taxonomy?.Genre ?? [];

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      {loading ? <DetailSkeleton /> : (
        <>
          {/* ═══════════════ HERO ═══════════════ */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-[0.15]"
              style={{ backgroundImage: `url(${manhwa.cover_portrait_url || manhwa.cover_image_url})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/50 via-transparent to-[#09090b]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/55 to-transparent" />

            <div className="relative max-w-screen-xl mx-auto px-4 py-8 sm:py-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">

                {/* Cover */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <div className="absolute -inset-2 rounded-3xl bg-[#e63946]/15 blur-xl" />
                  <img src={manhwa.cover_image_url} alt={manhwa.title}
                    className="relative w-28 sm:w-40 md:w-48 rounded-2xl border border-white/10 shadow-2xl shadow-black/70" />
                  {manhwa.status === 1 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full whitespace-nowrap shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ONGOING
                    </span>
                  )}
                </div>

                {/* ── Info block — all grouped ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-3 text-center sm:text-left">

                  {/* 1. Type */}
                  {manhwa.taxonomy?.Type?.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {manhwa.taxonomy.Type.map((t) => (
                        <span key={t.slug}
                          className="px-2 py-0.5 bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/30 rounded text-[10px] font-black uppercase tracking-widest">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 2. Title */}
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                      {manhwa.title}
                    </h1>
                    {manhwa.alternative_title && (
                      <p className="text-zinc-500 text-xs sm:text-sm mt-1 truncate">{manhwa.alternative_title}</p>
                    )}
                  </div>

                  {/* 3. Author / Artist — grouped */}
                  {(manhwa.taxonomy?.Author?.length > 0 || manhwa.taxonomy?.Artist?.length > 0) && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-400">
                      {manhwa.taxonomy?.Author?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faUser} className="text-zinc-600 text-[9px]" />
                          {manhwa.taxonomy.Author.map((a) => a.name).join(", ")}
                        </span>
                      )}
                      {manhwa.taxonomy?.Artist?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faPen} className="text-zinc-600 text-[9px]" />
                          {manhwa.taxonomy.Artist.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 4. Stats — rating, status, chapter count grouped together */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {manhwa.user_rate && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-bold">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-[10px]" />
                        {manhwa.user_rate}
                      </span>
                    )}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                      manhwa.status === 1
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800/60 border-zinc-700/40 text-zinc-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${manhwa.status === 1 ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                      {manhwa.status === 1 ? "Ongoing" : "Selesai"}
                    </span>
                    {totalRecord != null && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-[#e63946] text-[10px]" />
                        {totalRecord} Chapter
                      </span>
                    )}
                  </div>

                  {/* 5. Genre tags — below stats */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {genres.map((g) => (
                        <a key={g.slug} href={`/explore?genre=${g.slug}`}
                          className="px-2 py-0.5 bg-zinc-800/70 hover:bg-[#e63946]/15 hover:text-[#e63946] hover:border-[#e63946]/30 text-zinc-400 border border-zinc-700/40 rounded-full text-[10px] transition-all">
                          {g.name}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* 6. Action buttons — only Read & Bookmark */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-0.5">
                    {lastReadCh ? (
                      <a href={`/chapter/${lastReadId}`} onClick={() => markRead(lastReadId)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-[#e63946]/25 hover:scale-[1.02]">
                        <FontAwesomeIcon icon={faPlay} className="text-xs" />
                        Lanjut Ch.{lastReadCh.chapter_number}
                      </a>
                    ) : firstCh && (
                      <a href={`/chapter/${firstCh.chapter_id}`} onClick={() => markRead(firstCh.chapter_id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-[#e63946]/25">
                        <FontAwesomeIcon icon={faPlay} className="text-xs" />
                        Mulai Baca
                      </a>
                    )}
                    <button onClick={toggleBookmark}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:cursor-pointer ${
                        bookmarked
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                      }`}>
                      <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                      {bookmarked ? "Tersimpan" : "Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════ BODY ═══════════════ */}
          <div className="max-w-screen-xl mx-auto px-4 pb-10 w-full flex-1 mt-5">

            {/* Synopsis — di atas chapter list, text justify */}
            {synopsis && (
              <div className="bg-[#18181b] rounded-2xl p-4 sm:p-5 mb-5 border border-zinc-800/50">
                <h3 className="text-sm font-bold text-white mb-2.5">Sinopsis</h3>
                <p className="text-zinc-300 text-sm leading-relaxed text-justify">{showSyn}</p>
                {longSyn && (
                  <button onClick={() => setExpandSyn(!expandSyn)}
                    className="text-[#e63946] text-xs mt-2 hover:underline hover:cursor-pointer font-semibold">
                    {expandSyn ? "Sembunyikan ↑" : "Selengkapnya ↓"}
                  </button>
                )}
              </div>
            )}

            {/* Chapter list */}
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">

              {/* header */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-800/50 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-[#e63946] text-sm" />
                  <h3 className="font-bold text-sm sm:text-base">Daftar Chapter</h3>
                  {totalRecord != null && (
                    <span className="px-2 py-0.5 bg-[#e63946]/15 text-[#e63946] text-xs font-bold rounded-lg border border-[#e63946]/20">
                      {totalRecord}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                    <input type="text" placeholder="Cari…" value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="pl-7 pr-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e63946]/50 w-24 sm:w-32" />
                  </div>
                  <button onClick={() => { setReversed(!reversed); setPage(1); }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:cursor-pointer ${
                      reversed ? "bg-[#e63946]/15 text-[#e63946] border-[#e63946]/30" : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                    }`}>
                    <FontAwesomeIcon icon={faArrowDownUpAcrossLine} className="text-xs" />
                    <span className="hidden sm:inline">{reversed ? "Terlama" : "Terbaru"}</span>
                  </button>
                </div>
              </div>

              {/* cards */}
              {loadingCh ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 p-3.5">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-800/30 animate-pulse">
                      <div className="w-12 h-[68px] flex-shrink-0 rounded-xl bg-zinc-700/50" />
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
                  <FontAwesomeIcon icon={faLayerGroup} className="text-4xl" />
                  <p className="text-sm">Chapter tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 p-3.5">
                  {chapters.map((ch) => {
                    const read  = !!readMap[ch.chapter_id];
                    const fresh = isNew7(ch.release_date) && !read;
                    return (
                      <a key={ch.chapter_id} href={`/chapter/${ch.chapter_id}`}
                        onClick={() => markRead(ch.chapter_id)}
                        className={`group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 overflow-hidden ${
                          read
                            ? "bg-zinc-900/60 border-zinc-800/30 hover:border-zinc-700/50"
                            : "bg-zinc-800/20 border-zinc-800/50 hover:bg-[#e63946]/5 hover:border-[#e63946]/30 hover:shadow-md hover:shadow-[#e63946]/8"
                        }`}>

                        <div className={`absolute left-0 inset-y-0 w-[3px] ${read ? "bg-zinc-700/40" : "bg-[#e63946]"}`} />

                        <div className="w-12 h-[68px] flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900/80 ml-1">
                          {ch.thumbnail_image_url ? (
                            <img src={ch.thumbnail_image_url} alt="" loading="lazy"
                              className={`w-full h-full object-cover transition-transform duration-300 ${!read ? "group-hover:scale-105" : ""}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-zinc-600 font-black text-sm">{ch.chapter_number}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-bold leading-none transition-colors ${read ? "text-zinc-500" : "text-white group-hover:text-[#e63946]"}`}>
                              Ch.{ch.chapter_number}
                            </span>
                            {fresh && (
                              <span className="px-1.5 py-0.5 bg-[#e63946] text-white text-[9px] font-black rounded tracking-wide leading-none">
                                BARU
                              </span>
                            )}
                            {read && <FontAwesomeIcon icon={faCheckCircle} className="text-zinc-600 text-[10px]" />}
                          </div>
                          {ch.chapter_title && (
                            <p className="text-zinc-400 text-[11px] truncate">{ch.chapter_title}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-600">
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

              <div className="px-4 pb-5">
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
    </div>
  );
};

export default Detail;
