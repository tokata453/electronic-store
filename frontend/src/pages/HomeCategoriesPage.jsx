import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { getCategories } from "@/services/categories"; 
import { getProducts } from "@/services/products"; 
import CategoryGrid from "@/components/categories/CategoryGrid";
import FeaturedProducts from "@/components/categories/FeaturedProducts";

export default function HomeCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and a few featured products in parallel
        const [catsData, prodsData] = await Promise.all([
          getCategories(),
          getProducts({ limit: 3 }) // Fetching 3 to match your 3-column layout
        ]);
        
        setCategories(catsData);
        setFeaturedProducts(prodsData.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="py-24 text-center text-[#d32f2f] bg-[#ffebee] rounded-xl mx-4 md:mx-8 mt-16">
        <p className="font-medium">Failed to load page data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pt-16 pb-24">
      {/* Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-12">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-[#003d9b] transition-colors">Home</Link>
          <span>›</span>
          <span className="text-[#191c1d]">All Categories</span>
        </div>
        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-[#191c1d] mb-4">
          Browse Our Collections
        </h1>
        <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
          Discover our carefully curated selection of premium electronics, designed to elevate your digital lifestyle.
        </p>
      </div>

      {/* Top Section: Icon Grid */}
      <CategoryGrid categories={categories} isLoading={isLoading} />

      {/* Divider */}
      <div className="my-20 max-w-7xl mx-auto border-b border-[#191c1d]/10 px-6 md:px-12 lg:px-24"></div>

      {/* Bottom Section: Editorial Product Grid */}
      <FeaturedProducts products={featuredProducts} isLoading={isLoading} />
    </div>
  );
}