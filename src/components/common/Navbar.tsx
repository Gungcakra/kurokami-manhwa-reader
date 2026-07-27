// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBars,
  faTimes,
  faHouse,
  faCompass,
  faFire,
  faStar,
  faCircleCheck,
  faBookmark,
  faClockRotateLeft,
  faTags,
  faCircleInfo,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../utils/api";
import { formatCount } from "../../utils/function";
import CountryBadge from "../ui/CountryBadge";
import logo from "../../assets/images/logos/logo.png";

/** Primary nav — inline on desktop, listed in the drawer on mobile. */
const MAIN_LINKS = [
  { name: "Home", link: "/", icon: faHouse },
  { name: "Explore", link: "/explore", icon: faCompass },
  { name: "Populer", link: "/popular", icon: faFire },
  { name: "Top", link: "/top", icon: faStar },
  { name: "Tamat", link: "/completed", icon: faCircleCheck },
  { name: "Genre", link: "/genres", icon: faTags },
];

/** Personal/library links — icon buttons on desktop, listed in the drawer. */
const LIB_LINKS = [
  { name: "Bookmark", link: "/bookmark", icon: faBookmark },
  { name: "Riwayat", link: "/history", icon: faClockRotateLeft },
  { name: "Info", link: "/info", icon: faCircleInfo },
];

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [path, setPath] = useState("");

  const debounceRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => setPath(window.location.pathname), []);

  // debounced live search (500ms, matching the app's other filter inputs)
  const handleSearch = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await apiService.searchManga(value.trim(), 1, 6);
      setResults(data?.data ?? []);
      setSearching(false);
    }, 500);
  };

  // close the results dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Ctrl/Cmd+K focuses search, Escape closes overlays
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setResults([]);
        setShowSearch(false);
        setShowDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) window.location.href = `/explore?q=${encodeURIComponent(query.trim())}`;
  };

  const isActive = (link) => (link === "/" ? path === "/" : path.startsWith(link));

  const SearchResults = () =>
    query.trim().length >= 2 && (searching || results.length > 0) ? (
      <div className="absolute top-full left-0 right-0 mt-2 bg-[#141417] border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
        {searching ? (
          <div className="flex items-center justify-center gap-2 py-6 text-zinc-500 text-xs">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            Mencari…
          </div>
        ) : (
          <>
            {results.map((item) => (
              <a
                key={item.manga_id}
                href={`/manhwa/${item.manga_id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#EF4444]/10 transition-colors border-b border-zinc-800/60 last:border-b-0"
              >
                <img
                  src={item.cover_image_url}
                  alt=""
                  loading="lazy"
                  className="w-9 h-12 rounded-md object-cover flex-shrink-0 bg-zinc-900"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                    {item.latest_chapter_number != null && (
                      <span className="text-[#EF4444] font-bold">Ch {item.latest_chapter_number}</span>
                    )}
                    {item.view_count > 0 && <span>{formatCount(item.view_count)}</span>}
                    <CountryBadge code={item.country_id} />
                  </div>
                </div>
              </a>
            ))}
            <a
              href={`/explore?q=${encodeURIComponent(query.trim())}`}
              className="block px-3 py-2.5 text-center text-[11px] font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            >
              Lihat semua hasil →
            </a>
          </>
        )}
      </div>
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/60">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#EF4444]" />

        <div className="max-w-screen-2xl mx-auto flex items-center gap-3 px-3 sm:px-4 h-14">
          {/* logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo.src} className="w-7 h-7" alt="" />
            <span className="text-base sm:text-lg font-black tracking-tight">
              Kuro<span className="text-[#EF4444]">kami</span>
            </span>
          </a>

          {/* desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {MAIN_LINKS.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold transition-colors ${
                  isActive(item.link) ? "text-[#EF4444]" : "text-zinc-400 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-[11px]" />
                {item.name}
                {isActive(item.link) && (
                  <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-[#EF4444] rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* desktop search */}
          <form
            onSubmit={submit}
            ref={searchRef}
            className="relative hidden md:block flex-1 max-w-sm ml-auto"
          >
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari judul…"
              className="w-full pl-9 pr-12 py-2 bg-[#141417] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/60 transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 border border-zinc-700/60 rounded px-1 py-0.5 pointer-events-none">
              ⌘K
            </kbd>
            <SearchResults />
          </form>

          {/* actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0 flex-shrink-0">
            {LIB_LINKS.slice(0, 2).map((item) => (
              <a
                key={item.link}
                href={item.link}
                title={item.name}
                aria-label={item.name}
                className={`hidden sm:flex w-9 h-9 items-center justify-center rounded-lg transition-all ${
                  isActive(item.link)
                    ? "text-[#EF4444] bg-[#EF4444]/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm" />
              </a>
            ))}

            <button
              onClick={() => {
                setShowSearch((p) => !p);
                setResults([]);
              }}
              aria-label="Cari"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
            </button>

            <button
              onClick={() => setShowDrawer(true)}
              aria-label="Menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm" />
            </button>
          </div>
        </div>

        {/* mobile search row */}
        {showSearch && (
          <div className="md:hidden border-t border-zinc-800/60 px-3 py-2.5">
            <form onSubmit={submit} ref={searchRef} className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none"
              />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari judul manhwa, manga, manhua…"
                className="w-full pl-9 pr-3 py-2.5 bg-[#141417] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EF4444]/60"
              />
              <SearchResults />
            </form>
          </div>
        )}
      </header>

      {/* mobile drawer */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setShowDrawer(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-[#0e0e11] border-l border-zinc-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800">
              <span className="text-base font-black">
                Kuro<span className="text-[#EF4444]">kami</span>
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                aria-label="Tutup menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 hover:cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Jelajahi
                </p>
                {MAIN_LINKS.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive(item.link)
                        ? "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25"
                        : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xs w-4" />
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Koleksi
                </p>
                {LIB_LINKS.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive(item.link)
                        ? "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25"
                        : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xs w-4" />
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
