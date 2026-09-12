// @ts-nocheck
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCompass,
  faBookmark,
  faEllipsis,
  faFire,
  faStar,
  faCircleCheck,
  faTags,
  faClockRotateLeft,
  faCircleInfo,
  faBolt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Mobile primary navigation.
 *
 * Replaces the old right-hand drawer: four thumb-reachable tabs pinned to the
 * bottom of the viewport, plus a "Lainnya" sheet that slides up for the
 * secondary destinations. Hidden from `lg` up, where the Navbar carries the
 * same links inline.
 */

const TABS = [
  { name: "Beranda", link: "/", icon: faHouse },
  { name: "Jelajah", link: "/explore", icon: faCompass },
  { name: "Update", link: "/updates", icon: faBolt },
  { name: "Koleksi", link: "/bookmark", icon: faBookmark },
];

const MORE_LINKS = [
  { name: "Terpopuler", link: "/popular", icon: faFire, tone: "text-orange-400" },
  { name: "Rating Tertinggi", link: "/top", icon: faStar, tone: "text-yellow-400" },
  { name: "Komik Tamat", link: "/completed", icon: faCircleCheck, tone: "text-emerald-400" },
  { name: "Daftar Genre", link: "/genres", icon: faTags, tone: "text-sky-400" },
  { name: "Riwayat Baca", link: "/history", icon: faClockRotateLeft, tone: "text-violet-400" },
  { name: "Info & Privasi", link: "/info", icon: faCircleInfo, tone: "text-zinc-400" },
];

const BottomNav = () => {
  const [path, setPath] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => setPath(window.location.pathname), []);

  // lock background scroll while the sheet is up
  useEffect(() => {
    document.body.style.overflow = showMore ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMore]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowMore(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (link) => (link === "/" ? path === "/" : path.startsWith(link));
  const moreActive = MORE_LINKS.some((l) => isActive(l.link));

  return (
    <>
      {/* ── bottom sheet ── */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden transition-opacity duration-300 ${
          showMore ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMore(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu lainnya"
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 inset-x-0 bg-[#111116] border-t border-zinc-800 rounded-t-3xl shadow-2xl shadow-black/80 transition-transform duration-300 ease-out ${
            showMore ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          {/* grab handle */}
          <div className="flex justify-center pt-3 pb-1">
            <span className="w-10 h-1 rounded-full bg-zinc-700" />
          </div>

          <div className="flex items-center justify-between px-5 pt-1 pb-3">
            <p className="text-sm font-black tracking-tight">
              Jelajahi <span className="text-[#EF4444]">Kurokami</span>
            </p>
            <button
              onClick={() => setShowMore(false)}
              aria-label="Tutup menu"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 pb-2">
            {MORE_LINKS.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl border text-[12px] font-semibold transition-all active:scale-[0.97] ${
                  isActive(item.link)
                    ? "bg-[#EF4444]/12 border-[#EF4444]/30 text-[#EF4444]"
                    : "bg-white/[0.03] border-zinc-800/70 text-zinc-300"
                }`}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0 ${
                    isActive(item.link) ? "text-[#EF4444]" : item.tone
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-[11px]" />
                </span>
                {/* wraps rather than truncating — "Rating Tertinggi" does not fit
                    on one line in a half-width tile on a 390px phone */}
                <span className="leading-tight">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── tab bar ── */}
      <nav
        aria-label="Navigasi utama"
        className="fixed bottom-0 inset-x-0 z-[60] lg:hidden bg-[#0b0b0e]/[0.97] backdrop-blur-2xl border-t border-zinc-800/70 shadow-[0_-8px_24px_rgba(0,0,0,0.55)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-[58px]">
          {TABS.map((item) => {
            const active = isActive(item.link);
            return (
              <a
                key={item.link}
                href={item.link}
                aria-current={active ? "page" : undefined}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                {active && (
                  <span className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[#EF4444]" />
                )}
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`text-[15px] transition-colors ${
                    active ? "text-[#EF4444]" : "text-zinc-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold tracking-tight transition-colors ${
                    active ? "text-[#EF4444]" : "text-zinc-500"
                  }`}
                >
                  {item.name}
                </span>
              </a>
            );
          })}

          <button
            onClick={() => setShowMore((p) => !p)}
            aria-label="Menu lainnya"
            aria-expanded={showMore}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            {(moreActive || showMore) && (
              <span className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[#EF4444]" />
            )}
            <FontAwesomeIcon
              icon={faEllipsis}
              className={`text-[15px] transition-colors ${
                moreActive || showMore ? "text-[#EF4444]" : "text-zinc-500"
              }`}
            />
            <span
              className={`text-[10px] font-bold tracking-tight transition-colors ${
                moreActive || showMore ? "text-[#EF4444]" : "text-zinc-500"
              }`}
            >
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
