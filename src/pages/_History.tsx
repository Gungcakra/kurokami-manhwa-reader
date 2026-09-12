// @ts-nocheck
import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/function";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";

const History = () => {
  const [items, setItems] = useState<any[]>([]);

  const load = () => {
    const h = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
    const arr = Object.values(h).sort((a: any, b: any) => (b?.ts || 0) - (a?.ts || 0));
    setItems(arr);
  };

  useEffect(() => {
    load();
  }, []);

  const clearAll = () => {
    localStorage.setItem("kurokami_history", "{}");
    setItems([]);
  };

  const removeOne = (mangaId: string) => {
    const h = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
    delete h[mangaId];
    localStorage.setItem("kurokami_history", JSON.stringify(h));
    load();
  };

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 py-5 flex-1 w-full">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-6 bg-[#EF4444] rounded-full" />
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-[#EF4444]" />
            <h1 className="text-xl font-bold">Riwayat Baca</h1>
            {items.length > 0 && (
              <span className="px-2.5 py-1 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 rounded-full text-xs font-semibold">
                {items.length}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all hover:cursor-pointer flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
              <span className="hidden sm:inline">Bersihkan</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-600">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-5xl opacity-40" />
            <p className="text-sm text-zinc-500">Belum ada riwayat baca</p>
            <a href="/" className="text-xs text-[#EF4444] hover:underline font-semibold">
              Mulai baca →
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((it) => (
              <div
                key={it.manga_id}
                className="group flex items-center gap-3 p-2.5 sm:p-3 bg-[#18181b] rounded-2xl border border-zinc-800/50 hover:border-[#EF4444]/30 transition-all"
              >
                <a href={`/manhwa/${it.manga_id}`} className="flex-shrink-0">
                  <img
                    src={it.cover}
                    alt={it.title}
                    loading="lazy"
                    className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <a
                    href={`/manhwa/${it.manga_id}`}
                    className="text-white text-sm font-semibold line-clamp-1 hover:text-[#EF4444] transition-colors"
                  >
                    {it.title}
                  </a>
                  <p className="text-zinc-400 text-xs mt-0.5">Chapter {it.chapter_number}</p>
                  <p className="text-zinc-600 text-[11px] mt-0.5">{timeAgo(it.ts)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={`/chapter/${it.chapter_id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                    <span className="hidden sm:inline">Lanjut</span>
                  </a>
                  <button
                    onClick={() => removeOne(it.manga_id)}
                    aria-label="Hapus dari riwayat"
                    className="p-2 rounded-xl text-zinc-500 hover:text-[#EF4444] bg-zinc-800/50 border border-zinc-700/40 hover:border-[#EF4444]/30 transition-all hover:cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ButtonCorner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default History;
