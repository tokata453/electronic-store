import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack, LayoutGrid } from "lucide-react";

const iconMap = {
  Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack,
};

export default function CategoryGrid({ categories, isLoading }) {
  return (
    <div className="w-full px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
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
    </div>
  );
}