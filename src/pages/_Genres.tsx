// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getGenres().then((data) => {
      setGenres(data?.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-[#09090b] text-white min-h-screen pb-[58px] lg:pb-0">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-5 lg:py-9">
        <div className="flex items-center gap-2.5 lg:gap-3.5 mb-5 lg:mb-8">
          <div className="w-1 lg:w-1.5 h-6 lg:h-10 bg-[#EF4444] rounded-full" />
          <FontAwesomeIcon icon={faCompass} className="text-[#EF4444] lg:text-2xl" />
          <h1 className="text-xl lg:text-3xl font-black tracking-tight">Daftar Genre</h1>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-12 sm:h-14 lg:h-20 bg-[#18181b] rounded-xl lg:rounded-2xl border border-zinc-800/40 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {genres.map((genre) => (
              <a
                key={genre.genre_id || genre.slug}
                href={`/explore?genre=${genre.slug}`}
                className="group flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-[#18181b] rounded-xl lg:rounded-2xl border border-zinc-800/40 hover:border-[#EF4444]/40 hover:bg-[#EF4444]/10 hover:text-[#EF4444] text-zinc-300 transition-all duration-200 text-center font-medium text-sm lg:text-base"
              >
                {genre.name}
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Genres;
