import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCategoryById } from "../services/categories";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const { id } = useParams(); // Grabs the ID from the URL (e.g., /category/1)
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sorting state: default can be empty or 'low-to-high'
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCategoryById(id);
        setCategory(data);
        setProducts(data.products || []);
      } catch (err) {
        setError("Failed to load category products.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCategoryData();
  }, [id]);

  // This automatically resorts the grid whenever 'sortOrder' or 'products' change
  const sortedProducts = useMemo(() => {
    if (!sortOrder) return products; // Return original order if nothing selected

    // Create a copy of the array before sorting to avoid mutating React state directly
    return [...products].sort((a, b) => {
      if (sortOrder === "price-asc") return a.price - b.price; // Low to High
      if (sortOrder === "price-desc") return b.price - a.price; // High to Low
      return 0;
    });
  }, [products, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Sort Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? category.name : "Category"}
        </h1>

        {/* The Sort Dropdown */}
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Select sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {/* Custom dropdown arrow to match standard UI */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-80 w-full animate-pulse bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && <div className="text-center py-12 text-red-500">{error}</div>}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found in this category.
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Make sure to map over sortedProducts, not the original products state! */}
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}