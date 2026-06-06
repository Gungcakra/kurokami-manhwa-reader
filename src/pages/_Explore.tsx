// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Pagination from "../components/ui/Pagination";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
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
  const resultCount = results?.total ?? results?.data?.length ?? 0;

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      <Navbar />

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col gap-2">

          {/* Row 1: search + genre toggle + reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
              <input type="text" placeholder="Cari judul manga / manhwa..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-[#18181b] border border-zinc-700/40 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e63946]/50" />
            </div>
            <button onClick={() => setShowGenres((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:cursor-pointer flex-shrink-0 ${
                selectedGenres.length > 0
                  ? "bg-[#e63946]/15 text-[#e63946] border-[#e63946]/30"
                  : "bg-[#18181b] text-zinc-400 border-zinc-700/40 hover:text-white"
              }`}>
              <FontAwesomeIcon icon={faFilter} className="text-xs" />
              <span className="hidden sm:inline">Genre</span>
              {selectedGenres.length > 0 && <span className="font-black">({selectedGenres.length})</span>}
              <FontAwesomeIcon icon={showGenres ? faChevronUp : faChevronDown} className="text-[10px]" />
            </button>
            {hasFilters && (
              <button onClick={clearFilters} title="Reset semua filter"
                className="p-2 rounded-xl text-zinc-400 hover:text-[#e63946] bg-zinc-800/50 border border-zinc-700/40 hover:border-[#e63946]/30 transition-all hover:cursor-pointer flex-shrink-0">
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
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:cursor-pointer whitespace-nowrap ${
                    format === f.value
                      ? "bg-[#e63946]/15 text-[#e63946] border-[#e63946]/30"
                      : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-zinc-700/50 flex-shrink-0" />

            {/* Status */}
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-[#e63946]/50 hover:cursor-pointer flex-shrink-0">
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-[#e63946]/50 hover:cursor-pointer flex-shrink-0">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Genre panel */}
          {showGenres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 pb-1 border-t border-zinc-800/50 max-h-40 overflow-y-auto scrollbar-hide">
              {genres.map((g) => (
                <button key={g.genre_id || g.slug} onClick={() => toggleGenre(g.slug)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:cursor-pointer ${
                    selectedGenres.includes(g.slug)
                      ? "bg-[#e63946]/15 text-[#e63946] border-[#e63946]/30"
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
      <div className="max-w-screen-xl mx-auto px-4 py-5 w-full flex-1">
        <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">

          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-b border-zinc-800/50 bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCompass} className="text-[#e63946] text-sm" />
              <h2 className="font-bold text-sm">
                {keyword ? `Hasil: "${keyword}"` : "Jelajahi"}
              </h2>
              {!loading && resultCount > 0 && (
                <span className="px-2 py-0.5 bg-[#e63946]/15 text-[#e63946] text-xs font-bold rounded-lg border border-[#e63946]/20">
                  {resultCount.toLocaleString()}
                </span>
              )}
            </div>

            {/* Active filter chips summary */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-1.5">
                {format && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-full text-[10px] text-zinc-300">
                    {FORMATS.find((f) => f.value === format)?.label}
                    <button onClick={() => { setFormat(""); setPage(1); }} className="hover:text-[#e63946] hover:cursor-pointer">×</button>
                  </span>
                )}
                {status && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-full text-[10px] text-zinc-300">
                    {STATUS.find((s) => s.value === status)?.label}
                    <button onClick={() => { setStatus(""); setPage(1); }} className="hover:text-[#e63946] hover:cursor-pointer">×</button>
                  </span>
                )}
                {selectedGenres.slice(0, 2).map((slug) => {
                  const g = genres.find((x) => x.slug === slug);
                  return g ? (
                    <span key={slug} className="flex items-center gap-1 px-2 py-0.5 bg-[#e63946]/10 border border-[#e63946]/20 rounded-full text-[10px] text-[#e63946]">
                      {g.name}
                      <button onClick={() => toggleGenre(slug)} className="hover:opacity-70 hover:cursor-pointer">×</button>
                    </span>
                  ) : null;
                })}
                {selectedGenres.length > 2 && (
                  <span className="px-2 py-0.5 bg-[#e63946]/10 border border-[#e63946]/20 rounded-full text-[10px] text-[#e63946]">
                    +{selectedGenres.length - 2} genre
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5 p-3.5">
              {Array(24).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : results?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
              <FontAwesomeIcon icon={faSearch} className="text-5xl opacity-40" />
              <p className="text-sm text-zinc-500">Tidak ada hasil ditemukan</p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-[#e63946] hover:underline hover:cursor-pointer font-semibold">
                  Reset semua filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5 p-3.5">
              {results?.data?.map((m) => (
                <Card key={m.manga_id} img={m.cover_image_url}
                  title={m.title} link={m.manga_id} chapter={m.chapters} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && results?.data?.length > 0 && (
            <div className="px-4 pb-5">
              <Pagination page={page} onPageChange={setPage}
                hasNext={!!results?.data?.length && results.data.length >= 24} />
            </div>
          )}
        </div>
      </div>

      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Explore;
