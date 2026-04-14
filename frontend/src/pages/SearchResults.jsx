import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products"; 
import ProductGalleryLayout from "../components/ProductGalleryLayout"; // Import the layout

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const isVisualSearch = searchParams.get("visual") === "true"; // Check if it's an AI camera search

  // --- Core Data State ---
  const [products, setProducts] = useState([]);
  // Give pagination a default structure so the layout doesn't crash before loading finishes
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Layout Control States ---
  const [uiMaxPrice, setUiMaxPrice] = useState(5000); // What the slider currently shows
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(5000); // What we actually fetch with
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page and filters when the user types a brand new search
  useEffect(() => {
    setCurrentPage(1);
    setUiMaxPrice(5000);
    setAppliedMaxPrice(5000);
  }, [searchQuery]);

  // Fetch the data whenever any of our applied states change
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build the API parameters based on your API documentation
        const params = {
          search: searchQuery,
          page: currentPage,
          maxPrice: appliedMaxPrice,
          limit: 6 // Optional: adjust based on your layout preference
        };

        // Handle the sorting strings from the select dropdown
        if (sortOption === "price-asc") {
          params.sortBy = "price";
          params.order = "ASC";
        } else if (sortOption === "price-desc") {
          params.sortBy = "price";
          params.order = "DESC";
        }

        const data = await getProducts(params);
        
        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
      } catch (err) {
        setError("Failed to load search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, currentPage, appliedMaxPrice, sortOption]);

  // --- Handlers for the Layout Component ---
  
  const handleApplyFilters = () => {
    setAppliedMaxPrice(uiMaxPrice); // Only update the actual filter when they click "Apply"
    setCurrentPage(1); // Go back to page 1 on new filter
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Optional: Scroll to top of page smoothly when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Dynamic Content based on visual flag ---
  
  // Custom header injected into the top left of the layout
  const headerContent = (
    <div>
      <h1 className="text-[32px] font-black text-[#191c1d] tracking-tighter leading-tight mb-4">
        {searchQuery 
          ? (isVisualSearch ? "Image Search Results" : `Results for "${searchQuery}"`) 
          : "All Products"}
      </h1>
      <p className="text-[14px] text-[#191c1d]/60 font-medium">
        Explore our collection to find exactly what you need.
      </p>
    </div>
  );

  // Custom empty message
  const emptyMessage = isVisualSearch
    ? "We couldn't find anything matching your image. Try adjusting your filters."
    : (searchQuery 
        ? `We couldn't find anything matching "${searchQuery}". Try adjusting your filters.` 
        : "No products match your current filters.");

  return (
    <ProductGalleryLayout
      products={products}
      pagination={pagination}
      isLoading={isLoading}
      error={error}
      emptyMessage={emptyMessage}
      headerContent={headerContent}
      uiMaxPrice={uiMaxPrice}
      setUiMaxPrice={setUiMaxPrice}
      handleApplyFilters={handleApplyFilters}
      sortOption={sortOption}
      setSortOption={setSortOption}
      currentPage={currentPage}
      handlePageChange={handlePageChange}
    />
  );
}