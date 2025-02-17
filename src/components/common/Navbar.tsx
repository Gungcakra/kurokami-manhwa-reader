import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="flex items-center p-4 bg-[#181B20] text-white justify-between">
        <div className="w-[85%] flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-xl font-bold">Kurokami</h1>

          {/* Navbar Links (desktop only) */}
          <div className="space-x-4 hidden md:flex">
            <a href="/" className="hover:text-gray-400">Home</a>
            <a href="/manhwa-list" className="hover:text-gray-400">Daftar Manhwa</a>
            <a href="/history" className="hover:text-gray-400">History</a>
          </div>

          {/* Search Input (desktop only) */}
          <div className="">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 bg-gray-700 text-white rounded-md"
            />
          </div>

          {/* Hamburger Icon for Mobile */}
            <button 
            onClick={toggleSidebar} 
            className="text-white text-2xl p-2 focus:outline-none block md:hidden z-50"
            >
            <FontAwesomeIcon icon={faBars} className="text-white" />
            </button>
        </div>
      </nav>

      {/* Sidebar (Mobile only) */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 z-50 bg-[#181B20] text-white w-64 h-full p-4 md:hidden">
          <div className="space-y-4">
            <a href="/" className="block hover:text-gray-400">Home</a>
            <a href="/manhwa-list" className="block hover:text-gray-400">Daftar Manhwa</a>
            <a href="/history" className="block hover:text-gray-400">History</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
