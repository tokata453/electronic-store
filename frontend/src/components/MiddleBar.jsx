import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authentication";

export default function MiddleBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
      }
    };
    checkUser();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/"); 
  };

  return (
    /* Layer 0: Background - Removed bottom border, using surface shift */
    <div className="flex items-center justify-between px-12 py-6 bg-[#f8f9fa]">
      
      {/* Brand Name - Manrope Typography */}
      <Link to="/" className="text-3xl font-[Manrope] font-bold text-[#003d9b] tracking-tight">
        i-Tech
      </Link>

      {/* Search Bar - Surface High with Bottom Border Focus */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[800px] mx-12 relative">
        <input
          type="search"
          name="search"
          placeholder="Search for premium products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#e1e3e4] h-12 px-5 pr-12 rounded-t-lg rounded-b-none border-b-2 border-transparent text-[#191c1d] font-sans focus:outline-none focus:border-[#003d9b] transition-colors placeholder:text-[#191c1d]/50"
        />
        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4 text-[#191c1d]/60 hover:text-[#003d9b] transition-colors">
          <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.966 56.966">
            <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23 s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92 c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17 s-17-7.626-17-17S14.61,6,23.984,6z"/>
          </svg>
        </button>
      </form>

      {/* Auth & Cart Icons */}
      <div className="flex items-center gap-8 shrink-0">
        
        {isLoggedIn ? (
          <div className="relative group z-50 py-2"> 
            <Link to="/profile" className="flex items-center text-[#191c1d] hover:text-[#003d9b] transition-colors font-sans font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </Link>

            {/* Glassmorphism Dropdown */}
            <div className="absolute right-0 top-full w-48 bg-white/80 backdrop-blur-[12px] border border-[#191c1d]/15 shadow-[0_20px_40px_rgba(25,28,29,0.06)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:scale-100 scale-95">
              <ul className="py-2 text-sm text-[#191c1d] font-sans">
                <li>
                  <Link to="/profile" className="block px-5 py-2.5 hover:bg-[#f3f4f5] hover:text-[#003d9b] transition-colors">
                    My Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="block px-5 py-2.5 hover:bg-[#f3f4f5] hover:text-[#003d9b] transition-colors">
                    Past Acquisitions
                  </Link>
                </li>
                <li className="mt-1 pt-1 border-t border-[#191c1d]/10">
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 hover:bg-[#f3f4f5] text-[#191c1d]/70 transition-colors">
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <Link to="/login" className="flex items-center text-[#191c1d] hover:text-[#003d9b] transition-colors py-2 font-sans font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}

        <Link to="/cart" className="flex items-center text-[#191c1d] hover:text-[#003d9b] transition-colors py-2 font-sans font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
        </Link>
      </div>
    </div>
  );
}