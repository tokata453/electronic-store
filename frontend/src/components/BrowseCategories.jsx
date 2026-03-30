import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { getCategories } from "@/services/categories"; 
import { Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack, LayoutGrid, ArrowRight } from "lucide-react";

const iconMap = {
  Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack,
};

export default function BrowseCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (error) {
    return (
      <div className="py-12 text-center text-[#d32f2f] bg-[#ffebee] rounded-xl mx-4 md:mx-8">
        <p className="font-medium">Failed to load collections: {error}</p>
      </div>
    );
  }

  return (
    <section className="w-full px-4 py-16 md:px-8 lg:px-12 bg-[#f8f9fa] font-sans">
      
      <div className="flex items-center justify-between gap-6 mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-[#191c1d] whitespace-nowrap">
          Browse Categories
        </h2>
        
        <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#191c1d]/10 to-transparent"></div>
        
        <Link 
          to="/products" 
          className="flex items-center gap-2 text-[#003d9b] font-bold text-[13px] tracking-[0.05em] uppercase hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          View Catalog
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        
        {isLoading && (
          [...Array(6)].map((_, index) => (
            <div 
              key={`cat-skeleton-${index}`} 
              className="flex flex-col items-center justify-center p-8 h-44 w-full bg-white rounded-2xl shadow-[0_10px_30px_rgba(25,28,29,0.03)] animate-pulse"
            >
              <div className="w-16 h-16 bg-[#f3f4f5] rounded-2xl mb-4"></div>
              <div className="h-4 w-24 bg-[#f3f4f5] rounded"></div>
            </div>
          ))
        )}

        {!isLoading && categories.map((category) => {
          const IconComponent = iconMap[category.icon] || LayoutGrid;

          return (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="group block focus:outline-none"
            >
              {/* Reduced padding and height slightly since the text line is gone */}
              <div className="flex flex-col items-center justify-center p-8 h-full bg-white rounded-2xl shadow-[0_10px_30px_rgba(25,28,29,0.03)] hover:shadow-[0_20px_40px_rgba(25,28,29,0.08)] transition-all duration-300 transform group-hover:-translate-y-1">
                
                <div className="w-16 h-16 mb-4 rounded-2xl bg-[#f3f4f5] group-hover:bg-[#003d9b] flex items-center justify-center transition-colors duration-300">
                  <IconComponent 
                    size={28} 
                    strokeWidth={1.5} 
                    className="text-[#191c1d] group-hover:text-white transition-colors duration-300" 
                  />
                </div>
                
                <h3 className="text-[15px] font-bold tracking-tight text-[#191c1d] transition-colors group-hover:text-[#003d9b]">
                  {category.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}