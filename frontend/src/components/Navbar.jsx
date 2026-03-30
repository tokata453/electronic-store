import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, ShoppingCart, User, ChevronRight, LayoutGrid, Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack } from "lucide-react";
import { authService } from "../services/authentication";
import { getCategories } from "../services/categories";
import VisualSearchButton from "./VisualSearchButton"; // 1. IMPORT YOUR NEW COMPONENT

const iconMap = { Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack };

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catData = await getCategories();
        setCategories(catData);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        // Convert the user object to a boolean (true if user exists, false if null)
        setIsLoggedIn(!!user); 
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

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
    <header className="w-full sticky top-0 z-50 bg-white px-8 py-4 flex items-center justify-between shadow-[0_10px_30px_rgba(25,28,29,0.03)] transition-all">
      
      {/* 1. LEFT: Menu, Logo, AND Navigation Links */}
      <div className="flex items-center gap-8 shrink-0">
        
        <div className="flex items-center gap-4">
          {/* Categories Menu */}
          <div className="relative group">
            <button className="p-2 text-[#191c1d] hover:text-[#003d9b] bg-transparent hover:bg-[#f3f4f5] rounded-full transition-colors">
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Glassmorphism Dropdown */}
            <div className="absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-[12px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.08)] border border-[#191c1d]/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left group-hover:translate-y-0 translate-y-2">
              <div className="p-4 text-[11px] font-semibold tracking-[0.05em] uppercase text-[#191c1d]/40 mb-1">
                Categories
              </div>
              <ul className="p-2 space-y-1">
                {isLoading ? (
                  <li className="p-4 text-sm text-[#191c1d]/50">Loading...</li>
                ) : (
                  categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || LayoutGrid;
                    return (
                      <li key={category.id}>
                        <Link to={`/category/${category.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f3f4f5] group/link transition-colors">
                          <div className="flex items-center gap-3">
                            <IconComponent size={18} className="text-[#191c1d]/50 group-hover/link:text-[#003d9b] transition-colors" />
                            <span className="font-medium text-[#191c1d]">{category.name}</span>
                          </div>
                          <ChevronRight size={16} className="text-[#191c1d]/20 group-hover/link:text-[#003d9b] transition-colors" />
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-bold text-[#003d9b] tracking-tight hover:opacity-80 transition-opacity">
            i-Tech
          </Link>
        </div>

        {/* Navigation Links - Moved next to the logo */}
        <nav className="hidden lg:block ml-4">
          <ul className="flex items-center gap-6 text-[12px] font-semibold tracking-[0.05em] uppercase">
            <li><Link to="/products" className="text-[#191c1d] hover:text-[#003d9b] transition-colors">Products</Link></li>
            <li><Link to="/contact" className="text-[#191c1d]/70 hover:text-[#003d9b] transition-colors">Contact</Link></li>
            <li><Link to="/track-order" className="text-[#191c1d]/70 hover:text-[#003d9b] transition-colors">Track Order</Link></li>
          </ul>
        </nav>
      </div>

      {/* 2. CENTER: Expanded Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 hidden md:block">
        {/* 2. REFACTORED SEARCH FORM */}
        <form 
          onSubmit={handleSearch} 
          className="relative flex items-center w-full bg-[#f3f4f5] rounded-full px-4 h-10 border border-transparent focus-within:bg-white focus-within:border-[#003d9b]/20 focus-within:shadow-[0_0_0_4px_rgba(0,61,155,0.05)] transition-all overflow-hidden"
        >
          {/* Search Icon on the Left */}
          <Search size={16} className="text-[#191c1d]/40 shrink-0" />
          
          <input
            type="search"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[14px] text-[#191c1d] px-3 font-medium placeholder:text-[#191c1d]/40"
          />

          {/* 3. GEMINI CAMERA BUTTON ON THE RIGHT */}
          <div className="shrink-0 flex items-center justify-center">
            <VisualSearchButton />
          </div>
        </form>
      </div>

      {/* 3. RIGHT: Profile & Cart */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Profile */}
        {isLoggedIn ? (
          <div className="relative group z-50"> 
            <button className="p-2 text-[#191c1d] hover:text-[#003d9b] hover:bg-[#f3f4f5] rounded-full transition-colors">
              <User size={20} strokeWidth={1.5} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-[12px] border border-[#191c1d]/5 shadow-[0_20px_40px_rgba(25,28,29,0.08)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 overflow-hidden">
              <ul className="py-2 text-sm text-[#191c1d]">
                <li><Link to="/profile" className="block px-5 py-2.5 hover:bg-[#f3f4f5] hover:text-[#003d9b] transition-colors">My Profile</Link></li>
                <li><Link to="/orders" className="block px-5 py-2.5 hover:bg-[#f3f4f5] hover:text-[#003d9b] transition-colors">My Orders</Link></li>
                <li className="mt-1 pt-1 border-t border-[#191c1d]/5">
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 hover:bg-[#f3f4f5] text-[#191c1d]/70 transition-colors">Sign Out</button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <Link to="/login" className="p-2 text-[#191c1d] hover:text-[#003d9b] hover:bg-[#f3f4f5] rounded-full transition-colors">
            <User size={20} strokeWidth={1.5} />
          </Link>
        )}

        {/* Cart */}
        <Link to="/cart" className="p-2 text-[#191c1d] hover:text-[#003d9b] hover:bg-[#f3f4f5] rounded-full transition-colors relative">
          <ShoppingCart size={20} strokeWidth={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#003d9b] rounded-full"></span>
        </Link>

      </div>
    </header>
  );
}