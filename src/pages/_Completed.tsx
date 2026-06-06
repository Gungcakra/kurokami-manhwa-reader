// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Pagination from "../components/ui/Pagination";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";

const PAGE_SIZE = 24;

const Completed = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    apiService.getCompleted(page, PAGE_SIZE).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto px-4 py-5 flex-1">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-green-500 rounded-full" />
          <h1 className="text-xl font-bold">Komik Tamat</h1>
          <span className="px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
            Completed
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {loading
            ? Array(PAGE_SIZE).fill(0).map((_, i) => <CardSkeleton key={i} />)
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
          <Pagination
            page={page}
            onPageChange={setPage}
            hasNext={!!data?.data?.length && data.data.length >= PAGE_SIZE}
          />
        )}
      </div>
      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Completed;
