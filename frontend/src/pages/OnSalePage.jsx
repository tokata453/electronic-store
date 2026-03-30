import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "@/services/products"; 
import ProductGalleryLayout from "../components/ProductGalleryLayout";

export default function OnSalePage() {
  // 1. Standard Data & Filter State
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortOption, setSortOption] = useState("price-asc"); 
  const [currentPage, setCurrentPage] = useState(1);
  const [uiMaxPrice, setUiMaxPrice] = useState(5000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(5000);

  // 2. Fetch "Sale" Products from the API
  useEffect(() => {
    const fetchSaleProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // The magic parameter: badge: 'Sale'
        let apiParams = { badge: 'Sale', limit: 6 };
        
        if (appliedMaxPrice !== 5000) apiParams.maxPrice = appliedMaxPrice;
        if (currentPage !== 1) apiParams.page = currentPage;
        
        if (sortOption === "price-asc") { 
          apiParams.sortBy = "price"; 
          apiParams.order = "ASC"; 
        } else if (sortOption === "price-desc") { 
          apiParams.sortBy = "price"; 
          apiParams.order = "DESC"; 
        }

        const data = await getProducts(apiParams);
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (err) {
        setError("Failed to load special offers.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSaleProducts();
  }, [appliedMaxPrice, sortOption, currentPage]);

  // 3. Handlers
  const handleApplyFilters = () => { 
    setAppliedMaxPrice(uiMaxPrice); 
    setCurrentPage(1); 
  };
  
  const handlePageChange = (page) => { 
    setCurrentPage(page); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };
  
  const handleSortChange = (option) => { 
    setSortOption(option); 
    setCurrentPage(1); 
  };

  // 4. Define the custom Header for the Sale page
  const saleHeader = (
    <div className="mb-2">
      <nav className="flex items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#191c1d]/40 mb-4">
        <Link to="/" className="hover:text-[#003d9b] transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#191c1d]">Special Offers</span>
      </nav>
      
      <h1 className="text-[42px] font-black text-[#191c1d] tracking-tight mb-4 leading-tight">
        Special Offers<span className="text-[#e1e3e4]">.</span>
      </h1>
      
      <p className="text-[15px] text-[#191c1d]/60 font-medium max-w-sm leading-relaxed">
        A refined collection of our most coveted technology, defined by superior craftsmanship and exceptional value.
      </p>
    </div>
  );

  return (
    <ProductGalleryLayout 
      products={products}
      pagination={pagination}
      isLoading={isLoading}
      error={error}
      emptyMessage="No special offers match your current filters."
      headerContent={saleHeader}
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