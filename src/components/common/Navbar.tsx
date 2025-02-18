import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/images/logos/logo.png"
const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="bg-zinc-900 fixed w-full z-50 top-0 start-0 border-b border-zinc-800">
      <div className="container flex flex-wrap items-center justify-around py-2">
        <a href="https://kurokami-id.vercel.app" className="flex items-center space-x-3">
          <img src={logo.src} className="w-8" alt="Kurokami Logo" />
          <h1 className="text-xl font-semibold text-white">Kurokami</h1>
        </a>

        <div className="flex md:order-2 space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 w-10 h-10 text-zinc-200 rounded-lg hover:bg-zinc-700"
          >
            <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
          </button>
          <button className="md:hidden p-2 w-10 h-10 text-zinc-200 rounded-lg hover:bg-zinc-700">
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex md:w-auto md:order-1">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-zinc-700 rounded-lg bg-zinc-800 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-zinc-900">
            <li><a href="/" className="navbar-link-item text-white">Home</a></li>
            <li><a href="/ongoing" className="navbar-link-item text-white">Ongoing</a></li>
            <li><a href="/completed" className="navbar-link-item text-white">Completed</a></li>
            <li><a href="/anime" className="navbar-link-item text-white">Daftar Manhwa</a></li>
          </ul>
        </div>
      </div>

      {showSearch && (
        <div className="bg-zinc-900 p-4 border-t border-zinc-800">
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
