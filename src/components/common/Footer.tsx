import logo from "../../assets/images/logos/logo.png";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Popular", href: "/popular" },
  { name: "Tamat", href: "/completed" },
  { name: "Genres", href: "/genres" },
];

const Footer = () => {
  return (
    <footer className="bg-[#111116] border-t border-zinc-800/50 mt-auto w-full">
      <div className="max-w-screen-2xl mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="/" className="flex items-center gap-2.5 mb-3">
              <img src={logo.src} className="w-7 h-7" alt="Kurokami Logo" />
              <span className="text-lg font-bold text-white">
                Kuro<span className="text-[#e63946]">kami</span>
              </span>
            </a>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Baca manga, manhwa, dan manhua gratis. Kami tidak menyimpan file
              apapun — semua konten di-host oleh layanan pihak ketiga.
            </p>
          </div>

          {/* Nav + Info links — side by side on mobile */}
          <div className="flex gap-8 sm:gap-16 md:contents">

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Navigasi
            </p>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-zinc-500 text-sm hover:text-[#e63946] transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Info
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="/genres" className="text-zinc-500 text-sm hover:text-[#e63946] transition-colors duration-200">
                  Daftar Genre
                </a>
              </li>
              <li>
                <a href="/popular" className="text-zinc-500 text-sm hover:text-[#e63946] transition-colors duration-200">
                  Terpopuler
                </a>
              </li>
              <li>
                <a href="/completed" className="text-zinc-500 text-sm hover:text-[#e63946] transition-colors duration-200">
                  Komik Tamat
                </a>
              </li>
              <li>
                <span className="text-zinc-600 text-sm cursor-default">Disclaimers</span>
              </li>
            </ul>
          </div>

          </div>{/* end mobile row wrapper */}
        </div>

        <hr className="my-6 md:my-8 border-zinc-800/50" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-600">
            © 2025{" "}
            <a href="/" className="text-zinc-500 hover:text-white transition-colors">
              Kurokami™
            </a>
            . All Rights Reserved.
          </span>
          <a
            href="https://github.com/gungcakra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
