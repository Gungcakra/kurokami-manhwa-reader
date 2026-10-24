// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { getAuth } from "../utils/auth";
import Card from "../components/ui/Card";
import CardSkeleton from "../components/ui/CardSkeleton";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faTrash } from "@fortawesome/free-solid-svg-icons";

const Bookmark = () => {
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [loggedIn] = useState(() => !!getAuth());

  useEffect(() => {
    // Signed in: the account list already carries full manga objects, so no
    // per-id detail lookups. Also refresh the local mirror other pages read.
    if (getAuth()) {
      apiService
        .getBookmarks()
        .then((r) => {
          const data = r?.data ?? [];
          setItems(data);
          setIds(data.map((m: any) => m.manga_id));
          localStorage.setItem(
            "kurokami_bookmarks",
            JSON.stringify(data.map((m: any) => m.manga_id))
          );
        })
        .catch(() => {/* fall through to whatever is cached locally */})
        .finally(() => setLoading(false));
      return;
    }

    // Guest: ids live in localStorage, hydrate each via detail.
    const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
    setIds(bm);
    if (bm.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(
      bm.map((id: string) =>
        apiService.getDetail(id).then((r) => (r?.data ? { ...r.data, manga_id: id } : null))
      )
    ).then((res) => {
      setItems(res.filter(Boolean));
      setLoading(false);
    });
  }, []);

  const clearAll = () => {
    // Remove every bookmark from the account too when signed in.
    if (loggedIn) {
      ids.forEach((id) => apiService.removeBookmark(id).catch(() => {}));
    }
    localStorage.setItem("kurokami_bookmarks", "[]");
    setIds([]);
    setItems([]);
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-5 lg:py-9 flex-1 w-full">
        <div className="flex items-center justify-between gap-2 mb-5 lg:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="accent-bar w-1 lg:w-1.5 h-6 lg:h-9 rounded-full" />
            <FontAwesomeIcon icon={faBookmark} className="text-[#EF4444] lg:text-xl" />
            <h1 className="text-xl lg:text-3xl font-black tracking-tight">Bookmark</h1>
            {ids.length > 0 && (
              <span className="px-2.5 py-1 lg:px-3.5 lg:py-1.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 rounded-full text-xs lg:text-sm font-semibold">
                {ids.length}
              </span>
            )}
          </div>
          {ids.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-xl text-xs lg:text-sm font-semibold bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all hover:cursor-pointer flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
              <span className="hidden sm:inline">Hapus semua</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 lg:gap-4">
            {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-600">
            <FontAwesomeIcon icon={faBookmark} className="text-5xl lg:text-6xl opacity-40" />
            <p className="text-sm text-zinc-500">Belum ada bookmark tersimpan</p>
            <a href="/explore" className="text-xs text-[#EF4444] hover:underline font-semibold">
              Jelajahi manga →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 lg:gap-4">
            {items.map((m) => (
              <Card key={m.manga_id} manga={m} />
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

export default Bookmark;
