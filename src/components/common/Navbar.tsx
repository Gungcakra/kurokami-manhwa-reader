import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/images/logos/logo.png"

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <nav className="bg-accent w-full z-50 top-0 start-0 b">
      <div className="container flex flex-wrap items-center justify-around py-2">
        <a href="/" className="flex items-center space-x-3">
          <img src={logo.src} className="w-8" alt="Kurokami Logo" />
          <h1 className="text-xl font-semibold text-white">Kurokami</h1>
        </a>

        <div className="flex md:order-2 space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 w-10 h-10 text-zinc-200 rounded-lg"
          >
            <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)} 
            className="md:hidden p-2 w-10 h-10 text-zinc-200 rounded-lg"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
        </div>

        <div className={`md:flex md:w-auto md:order-1 ${showSidebar ? "fixed left-0 top-0 h-full w-64 bg-secondary z-40" : "hidden"}`}>
            <ul className={`flex flex-col p-4 md:p-0 mt-4 font-medium rounded-lg md:space-x-8 md:flex-row md:mt-0 md:border-0 ${showSidebar ? "gap-5 h-full" : ""}`}>
            {[
              { name: "Home", link: "/" },
              { name: "Bookmark", link: "/ongoing" },
              { name: "History", link: "/completed" },
              { name: "Daftar Manhwa", link: "/anime" },
            ].map((item, index) => (
              <li key={index} className="mb-4 md:mb-0">
              <a href={item.link} className="navbar-link-item transition-all font-semibold text-white duration-300 ease-in-out hover:text-[#6B69F1]">
                {item.name}
              </a>
              </li>
            ))}
            </ul>
        </div>
      </div>

      {showSearch && (
        <div className="bg-secondary p-4 border-t border-zinc-800">
          <input
            type="search"
            className="w-full p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
            placeholder="Cari Anime..."
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
