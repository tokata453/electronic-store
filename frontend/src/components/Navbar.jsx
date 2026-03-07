import React, { useState, useEffect } from "react";
import { ChevronRight, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/categories"; // Make sure this path is correct!

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories when the Navbar mounts
  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories for navbar", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNavCategories();
  }, []);

  return (
    <nav className="w-full bg-white px-6 py-4 flex items-center gap-12">
      
      {/* LEFT: Browse Category + Dropdown */}
      <div className="relative group z-50">
        
        {/* Browse button */}
        <button className="flex items-center gap-3 bg-white hover:bg-gray-200 px-5 py-3 rounded-xl font-medium transition">
          <Menu size={20} />
          <span>Browse Category</span>
          <ChevronRight size={18} />
        </button>

        {/* Dropdown (shows on hover) */}
        <div
          className="
            absolute left-0 mt-3 w-80
            bg-gray-100 rounded-xl
            shadow-lg border border-gray-200
            opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition-all duration-200
          "
        >
          <ul className="p-3 space-y-2">
            {isLoading ? (
              <li className="p-4 text-center text-sm text-gray-500">Loading categories...</li>
            ) : categories.length === 0 ? (
              <li className="p-4 text-center text-sm text-gray-500">No categories found</li>
            ) : (
              categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-lg hover:bg-gray-200 cursor-pointer transition"
                >
                  {/* Notice the Link here uses category.id to prevent the 500 Error! */}
                  <Link 
                    to={`/category/${category.id}`} 
                    className="flex items-center justify-between p-3 w-full"
                  >
                    <div className="flex items-center gap-4">
                      
                      {/* API Icon (Emoji) */}
                      <span className="text-xl" role="img" aria-label={category.name}>
                        {category.icon}
                      </span>

                      {/* text */}
                      <span className="font-medium">
                        {category.name}
                      </span>
                    </div>

                    <ChevronRight size={18} className="text-gray-500" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* RIGHT: Navigation links */}
      <ul className="flex items-center gap-10 font-semibold">
        {/* Wrapping standard links in React Router Links */}
        <li><Link to="/" className="text-blue-500 hover:text-blue-600 transition">HOME</Link></li>
        <li><Link to="/products" className="text-gray-700 hover:text-blue-500 transition">PRODUCTS</Link></li>
        <li><Link to="/contact" className="text-gray-700 hover:text-blue-500 transition">CONTACT US</Link></li>
        <li><Link to="/orders" className="text-gray-700 hover:text-blue-500 transition">ORDERS</Link></li>
        <li><Link to="/track-order" className="text-gray-700 hover:text-blue-500 transition">TRACK ORDER</Link></li>
      </ul>
    </nav>
  );
}