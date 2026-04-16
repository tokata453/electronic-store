import React from "react";
import ProductCard from "./ProductCard";
import { ChevronRight, ChevronLeft } from "lucide-react";

// This reusable component handles the sidebar, sorting, grid, and pagination.
export default function ProductGalleryLayout({
  products,
  pagination,
  isLoading,
  error,
  emptyMessage,
  // The custom header injected by the parent page
  headerContent,
  // State handlers passed down from the parent page
  uiMaxPrice,
  setUiMaxPrice,
  handleApplyFilters,
  sortOption,
  setSortOption,
  currentPage,
  handlePageChange
}) {

  return (
    <div className="w-full px-6 lg:px-12 xl:px-16 py-12 mx-auto max-w-[1600px] font-sans">
      
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
        
        {/* =========================================
            LEFT SIDEBAR: Header + Filters
            ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="sticky top-28 flex flex-col gap-12">
            
            {/* Inject the custom header content here */}
            <div>{headerContent}</div>

            {/* The Filters */}
            <div>
              <h2 className="text-[18px] font-bold text-[#191c1d] mb-1">Filters</h2>
              <p className="text-[11px] font-medium text-[#191c1d]/40 uppercase tracking-widest mb-8">Refine Selection</p>

              <div className="mb-8">
                <h3 className="text-[11px] font-bold text-[#191c1d] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#191c1d]/20"></span> Max Price
                </h3>
                <div className="flex flex-col gap-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="5000" 
                    step="50"
                    value={uiMaxPrice}
                    onChange={(e) => setUiMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#003d9b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-[#191c1d]/60 mt-1">
                    <span>$0</span>
                    <span>Up to ${uiMaxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="cursor-pointer w-full bg-[#003d9b] hover:bg-[#003d9b]/90 text-white font-bold text-[13px] py-3.5 rounded-lg shadow-[0_10px_20px_rgba(0,61,155,0.15)] transition-all disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </aside>

        {/* =========================================
            RIGHT COLUMN: Sort Bar & Product Grid
            ========================================= */}
        <div className="flex-1 w-full min-w-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-end mb-8 pb-4 border-b border-[#191c1d]/5 gap-4">
            <p className="text-[13px] font-medium text-[#191c1d]/60">
              <span className="font-bold text-[#191c1d]">{pagination.total}</span> products found
            </p>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-widest">Sort By</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-transparent text-[13px] font-bold text-[#191c1d] pr-6 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Select sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {error && <div className="py-12 text-center text-[#d32f2f] bg-[#ffebee] rounded-xl font-medium">{error}</div>}
          
          {!isLoading && !error && products.length === 0 && (
            <div className="py-32 text-center text-[#191c1d]/40 border border-[#191c1d]/10 rounded-2xl border-dashed">
              {emptyMessage || "No products match your current filters."}
            </div>
          )}

          {/* 3-Column Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={`skeleton-${i}`} className="w-full aspect-[4/5] bg-[#f8f9fa] animate-pulse rounded-2xl" />
              ))
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-20 pt-8 border-t border-[#191c1d]/5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg border border-[#191c1d]/10 text-[#191c1d]/40 hover:text-[#003d9b] hover:border-[#003d9b] disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-[#003d9b] text-white shadow-[0_5px_15px_rgba(0,61,155,0.2)]' 
                      : 'text-[#191c1d]/60 hover:bg-[#f3f4f5] hover:text-[#191c1d]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg border border-[#191c1d]/10 text-[#191c1d]/40 hover:text-[#003d9b] hover:border-[#003d9b] disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}