// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Pagination from "../components/ui/Pagination";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faStar, faBolt, faCircleCheck, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

const PAGE_SIZE = 30;

const FORMATS = [
  { label: "Semua", value: "all" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manga", value: "manga" },
  { label: "Manhua", value: "manhua" },
];

/** Each browse type maps to its API call + heading. */
const TYPES = {
  popular: {
    title: "Terpopuler",
    subtitle: "Judul dengan pembaca terbanyak",
    icon: faFire,
    iconClass: "text-orange-400",
    fetch: (page) => apiService.getPopular(page, PAGE_SIZE),
  },
  top: {
    title: "Rating Tertinggi",
    subtitle: "Peringkat berdasarkan penilaian pembaca",
    icon: faStar,
    iconClass: "text-yellow-400",
    fetch: (page) => apiService.getTop(page, PAGE_SIZE),
  },
  completed: {
    title: "Komik Tamat",
    subtitle: "Seri yang sudah selesai — bisa dibaca sampai habis",
    icon: faCircleCheck,
    iconClass: "text-emerald-400",
    fetch: (page) => apiService.getCompleted(page, PAGE_SIZE),
  },
  updates: {
    title: "Update Terbaru",
    subtitle: "Chapter yang baru saja rilis",
    icon: faBolt,
    iconClass: "text-[#EF4444]",
    hasFormat: true,
    fetch: (page, format) => apiService.getNewUpdate(page, PAGE_SIZE, format),
  },
  recommended: {
    title: "Rekomendasi",
    subtitle: "Pilihan kurasi untuk kamu",
    icon: faThumbsUp,
    iconClass: "text-[#EF4444]",
    fetch: (page) => apiService.getRecommend(page, PAGE_SIZE),
  },
};

/**
 * Shared category browser behind /popular, /top, /completed, /updates
 * and /recommended. Pagination uses the API's real `meta.total_page`.
 */
const Browse = ({ type = "popular" }) => {
  const cfg = TYPES[type] ?? TYPES.popular;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState("all");

  useEffect(() => {
    setLoading(true);
    cfg.fetch(page, format).then((res) => {
      setData(res);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [page, format, type]);

  const total = data?.meta?.total_record;
  const totalPages = data?.meta?.total_page;

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-5 lg:py-9 flex-1 w-full">
        {/* heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 lg:gap-4 mb-5 lg:mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-1 lg:w-1.5 h-9 lg:h-14 bg-[#EF4444] rounded-full flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={cfg.icon} className={`${cfg.iconClass} lg:text-xl`} />
                <h1 className="text-lg sm:text-xl lg:text-3xl font-black tracking-tight truncate">{cfg.title}</h1>
                {total != null && (
                  <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25 rounded-lg text-[10px] lg:text-sm font-bold flex-shrink-0">
                    {total.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-[11px] sm:text-xs lg:text-sm mt-0.5 lg:mt-1.5 truncate">{cfg.subtitle}</p>
            </div>
          </div>

          {cfg.hasFormat && (
            <div className="flex gap-1.5 lg:gap-2.5 overflow-x-auto scrollbar-hide">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFormat(f.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-lg lg:rounded-xl text-[11px] lg:text-sm font-bold border transition-all hover:cursor-pointer whitespace-nowrap ${
                    format === f.value
                      ? "bg-[#EF4444] text-white border-[#EF4444]"
                      : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-4">
            {Array(PAGE_SIZE).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-600">
            <FontAwesomeIcon icon={cfg.icon} className="text-5xl lg:text-6xl opacity-40" />
            <p className="text-sm lg:text-base text-zinc-500">Tidak ada judul di halaman ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-4">
            {data.data.map((m) => <Card key={m.manga_id} manga={m} />)}
          </div>
        )}

        {!loading && data?.data?.length > 0 && (
          <Pagination
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            hasNext={data.data.length >= PAGE_SIZE}
          />
        )}
      </main>

      <ButtonCorner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Browse;
