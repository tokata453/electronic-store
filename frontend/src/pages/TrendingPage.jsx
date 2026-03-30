import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "@/services/products"; 
import ProductGalleryLayout from "../components/ProductGalleryLayout";

export default function TrendingPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortOption, setSortOption] = useState("price-asc"); // Defaulting to price-asc per request
  const [currentPage, setCurrentPage] = useState(1);
  const [uiMaxPrice, setUiMaxPrice] = useState(5000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(5000);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let apiParams = { badge: 'Hot', limit: 6 };
        
        if (appliedMaxPrice !== 5000) apiParams.maxPrice = appliedMaxPrice;
        if (currentPage !== 1) apiParams.page = currentPage;
        if (sortOption === "price-asc") { apiParams.sortBy = "price"; apiParams.order = "ASC"; } 
        else if (sortOption === "price-desc") { apiParams.sortBy = "price"; apiParams.order = "DESC"; }

        const data = await getProducts(apiParams);
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (err) {
        setError("Failed to load trending products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendingProducts();
  }, [appliedMaxPrice, sortOption, currentPage]);

  const handleApplyFilters = () => { setAppliedMaxPrice(uiMaxPrice); setCurrentPage(1); };
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSortChange = (option) => { setSortOption(option); setCurrentPage(1); };

  // Define the custom header for Trending
  const trendingHeader = (
    <div>
      <nav className="flex items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#191c1d]/40 mb-6">
        <Link to="/" className="hover:text-[#003d9b] transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#191c1d]">Trending</span>
      </nav>
      <h1 className="text-[36px] xl:text-[42px] font-black text-[#191c1d] tracking-tight mb-4 leading-tight">
        The Standard of Excellence
      </h1>
      <p className="text-[14px] text-[#191c1d]/60 font-medium leading-relaxed">
        Discover the elite tools defined by precision and performance. These are our most coveted and best-selling premium electronics.
      </p>
    </div>
  );

  return (
    <ProductGalleryLayout 
      products={products}
      pagination={pagination}
      isLoading={isLoading}
      error={error}
      emptyMessage="No trending products match your current filters."
      headerContent={trendingHeader}
      uiMaxPrice={uiMaxPrice}
      setUiMaxPrice={setUiMaxPrice}
      handleApplyFilters={handleApplyFilters}
      sortOption={sortOption}
      setSortOption={handleSortChange}
      currentPage={currentPage}
      handlePageChange={handlePageChange}
    />
  );
}