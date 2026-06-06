// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";
import CardSkeleton from "../components/ui/CardSkeleton";
import ListCardSkeleton from "../components/ui/ListCardSkeleton";
import CardSlider from "../components/ui/CardSlider";
import CardSliderSkeleton from "../components/ui/CardSliderSkeleton";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faStar,
  faNewspaper,
  faCompass,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const FORMATS = [
  { label: "Semua", value: "all" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manga", value: "manga" },
  { label: "Manhua", value: "manhua" },
];

/* shared header used across sidebar panels and main sections */
const SectionHeader = ({ icon, iconClass = "text-[#e63946]", title, href, hrefLabel }: any) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/50 bg-zinc-900/40">
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className={`${iconClass} text-sm`} />
      <h3 className="font-bold text-sm">{title}</h3>
    </div>
    {href && (
      <a href={href}
        className="text-[10px] text-zinc-500 hover:text-[#e63946] transition-colors flex items-center gap-0.5 font-medium">
        {hrefLabel ?? "Semua"} <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
      </a>
    )}
  </div>
);

const Home = () => {
  const [trending,      setTrending]      = useState(null);
  const [mainList,      setMainList]      = useState(null);
  const [popular,       setPopular]       = useState(null);
  const [genres,        setGenres]        = useState([]);
  const [activeFormat,  setActiveFormat]  = useState("all");
  const [loadingTrend,  setLoadingTrend]  = useState(true);
  const [loadingMain,   setLoadingMain]   = useState(true);
  const [loadingPop,    setLoadingPop]    = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    apiService.getTop(1, 14).then((d) => { setTrending(d); setLoadingTrend(false); });
    apiService.getPopular(1, 10).then((d) => { setPopular(d); setLoadingPop(false); });
    apiService.getGenres().then((d) => { setGenres(d?.data || []); setLoadingGenres(false); });
  }, []);

  useEffect(() => {
    setLoadingMain(true);
    apiService.getNewUpdate(1, 30, activeFormat).then((d) => { setMainList(d); setLoadingMain(false); });
  }, [activeFormat]);

  const GenrePills = ({ limit, size }: { limit: number; size: "sm" | "xs" }) =>
    loadingGenres ? (
      Array(8).fill(0).map((_, i) => (
        <div key={i} className={`${size === "xs" ? "h-5 w-12" : "h-6 w-16"} bg-zinc-800/60 rounded-full animate-pulse`} />
      ))
    ) : (
      <>
        {genres.slice(0, limit).map((g) => (
          <a key={g.genre_id || g.slug} href={`/explore?genre=${g.slug}`}
            className={`${size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"} bg-zinc-800/70 hover:bg-[#e63946]/15 hover:text-[#e63946] hover:border-[#e63946]/30 text-zinc-400 border border-zinc-700/40 rounded-full transition-all duration-200`}>
            {g.name}
          </a>
        ))}
        <a href="/genres"
          className={`${size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"} bg-[#e63946]/10 text-[#e63946] border border-[#e63946]/25 rounded-full hover:bg-[#e63946] hover:text-white transition-all duration-200`}>
          Semua →
        </a>
      </>
    );

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto px-4 pt-5 pb-8 w-full flex-1 flex flex-col gap-4">

        {/* ── Trending ── */}
        <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
          <SectionHeader icon={faStar} iconClass="text-yellow-400" title="Trending"
            href="/explore" hrefLabel="Lihat semua" />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide p-3.5 pb-4">
            {loadingTrend
              ? Array(8).fill(0).map((_, i) => <CardSliderSkeleton key={i} />)
              : trending?.data?.map((m) => (
                  <CardSlider key={m.manga_id}
                    img={m.cover_portrait_url || m.cover_image_url}
                    title={m.title} link={m.manga_id}
                    rating={m.user_rate ? String(m.user_rate).slice(0, 3) : null} />
                ))}
          </div>
        </div>

        {/* ── Main content + Sidebar ── */}
        <div className="flex gap-4 items-start">

          {/* Main */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Update Terbaru */}
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 border-b border-zinc-800/50 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faNewspaper} className="text-[#e63946] text-sm" />
                  <h2 className="font-bold text-sm">Update Terbaru</h2>
                </div>
                <div className="flex gap-1">
                  {FORMATS.map((f) => (
                    <button key={f.value} onClick={() => setActiveFormat(f.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:cursor-pointer ${
                        activeFormat === f.value
                          ? "bg-[#e63946]/15 text-[#e63946] border-[#e63946]/30"
                          : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white"
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 p-3.5">
                {loadingMain
                  ? Array(24).fill(0).map((_, i) => <CardSkeleton key={i} />)
                  : mainList?.data?.map((m) => (
                      <Card key={m.manga_id} img={m.cover_image_url}
                        title={m.title} link={m.manga_id} chapter={m.chapters} />
                    ))}
              </div>
            </div>

            {/* Mobile-only: Popular */}
            <div className="lg:hidden bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
              <SectionHeader icon={faFire} iconClass="text-orange-400" title="Terpopuler"
                href="/popular" />
              {loadingPop
                ? Array(5).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
                : popular?.data?.slice(0, 6).map((m, i) => (
                    <ListCard key={m.manga_id} index={i} img={m.cover_image_url}
                      title={m.title} link={m.manga_id} chapter={m.chapters} />
                  ))}
            </div>

            {/* Mobile-only: Genre */}
            <div className="lg:hidden bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
              <SectionHeader icon={faCompass} title="Genre" href="/genres" hrefLabel="Semua genre" />
              <div className="flex flex-wrap gap-1.5 p-3.5">
                <GenrePills limit={18} size="xs" />
              </div>
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-4">

            {/* Popular */}
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
              <SectionHeader icon={faFire} iconClass="text-orange-400" title="Terpopuler"
                href="/popular" />
              {loadingPop
                ? Array(6).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
                : popular?.data?.slice(0, 10).map((m, i) => (
                    <ListCard key={m.manga_id} index={i} img={m.cover_image_url}
                      title={m.title} link={m.manga_id} chapter={m.chapters} />
                  ))}
            </div>

            {/* Genre */}
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800/50 overflow-hidden">
              <SectionHeader icon={faCompass} title="Genre" href="/genres" hrefLabel="Semua" />
              <div className="flex flex-wrap gap-1.5 p-3.5">
                <GenrePills limit={20} size="xs" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Home;
