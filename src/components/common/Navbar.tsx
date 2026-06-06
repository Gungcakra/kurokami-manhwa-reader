// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../utils/api";
import logo from "../../assets/images/logos/logo.png";

const NAV_LINKS = [
  { name: "Home", link: "/" },
  { name: "Explore", link: "/explore" },
  { name: "Popular", link: "/popular" },
  { name: "Tamat", link: "/completed" },
  { name: "Genres", link: "/genres" },
];

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await apiService.searchManga(value, 1, 6);
      setResults(data?.data || []);
    }, 350);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={logo.src} className="w-7 h-7" alt="Kurokami Logo" />
            <span className="text-lg font-bold text-white tracking-tight">
              Kuro<span className="text-[#e63946]">kami</span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === item.link
                      ? "text-[#e63946] bg-[#e63946]/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setResults([]);
                setQuery("");
              }}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="border-t border-zinc-800/50 px-4 py-3 bg-[#09090b]/95">
            <div ref={searchRef} className="relative max-w-2xl mx-auto">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"
              />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari judul manhwa, manga, manhua..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#18181b] border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e63946]/50"
              />
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {results.map((item) => (
                    <a
                      key={item.manga_id}
                      href={`/manhwa/${item.manga_id}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all border-b border-zinc-800/50 last:border-b-0"
                    >
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {item.latest_chapter_number
                            ? `Ch. ${item.latest_chapter_number}`
                            : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                  <a
                    href={`/explore?q=${encodeURIComponent(query)}`}
                    className="block px-3 py-2.5 text-center text-xs text-[#e63946] hover:bg-white/5 transition-all font-medium"
                  >
                    Lihat semua hasil untuk "{query}" →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-[#111116] border-r border-zinc-800/50 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <a href="/" className="flex items-center gap-2">
                <img src={logo.src} className="w-7 h-7" alt="Logo" />
                <span className="text-lg font-bold text-white">
                  Kuro<span className="text-[#e63946]">kami</span>
                </span>
              </a>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <li key={item.link}>
                  <a
                    href={item.link}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      currentPath === item.link
                        ? "text-[#e63946] bg-[#e63946]/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
