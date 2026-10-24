// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { getAuth } from "../utils/auth";
import { timeAgo } from "../utils/function";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";

const History = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loggedIn] = useState(() => !!getAuth());

  const loadLocal = () => {
    const h = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
    const arr = Object.values(h).sort((a: any, b: any) => (b?.ts || 0) - (a?.ts || 0));
    setItems(arr);
  };

  // Signed in: history lives on the account. The manga list has no read
  // position, so for each manga we pull its newest chapter-history entry
  // (data[0]) to drive the "Lanjut Ch.N" button.
  const loadServer = async () => {
    const r = await apiService.getHistory();
    const mangas = r?.data ?? [];
    const rows = await Promise.all(
      mangas.map(async (m: any) => {
        let last: any = null;
        try {
          const c = await apiService.getHistoryChapters(m.manga_id);
          last = (c?.data ?? [])[0] ?? null;
        } catch {/* leave last null; row still links to the manga */}
        return {
          manga_id: m.manga_id,
          title: m.title,
          cover: m.cover_portrait_url || m.cover_image_url,
          chapter_id: last?.chapter_id,
          chapter_number: last?.chapter_number,
          ts: Date.parse(last?.updated_at || m.updated_at) || 0,
        };
      })
    );
    rows.sort((a, b) => b.ts - a.ts);
    setItems(rows);
  };

  useEffect(() => {
    if (getAuth()) {
      loadServer().catch(() => loadLocal()); // token expired/offline → local
    } else {
      loadLocal();
    }
  }, []);

  const clearAll = () => {
    if (!loggedIn) {
      localStorage.setItem("kurokami_history", "{}");
      setItems([]);
      return;
    }
    // Empty list = clear all on the server (mirrors the upstream web button).
    const prev = items;
    setItems([]);
    apiService.removeHistory().catch(() => setItems(prev));
  };

  // Guests only. The server has no per-manga removal (a populated manga_id_list
  // still clears everything), so signed-in rows hide the per-item delete.
  const removeOne = (mangaId: string) => {
    const h = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
    delete h[mangaId];
    localStorage.setItem("kurokami_history", JSON.stringify(h));
    loadLocal();
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-5 lg:py-9 flex-1 w-full">
        <div className="flex items-center justify-between gap-2 mb-5 lg:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="accent-bar w-1 lg:w-1.5 h-6 lg:h-9 rounded-full" />
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-[#EF4444] lg:text-xl" />
            <h1 className="text-xl lg:text-3xl font-black tracking-tight">Riwayat Baca</h1>
            {items.length > 0 && (
              <span className="px-2.5 py-1 lg:px-3.5 lg:py-1.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 rounded-full text-xs lg:text-sm font-semibold">
                {items.length}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all hover:cursor-pointer flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
              <span className="hidden sm:inline">Bersihkan</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-600">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-5xl lg:text-6xl opacity-40" />
            <p className="text-sm text-zinc-500">Belum ada riwayat baca</p>
            <a href="/" className="text-xs text-[#EF4444] hover:underline font-semibold">
              Mulai baca →
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 lg:gap-3.5">
            {items.map((it) => (
              <div
                key={it.manga_id}
                className="group flex items-center gap-3 lg:gap-5 p-2.5 sm:p-3 lg:p-4 bg-[#111111] rounded-2xl border border-[#1c1c1c] hover:border-[#EF4444]/30 transition-all"
              >
                <a href={`/manhwa/${it.manga_id}`} className="flex-shrink-0">
                  <img
                    src={it.cover}
                    alt={it.title}
                    loading="lazy"
                    className="w-12 h-16 sm:w-14 sm:h-20 lg:w-[84px] lg:h-28 rounded-lg lg:rounded-xl object-cover"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <a
                    href={`/manhwa/${it.manga_id}`}
                    className="text-white text-sm lg:text-lg font-semibold line-clamp-1 hover:text-[#EF4444] transition-colors"
                  >
                    {it.title}
                  </a>
                  {it.chapter_number != null && (
                    <p className="text-zinc-400 text-xs lg:text-sm mt-0.5 lg:mt-1.5">Chapter {it.chapter_number}</p>
                  )}
                  <p className="text-zinc-600 text-[11px] lg:text-xs mt-0.5 lg:mt-1">{timeAgo(it.ts)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={it.chapter_id ? `/chapter/${it.chapter_id}` : `/manhwa/${it.manga_id}`}
                    className="flex items-center gap-1.5 lg:gap-2 px-3 py-2 lg:px-6 lg:py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-xs lg:text-sm font-bold transition-all"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                    <span className="hidden sm:inline">Lanjut</span>
                  </a>
                  {!loggedIn && (
                    <button
                      onClick={() => removeOne(it.manga_id)}
                      aria-label="Hapus dari riwayat"
                      className="p-2 lg:p-3.5 rounded-xl text-zinc-500 hover:text-[#EF4444] bg-zinc-800/50 border border-zinc-700/40 hover:border-[#EF4444]/30 transition-all hover:cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  )}
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
