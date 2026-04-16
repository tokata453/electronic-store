import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCategoryById } from "@/services/categories";
import { getProducts } from "@/services/products"; 
import ProductGalleryLayout from "../components/ProductGalleryLayout";

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortOption, setSortOption] = useState("price-asc"); 
  const [currentPage, setCurrentPage] = useState(1);
  const [uiMaxPrice, setUiMaxPrice] = useState(5000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(5000);

  // 1. Fetch Category Info
  useEffect(() => {
    if (!id) return;
    getCategoryById(id).then(data => setCategory(data)).catch(() => setError("Failed to load category details."));
  }, [id]);

  // 2. Fetch Products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let apiParams = { categoryId: id, limit: 6 };
        if (appliedMaxPrice !== 5000) apiParams.maxPrice = appliedMaxPrice;
        if (currentPage !== 1) apiParams.page = currentPage;
        if (sortOption === "price-asc") { apiParams.sortBy = "price"; apiParams.order = "ASC"; } 
        else if (sortOption === "price-desc") { apiParams.sortBy = "price"; apiParams.order = "DESC"; }

        const data = await getProducts(apiParams);
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchFilteredProducts();
  }, [id, appliedMaxPrice, sortOption, currentPage]);

  const handleApplyFilters = () => { setAppliedMaxPrice(uiMaxPrice); setCurrentPage(1); };
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSortChange = (option) => { setSortOption(option); setCurrentPage(1); };

  // Define the custom Top-Aligned header for Categories
  const categoryHeader = (
    <div className="mb-2"> {/* Removed massive padding so it acts like a sidebar item */}
      <nav className="flex items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#191c1d]/40 mb-4">
        <Link to="/" className="hover:text-[#003d9b] transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/categories" className="hover:text-[#003d9b] transition-colors">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-[#191c1d]">{category ? category.name : "..."}</span>
      </nav>
      
      <h1 className="text-[42px] font-black text-[#191c1d] tracking-tight mb-4">
        {category ? category.name : "Loading..."}
      </h1>
      
      <p className="text-[15px] text-[#191c1d]/60 font-medium max-w-sm leading-relaxed">
        {category?.description || "Discover a curated selection of industry-leading devices."}
      </p>
    </div>
  );

  return (
    <ProductGalleryLayout 
      products={products}
      pagination={pagination}
      isLoading={isLoading}
      error={error}
      emptyMessage="No products match your current filters."
      headerContent={categoryHeader}
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