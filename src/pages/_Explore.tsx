// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
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
  { label: "Rating Tertinggi", value: "rating" },
];

const getInitialGenres = () => {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const g = params.get("genre");
  return g ? [g] : [];
};

const getInitialKeyword = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") || "";
};

const Explore = () => {
  const [results, setResults] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(getInitialKeyword);
  const [format, setFormat] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedGenres, setSelectedGenres] = useState(getInitialGenres);
  const [page, setPage] = useState(1);
  const [showGenrePanel, setShowGenrePanel] = useState(
    () => getInitialGenres().length > 0
  );
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    apiService.getGenres().then((data) => setGenres(data?.data || []));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, format, status, sort, selectedGenres, page]);

  const fetchResults = async () => {
    setLoading(true);
    const data = await apiService.getExplore({
      page,
      pageSize: 24,
      genres: selectedGenres,
      status,
      sort,
      format,
      keyword,
    });
    setResults(data);
    setLoading(false);
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword("");
    setFormat("");
    setStatus("");
    setSort("latest");
    setSelectedGenres([]);
    setPage(1);
  };

  const hasFilters =
    keyword || format || status !== "" || selectedGenres.length > 0;

  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      <Navbar />

      {/* Sticky filter bar */}
      <div className="sticky top-[57px] z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col gap-2">
          {/* Row 1: search + genre toggle + reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"
              />
              <input
                type="text"
                placeholder="Cari judul..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e63946]/50"
              />
            </div>
            <button
              onClick={() => setShowGenrePanel((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:cursor-pointer border flex-shrink-0 ${
                selectedGenres.length > 0
                  ? "bg-[#e63946] text-white border-[#e63946]"
                  : "bg-[#18181b] text-zinc-400 border-zinc-700/50 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faFilter} className="text-xs" />
              <span className="hidden sm:inline">Genre</span>
              {selectedGenres.length > 0 && <span>({selectedGenres.length})</span>}
              <FontAwesomeIcon icon={showGenrePanel ? faChevronUp : faChevronDown} className="text-[10px]" />
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 transition-all hover:cursor-pointer flex-shrink-0"
                title="Reset filter"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>

          {/* Row 2: format + status + sort — horizontally scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <div className="flex gap-0.5 bg-[#18181b] rounded-xl p-1 border border-zinc-800/50 flex-shrink-0">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setFormat(f.value); setPage(1); }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:cursor-pointer whitespace-nowrap ${
                    format === f.value ? "bg-[#e63946] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-[#e63946]/50 hover:cursor-pointer flex-shrink-0"
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-[#e63946]/50 hover:cursor-pointer flex-shrink-0"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Genre panel */}
          {showGenrePanel && genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-hide pb-1 pt-1 border-t border-zinc-800/50">
              {genres.map((genre) => (
                <button
                  key={genre.genre_id || genre.slug}
                  onClick={() => toggleGenre(genre.slug)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:cursor-pointer ${
                    selectedGenres.includes(genre.slug)
                      ? "bg-[#e63946] text-white"
                      : "bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        {results?.total !== undefined && (
          <p className="text-xs text-zinc-500 mb-4">
            {results.total > 0
              ? `${results.total.toLocaleString()} judul ditemukan`
              : "Tidak ada hasil"}
          </p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {loading
            ? Array(24)
                .fill(0)
                .map((_, i) => <CardSkeleton key={i} />)
            : results?.data?.map((manga) => (
                <Card
                  key={manga.manga_id}
                  img={manga.cover_image_url}
                  title={manga.title}
                  link={manga.manga_id}
                  chapter={manga.chapters}
                />
              ))}
        </div>

        {!loading && results?.data && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm disabled:opacity-30 hover:border-[#e63946]/50 hover:cursor-pointer transition-all"
            >
              ← Prev
            </button>
            <span className="text-zinc-400 text-sm px-2">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!results?.data?.length || results.data.length < 24}
              className="px-4 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm disabled:opacity-30 hover:border-[#e63946]/50 hover:cursor-pointer transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Explore;
