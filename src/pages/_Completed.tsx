// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";

const Completed = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    apiService.getCompleted(page, 24).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-green-500 rounded-full" />
          <h1 className="text-xl font-bold">Komik Tamat</h1>
          <span className="px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
            Completed
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {loading
            ? Array(24)
                .fill(0)
                .map((_, i) => <CardSkeleton key={i} />)
            : data?.data?.map((manga) => (
                <Card
                  key={manga.manga_id}
                  img={manga.cover_image_url}
                  title={manga.title}
                  link={manga.manga_id}
                  chapter={manga.chapters}
                />
              ))}
        </div>
        {!loading && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm disabled:opacity-30 hover:border-green-500/50 hover:cursor-pointer transition-all"
            >
              ← Prev
            </button>
            <span className="text-zinc-400 text-sm px-2">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.data?.length || data.data.length < 24}
              className="px-4 py-2 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm disabled:opacity-30 hover:border-green-500/50 hover:cursor-pointer transition-all"
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

export default Completed;
