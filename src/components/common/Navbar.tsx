// Navbar.tsx

const Navbar = () => {
    return (
      <div>
        <nav className="flex items-center p-4 bg-[#181B20] text-white justify-center">
         <div className="w-[85%] flex justify-between items-center">
         <h1 className="text-xl font-bold">Kurokami</h1>
          <div className="space-x-4">
            <a href="/" className="hover:text-gray-400">Home</a>
            <a href="/manhwa-list" className="hover:text-gray-400">Daftar Manhwa</a>
            <a href="/history" className="hover:text-gray-400">History</a>
          </div>
         </div>
        </nav>
      </div>
    );
  };
  
  export default Navbar;
  