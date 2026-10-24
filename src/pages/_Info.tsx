// @ts-nocheck
import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faShieldHalved,
  faUsers,
  faHeart,
  faChevronDown,
  faBookmark,
  faClockRotateLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const CARDS = [
  {
    id: "mission",
    icon: faCircleInfo,
    title: "Tentang Kurokami",
    body: [
      "Kurokami adalah pembaca manhwa, manga, dan manhua berbasis web — cepat, gratis, dan tanpa iklan yang mengganggu.",
      "Semua judul dimuat langsung dari penyedia pihak ketiga. Kami tidak meng-host, menyimpan, atau mendistribusikan file gambar apa pun di server sendiri.",
    ],
  },
  {
    id: "privacy",
    icon: faShieldHalved,
    title: "Data & Privasi",
    body: [
      "Kurokami tidak memiliki sistem akun dan tidak mengirim data kamu ke mana pun.",
      "Bookmark, riwayat baca, dan tanda chapter yang sudah dibaca semuanya disimpan di localStorage browser kamu sendiri. Membersihkan data situs akan menghapusnya secara permanen.",
    ],
  },
  {
    id: "rules",
    icon: faUsers,
    title: "Aturan Komunitas",
    body: [
      "Dukung penulis dan penerbit aslinya bila judul yang kamu baca sudah tersedia resmi di wilayahmu.",
      "Jangan menjual ulang, membingkai ulang, atau mengklaim konten dari situs ini sebagai milikmu.",
    ],
  },
  {
    id: "support",
    icon: faHeart,
    title: "Dukung Pengembang",
    body: [
      "Kurokami dikembangkan sebagai proyek pribadi dan open-source.",
      "Cara terbaik untuk mendukung: laporkan bug, sarankan fitur, atau bagikan ke sesama pembaca.",
    ],
  },
];

const Info = () => {
  const [open, setOpen] = useState("mission");
  const [stats, setStats] = useState({ bookmarks: 0, history: 0, read: 0 });

  const readStats = () => {
    try {
      const bm = JSON.parse(localStorage.getItem("kurokami_bookmarks") || "[]");
      const hi = JSON.parse(localStorage.getItem("kurokami_history") || "{}");
      const rd = JSON.parse(localStorage.getItem("kurokami_read_chapters") || "{}");
      setStats({
        bookmarks: Array.isArray(bm) ? bm.length : 0,
        history: Object.keys(hi).length,
        read: Object.keys(rd).length,
      });
    } catch {
      /* localStorage unavailable */
    }
  };

  useEffect(readStats, []);

  const wipe = () => {
    if (!confirm("Hapus semua bookmark, riwayat, dan tanda chapter dibaca?")) return;
    ["kurokami_bookmarks", "kurokami_history", "kurokami_read_chapters"].forEach((k) =>
      localStorage.removeItem(k)
    );
    Object.keys(localStorage)
      .filter((k) => k.startsWith("kurokami_last_read_"))
      .forEach((k) => localStorage.removeItem(k));
    readStats();
  };

  const STAT_TILES = [
    { label: "Bookmark", value: stats.bookmarks, icon: faBookmark, href: "/bookmark" },
    { label: "Riwayat", value: stats.history, icon: faClockRotateLeft, href: "/history" },
    { label: "Chapter dibaca", value: stats.read, icon: faCircleInfo },
  ];

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col pb-[58px] lg:pb-0">
      <Navbar />

      <main className="max-w-3xl lg:max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-11 flex-1 w-full flex flex-col gap-6 lg:gap-9">
        {/* header */}
        <div className="flex items-center gap-3">
          <span className="w-1 lg:w-1.5 h-9 lg:h-12 bg-[#EF4444] rounded-full flex-shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl lg:text-3xl font-black tracking-tight">Info</h1>
            <p className="text-zinc-500 text-[11px] sm:text-xs lg:text-sm mt-0.5 lg:mt-1.5">
              Tentang aplikasi, data kamu, dan cara mendukung
            </p>
          </div>
          <span className="ml-auto px-2.5 py-1 lg:px-3.5 lg:py-1.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25 rounded-lg text-[10px] lg:text-xs font-black">
            v1.0.1
          </span>
        </div>

        {/* local stats */}
        <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
          {STAT_TILES.map((s) => {
            const Tag = s.href ? "a" : "div";
            return (
              <Tag
                key={s.label}
                href={s.href}
                className={`flex flex-col items-center gap-1 lg:gap-2 p-3 sm:p-4 lg:p-6 bg-[#0c0c0c] rounded-xl lg:rounded-2xl border border-[#1c1c1c] transition-all ${
                  s.href ? "hover:border-[#EF4444]/40" : ""
                }`}
              >
                <FontAwesomeIcon icon={s.icon} className="text-[#EF4444] text-sm lg:text-xl" />
                <span className="text-lg sm:text-xl lg:text-3xl font-black leading-none">{s.value}</span>
                <span className="text-[10px] lg:text-sm text-zinc-500 text-center leading-tight">{s.label}</span>
              </Tag>
            );
          })}
        </div>

        {/* accordions */}
        <div className="flex flex-col gap-2.5 lg:gap-3.5">
          {CARDS.map((c) => {
            const isOpen = open === c.id;
            return (
              <div
                key={c.id}
                className={`bg-[#0c0c0c] rounded-xl border overflow-hidden transition-colors ${
                  isOpen ? "border-[#EF4444]/40" : "border-[#1c1c1c]"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  className="w-full flex items-center gap-3 lg:gap-4 px-4 py-3.5 lg:px-6 lg:py-5 text-left hover:bg-white/[0.03] transition-colors hover:cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={c.icon}
                    className={`text-sm lg:text-lg flex-shrink-0 ${isOpen ? "text-[#EF4444]" : "text-zinc-500"}`}
                  />
                  <span className="font-bold text-sm lg:text-lg flex-1">{c.title}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] text-zinc-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 lg:px-6 lg:pb-6 pt-0 flex flex-col gap-2 border-t border-[#1c1c1c]">
                    {c.body.map((p, i) => (
                      <p key={i} className="text-zinc-400 text-xs lg:text-base leading-relaxed pt-2 first:pt-3">
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* danger zone */}
        <div className="bg-[#0c0c0c] rounded-xl lg:rounded-2xl border border-[#1c1c1c] p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-5">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm lg:text-lg">Hapus data lokal</p>
            <p className="text-zinc-500 text-[11px] lg:text-sm mt-0.5 lg:mt-1.5 leading-relaxed">
              Menghapus semua bookmark, riwayat, dan tanda chapter dibaca dari browser ini.
            </p>
          </div>
          <button
            onClick={wipe}
            className="flex items-center justify-center gap-2 px-4 py-2.5 lg:px-6 lg:py-3.5 rounded-xl text-xs lg:text-sm font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444] hover:text-white transition-all hover:cursor-pointer flex-shrink-0"
          >
            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
            Hapus semua
          </button>
        </div>

        <p className="text-center text-[10px] lg:text-xs text-zinc-600 leading-relaxed">
          Kurokami tidak meng-host file media apa pun. Seluruh konten disediakan oleh layanan pihak
          ketiga.
        </p>
      </main>

      <ButtonCorner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Info;
