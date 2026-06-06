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

const Home = () => {
  const [trending, setTrending] = useState(null);
  const [mainList, setMainList] = useState(null);
  const [popular, setPopular] = useState(null);
  const [genres, setGenres] = useState([]);
  const [activeFormat, setActiveFormat] = useState("all");
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    apiService.getTop(1, 14).then((data) => {
      setTrending(data);
      setLoadingTrending(false);
    });
    apiService.getPopular(1, 10).then((data) => {
      setPopular(data);
      setLoadingPopular(false);
    });
    apiService.getGenres().then((data) => {
      setGenres(data?.data || []);
      setLoadingGenres(false);
    });
  }, []);

  useEffect(() => {
    setLoadingMain(true);
    apiService.getNewUpdate(1, 30, activeFormat).then((data) => {
      setMainList(data);
      setLoadingMain(false);
    });
  }, [activeFormat]);

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      <Navbar />

      {/* Trending */}
      <section className="px-4 pt-5 pb-3 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
            <h2 className="text-base font-bold">Trending</h2>
          </div>
          <a href="/explore" className="text-xs text-zinc-500 hover:text-[#e63946] transition-colors flex items-center gap-1">
            Lihat semua <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </a>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {loadingTrending
            ? Array(8).fill(0).map((_, i) => <CardSliderSkeleton key={i} />)
            : trending?.data?.map((manga) => (
                <CardSlider
                  key={manga.manga_id}
                  img={manga.cover_portrait_url || manga.cover_image_url}
                  title={manga.title}
                  link={manga.manga_id}
                  rating={manga.user_rate ? String(manga.user_rate).substring(0, 3) : null}
                />
              ))}
        </div>
      </section>

      {/* Main + Sidebar */}
      <div className="flex gap-4 px-4 pb-8 max-w-screen-2xl mx-auto w-full flex-1">
        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <FontAwesomeIcon icon={faNewspaper} className="text-[#e63946] text-sm" />
              <h2 className="text-base font-bold">Update Terbaru</h2>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide gap-0.5 bg-[#18181b] rounded-xl p-1 border border-zinc-800/50">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFormat(f.value)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:cursor-pointer whitespace-nowrap ${
                    activeFormat === f.value ? "bg-[#e63946] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
            {loadingMain
              ? Array(24).fill(0).map((_, i) => <CardSkeleton key={i} />)
              : mainList?.data?.map((manga) => (
                  <Card
                    key={manga.manga_id}
                    img={manga.cover_image_url}
                    title={manga.title}
                    link={manga.manga_id}
                    chapter={manga.chapters}
                  />
                ))}
          </div>

          {/* Mobile: Popular */}
          <div className="lg:hidden mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} className="text-orange-400 text-sm" />
                <h3 className="text-sm font-bold">Terpopuler</h3>
              </div>
              <a href="/popular" className="text-xs text-zinc-500 hover:text-[#e63946] transition-colors flex items-center gap-1">
                Semua <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </a>
            </div>
            <div className="bg-[#18181b] rounded-xl border border-zinc-800/50 overflow-hidden">
              {loadingPopular
                ? Array(5).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
                : popular?.data?.slice(0, 6).map((manga, i) => (
                    <ListCard
                      key={manga.manga_id}
                      index={i}
                      img={manga.cover_image_url}
                      title={manga.title}
                      link={manga.manga_id}
                      chapter={manga.chapters}
                    />
                  ))}
            </div>
          </div>

          {/* Mobile: Genres */}
          <div className="lg:hidden mt-6 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faCompass} className="text-[#e63946] text-sm" />
              <h3 className="text-sm font-bold">Genre</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {loadingGenres
                ? Array(8).fill(0).map((_, i) => <div key={i} className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />)
                : genres.slice(0, 16).map((genre) => (
                    <a
                      key={genre.genre_id || genre.slug}
                      href={`/explore?genre=${genre.slug}`}
                      className="text-xs px-2.5 py-1 bg-zinc-800/70 rounded-full text-zinc-400 hover:bg-[#e63946] hover:text-white transition-all duration-200"
                    >
                      {genre.name}
                    </a>
                  ))}
              <a href="/genres" className="text-xs px-2.5 py-1 bg-[#e63946]/10 text-[#e63946] rounded-full border border-[#e63946]/30 hover:bg-[#e63946] hover:text-white transition-all duration-200">
                Semua →
              </a>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-4">
          <div className="bg-[#18181b] rounded-xl overflow-hidden border border-zinc-800/50">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} className="text-orange-400 text-sm" />
                <h3 className="text-sm font-bold">Terpopuler</h3>
              </div>
              <a href="/popular" className="text-[10px] text-zinc-500 hover:text-[#e63946] transition-colors flex items-center gap-0.5">
                Semua <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
              </a>
            </div>
            {loadingPopular
              ? Array(6).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
              : popular?.data?.slice(0, 10).map((manga, i) => (
                  <ListCard
                    key={manga.manga_id}
                    index={i}
                    img={manga.cover_image_url}
                    title={manga.title}
                    link={manga.manga_id}
                    chapter={manga.chapters}
                  />
                ))}
          </div>

          <div className="bg-[#18181b] rounded-xl overflow-hidden border border-zinc-800/50">
            <div className="flex items-center gap-2 p-3 border-b border-zinc-800/50">
              <FontAwesomeIcon icon={faCompass} className="text-[#e63946] text-sm" />
              <h3 className="text-sm font-bold">Genre</h3>
            </div>
            <div className="p-3 flex flex-wrap gap-1.5">
              {loadingGenres
                ? Array(10).fill(0).map((_, i) => <div key={i} className="h-6 w-14 bg-zinc-800 rounded-full animate-pulse" />)
                : genres.slice(0, 20).map((genre) => (
                    <a
                      key={genre.genre_id || genre.slug}
                      href={`/explore?genre=${genre.slug}`}
                      className="text-[10px] px-2.5 py-1 bg-zinc-800/70 rounded-full text-zinc-400 hover:bg-[#e63946] hover:text-white transition-all duration-200"
                    >
                      {genre.name}
                    </a>
                  ))}
              <a href="/genres" className="text-[10px] px-2.5 py-1 bg-[#e63946]/10 text-[#e63946] rounded-full border border-[#e63946]/30 hover:bg-[#e63946] hover:text-white transition-all duration-200">
                Semua Genre →
              </a>
            </div>
          </div>
        </aside>
      </div>

      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Home;
