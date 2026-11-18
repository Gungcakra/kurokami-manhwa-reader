// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Pagination from "../components/ui/Pagination";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faChevronDown,
  faChevronUp,
  faTimes,
  faCompass,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";

const FORMATS = [
  { label: "Semua", value: "" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manga", value: "manga" },
  { label: "Manhua", value: "manhua" },
];

const STATUS = [
  { label: "Semua Status", value: "" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

const SORT_OPTIONS = [
  { label: "Terbaru", value: "latest" },
  { label: "Terpopuler", value: "popularity" },
  { label: "Rating", value: "rating" },
];

const getInitialGenres = () => {
  if (typeof window === "undefined") return [];
  const g = new URLSearchParams(window.location.search).get("genre");
  return g ? [g] : [];
};
const getInitialKeyword = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") || "";
};

const Explore = () => {
  const [results,       setResults]       = useState(null);
  const [genres,        setGenres]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [keyword,       setKeyword]       = useState(getInitialKeyword);
  const [format,        setFormat]        = useState("");
  const [status,        setStatus]        = useState("");
  const [sort,          setSort]          = useState("latest");
  const [selectedGenres, setSelectedGenres] = useState(getInitialGenres);
  const [page,          setPage]          = useState(1);
  const [showGenres,    setShowGenres]    = useState(() => getInitialGenres().length > 0);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    apiService.getGenres().then((d) => setGenres(d?.data || []));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, format, status, sort, selectedGenres, page]);

  const fetchResults = async () => {
    setLoading(true);
    const data = await apiService.getExplore({ page, pageSize: 24, genres: selectedGenres, status, sort, format, keyword });
    setResults(data);
    setLoading(false);
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((p) => p.includes(slug) ? p.filter((g) => g !== slug) : [...p, slug]);
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword(""); setFormat(""); setStatus(""); setSort("latest"); setSelectedGenres([]); setPage(1);
  };

  const hasFilters = keyword || format || status !== "" || selectedGenres.length > 0;
  // The API no longer reports totals, only `has_next`: show the count seen so
  // far, with a "+" when there are more pages
  const resultCount = results?.meta?.total_record ?? ((page - 1) * 24 + (results?.data?.length ?? 0));
  const moreResults = results?.meta?.total_record == null && !!results?.meta?.has_next;
  const totalPages = results?.meta?.total_page;

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[60px] lg:top-[71px] z-30 bg-[#000000]/95 backdrop-blur-md border-b border-[#1c1c1c]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-3 lg:py-4 flex flex-col gap-2 lg:gap-3">

          {/* Row 1: search + genre toggle + reset */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
              <input type="text" placeholder="Cari judul manga / manhwa..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="w-full pl-9 lg:pl-11 pr-3 py-2 lg:py-3 bg-[#111111] border border-zinc-700/40 rounded-xl text-sm lg:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/50" />
            </div>
            <button onClick={() => setShowGenres((p) => !p)}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 py-2 lg:px-5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold border transition-all hover:cursor-pointer flex-shrink-0 ${
                selectedGenres.length > 0
                  ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                  : "bg-[#111111] text-zinc-400 border-zinc-700/40 hover:text-white"
              }`}>
              <FontAwesomeIcon icon={faFilter} className="text-xs" />
              <span className="hidden sm:inline">Genre</span>
              {selectedGenres.length > 0 && <span className="font-black">({selectedGenres.length})</span>}
              <FontAwesomeIcon icon={showGenres ? faChevronUp : faChevronDown} className="text-[10px]" />
            </button>
            {hasFilters && (
              <button onClick={clearFilters} title="Reset semua filter"
                className="p-2 lg:p-3 rounded-xl text-zinc-400 hover:text-[#EF4444] bg-zinc-800/50 border border-zinc-700/40 hover:border-[#EF4444]/30 transition-all hover:cursor-pointer flex-shrink-0">
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>

          {/* Row 2: format tabs + status + sort */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {/* Format tabs */}
            <div className="flex gap-1 flex-shrink-0">
              {FORMATS.map((f) => (
                <button key={f.value} onClick={() => { setFormat(f.value); setPage(1); }}
                  className={`px-2.5 py-1.5 lg:px-4 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold border transition-all hover:cursor-pointer whitespace-nowrap ${
                    format === f.value
                      ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                      : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-zinc-700/50 flex-shrink-0" />

            {/* Status */}
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-1.5 lg:px-4 lg:py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs lg:text-sm text-zinc-300 focus:outline-none focus:border-[#EF4444]/50 hover:cursor-pointer flex-shrink-0">
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-1.5 lg:px-4 lg:py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs lg:text-sm text-zinc-300 focus:outline-none focus:border-[#EF4444]/50 hover:cursor-pointer flex-shrink-0">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Genre panel */}
          {showGenres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2 lg:pt-3 pb-1 border-t border-[#1c1c1c] max-h-40 lg:max-h-56 overflow-y-auto scrollbar-hide">
              {genres.map((g) => (
                <button key={g.genre_id || g.slug} onClick={() => toggleGenre(g.slug)}
                  className={`px-2.5 py-1 lg:px-4 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium border transition-all hover:cursor-pointer ${
                    selectedGenres.includes(g.slug)
                      ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                      : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white hover:border-zinc-600"
                  }`}>
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-5 lg:py-9 w-full flex-1">
        <div className="bg-[#111111] rounded-2xl lg:rounded-3xl border border-[#1c1c1c] overflow-hidden">

          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 lg:px-7 py-3.5 lg:py-5 border-b border-[#1c1c1c] bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCompass} className="text-[#EF4444] text-sm lg:text-lg" />
              <h2 className="font-bold text-sm lg:text-lg">
                {keyword ? `Hasil: "${keyword}"` : "Jelajahi"}
              </h2>
              {!loading && resultCount > 0 && (
                <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-[#EF4444]/15 text-[#EF4444] text-xs lg:text-sm font-bold rounded-lg border border-[#EF4444]/20">
                  {resultCount.toLocaleString()}{moreResults ? "+" : ""}
                </span>
              )}
            </div>

            {/* Active filter chips summary */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-1.5">
                {format && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-full text-[10px] text-zinc-300">
                    {FORMATS.find((f) => f.value === format)?.label}
                    <button onClick={() => { setFormat(""); setPage(1); }} className="hover:text-[#EF4444] hover:cursor-pointer">×</button>
                  </span>
                )}
                {status && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-full text-[10px] text-zinc-300">
                    {STATUS.find((s) => s.value === status)?.label}
                    <button onClick={() => { setStatus(""); setPage(1); }} className="hover:text-[#EF4444] hover:cursor-pointer">×</button>
                  </span>
                )}
                {selectedGenres.slice(0, 2).map((slug) => {
                  const g = genres.find((x) => x.slug === slug);
                  return g ? (
                    <span key={slug} className="flex items-center gap-1 px-2 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-full text-[10px] text-[#EF4444]">
                      {g.name}
                      <button onClick={() => toggleGenre(slug)} className="hover:opacity-70 hover:cursor-pointer">×</button>
                    </span>
                  ) : null;
                })}
                {selectedGenres.length > 2 && (
                  <span className="px-2 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-full text-[10px] text-[#EF4444]">
                    +{selectedGenres.length - 2} genre
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 lg:gap-4 p-3.5 lg:p-6">
              {Array(24).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : results?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
              <FontAwesomeIcon icon={faSearch} className="text-5xl opacity-40" />
              <p className="text-sm text-zinc-500">Tidak ada hasil ditemukan</p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-[#EF4444] hover:underline hover:cursor-pointer font-semibold">
                  Reset semua filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 lg:gap-4 p-3.5 lg:p-6">
              {results?.data?.map((m) => (
                <Card key={m.manga_id} manga={m} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && results?.data?.length > 0 && (
            <div className="px-4 lg:px-6 pb-5 lg:pb-7">
              <Pagination page={page} onPageChange={setPage}
                totalPages={totalPages}
                hasNext={results?.meta?.has_next ?? (!!results?.data?.length && results.data.length >= 24)} />
            </div>
          )}
        </div>
      </div>

      <ButtonCorner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Explore;
