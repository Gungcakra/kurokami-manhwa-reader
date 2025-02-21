import React from "react";
import logo from "../../assets/images/logos/logo.png";
const Footer = () => {
  return (
    <footer className="bg-accent pt-5 min-w-full">
      <div className="container w-full py-8 lg:py-10">
        <div className="lg:flex lg:justify-around gap-8">
          <div className="mb-6 lg:mb-0 max-w-[500px]">
            <a
              href="/"
              className="flex items-center max-w-min"
            >
              <img
                src={logo.src}
                className="w-8 me-3"
                alt="Kurokami Logo"
              />
              <span className="self-center text-2xl font-semibold text-white">
                Kurokami
              </span>
            </a>
            <p className="py-4 text-zinc-400">
              This site does not store any files on our server, we are linked
              to the media which is hosted on 3rd party services.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <ul className="flex flex-col gap-4 text-zinc-500 font-medium">
              <li>
                <a href="/genres" className="hover:underline">
                  Daftar Genre
                </a>
              </li>
              <li>
                <a href="/schedule" className="hover:underline">
                  Jadwal Rilis
                </a>
              </li>
              <li>
                <a href="/movies" className="hover:underline">
                  Movies
                </a>
              </li>
              <li>
                <a href="/popular" className="hover:underline">
                  Terpopuler
                </a>
              </li>
            </ul>

            <ul className="flex flex-col gap-4 text-zinc-500 font-medium">
              <li>
                <a href="/disclaimers" className="hover:underline">
                  Disclaimers
                </a>
              </li>
              <li>
                <a
                  href=""
                  target="_blank"
                  className="hover:underline"
                >
                  Donasi
                </a>
              </li>
              <li>
                <a
                  href=""
                  target="_blank"
                  className="hover:underline"
                >
                  Terima Kasih
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-6 border-zinc-700 lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-around">
          <span className="text-sm text-zinc-500 sm:text-center">
            © 2025{" "}
            <a
              href="/"
              className="hover:underline text-white"
            >
              Kurokami™
            </a>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a
              href="https://github.com/gungcakra"
              target="_blank"
              className="text-zinc-500 hover:text-white ms-5"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            {/* <a
              href=""
              target="_blank"
              className="text-zinc-500 hover:text-white ms-5"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z"></path>
              </svg>
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
