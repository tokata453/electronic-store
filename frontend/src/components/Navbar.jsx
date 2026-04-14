import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, ShoppingCart, User, ChevronRight, LayoutGrid, Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack } from "lucide-react";
import { authService } from "../services/authentication";
import { getCategories } from "../services/categories";
import { getCart } from "../services/cart"; // 1. IMPORT CART SERVICE
import VisualSearchButton from "./VisualSearchButton";

const iconMap = { Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack };

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0); 
  
  // NEW: State to control the category menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  
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
    const fetchCartData = async () => {
      try {
        const cartData = await getCart();
        const count = cartData?.summary?.itemCount || cartData?.items?.length || 0;
        setCartItemCount(count);
      } catch (error) {
        console.error("Failed to fetch cart count", error);
        setCartItemCount(0);
      }
    };
    fetchCartData();
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
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
          {/* UPDATED: Removed "group" class, added React event handlers for hover */}
          <div 
            className="relative"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            {/* UPDATED: Added onClick so mobile users can tap to open/close */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#191c1d] hover:text-[#003d9b] bg-transparent hover:bg-[#f3f4f5] rounded-full transition-colors"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Glassmorphism Dropdown */}
            {/* UPDATED: Swapped group-hover classes for state-based classes. Changed translate-y to translate-x for left-to-right animation */}
            <div 
              className={`absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-[12px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.08)] border border-[#191c1d]/5 transition-all duration-300 transform origin-left ${
                isMenuOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible -translate-x-8"
              }`}
            >
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
                        {/* UPDATED: Added onClick={() => setIsMenuOpen(false)} to hide menu after clicking */}
                        <Link 
                          to={`/category/${category.id}`} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f3f4f5] group/link transition-colors"
                        >
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

        {/* Navigation Links */}
        <nav className="hidden lg:block ml-4">
          <ul className="flex items-center gap-6 text-[12px] font-semibold tracking-[0.05em] uppercase">
            <li><Link to="/products" className="text-[#191c1d] hover:text-[#003d9b] transition-colors">Products</Link></li>
            <li><Link to="/trending" className="text-[#191c1d]/70 hover:text-[#003d9b] transition-colors">Trending</Link></li>
            <li><Link to="/contact" className="text-[#191c1d]/70 hover:text-[#003d9b] transition-colors">Contact Us</Link></li>
          </ul>
        </nav>
      </div>

      {/* 2. CENTER: Expanded Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 hidden md:block">
        <form 
          onSubmit={handleSearch} 
          className="relative flex items-center w-full bg-[#f3f4f5] rounded-full px-4 h-10 border border-transparent focus-within:bg-white focus-within:border-[#003d9b]/20 focus-within:shadow-[0_0_0_4px_rgba(0,61,155,0.05)] transition-all overflow-hidden"
        >
          <Search size={16} className="text-[#191c1d]/40 shrink-0" />
          <input
            type="search"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[14px] text-[#191c1d] px-3 font-medium placeholder:text-[#191c1d]/40"
          />
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
                <li><Link to="/account" className="block px-5 py-2.5 hover:bg-[#f3f4f5] hover:text-[#003d9b] transition-colors">My Profile</Link></li>
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
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#003d9b] rounded-full border-2 border-white shadow-sm"></span>
          )}
        </Link>

      </div>
    </header>
  );
}