// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
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
    <div className="bg-[#09090b] text-white min-h-screen">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 py-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-[#e63946] rounded-full" />
          <FontAwesomeIcon icon={faCompass} className="text-[#e63946]" />
          <h1 className="text-xl font-bold">Daftar Genre</h1>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-12 sm:h-14 bg-[#18181b] rounded-xl border border-zinc-800/40 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {genres.map((genre) => (
              <a
                key={genre.genre_id || genre.slug}
                href={`/explore?genre=${genre.slug}`}
                className="group flex items-center justify-center p-3 sm:p-4 bg-[#18181b] rounded-xl border border-zinc-800/40 hover:border-[#e63946]/40 hover:bg-[#e63946]/10 hover:text-[#e63946] text-zinc-300 transition-all duration-200 text-center font-medium text-sm"
              >
                {genre.name}
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Genres;
