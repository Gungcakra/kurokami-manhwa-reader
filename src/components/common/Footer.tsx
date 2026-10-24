import logo from "../../assets/images/logos/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Terpopuler", href: "/popular" },
  { name: "Rating Tertinggi", href: "/top" },
  { name: "Update Terbaru", href: "/updates" },
  { name: "Komik Tamat", href: "/completed" },
];

const INFO_LINKS = [
  { name: "Daftar Genre", href: "/genres" },
  { name: "Bookmark", href: "/bookmark" },
  { name: "Riwayat Baca", href: "/history" },
  { name: "Info & Privasi", href: "/info" },
];

const Footer = () => {
  return (
    <footer className="bg-[#0c0c0c] border-t border-[#1c1c1c] mt-auto w-full">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-8 md:py-10 lg:py-14">
        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
          {/* Brand */}
          <div className="max-w-xs lg:max-w-sm">
            <a href="/" className="flex items-center gap-2.5 mb-3">
              <img src={logo.src} className="w-7 h-7 lg:w-9 lg:h-9" alt="Kurokami Logo" />
              <span className="text-lg lg:text-2xl font-bold text-white">
                Kuro<span className="text-[#EF4444]">kami</span>
              </span>
            </a>
            <p className="text-zinc-500 text-sm lg:text-base leading-relaxed">
              Baca manga, manhwa, dan manhua gratis. Kami tidak menyimpan file
              apapun — semua konten di-host oleh layanan pihak ketiga.
            </p>
          </div>

          {/* Nav + Info links — side by side on mobile */}
          <div className="flex gap-8 sm:gap-16 md:contents">

          <div className="flex flex-col gap-3">
            <p className="text-xs lg:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Navigasi
            </p>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-zinc-500 text-sm lg:text-[15px] hover:text-[#EF4444] transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs lg:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Info
            </p>
            <ul className="flex flex-col gap-2">
              {INFO_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-zinc-500 text-sm lg:text-[15px] hover:text-[#EF4444] transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          </div>{/* end mobile row wrapper */}
        </div>

        <hr className="my-6 md:my-8 border-[#1c1c1c]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs lg:text-sm text-zinc-600">
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
            <FontAwesomeIcon icon={faGithub} className="text-xl lg:text-2xl" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
