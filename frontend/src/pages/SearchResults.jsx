import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products"; // Assuming you named the export productService
import ProductCard from "../components/ProductCard"; // Adjust import path as needed
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || ""; // Grabs the '?search=' part of the URL

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Pass the search query to your Axios service
        // Axios automatically turns this into /api/products?search=your_query
        const data = await getProducts({ search: searchQuery });
        
        // Remember: we updated the service to return the full object!
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        setError("Failed to load search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]); // Re-run this effect whenever the URL search query changes!

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
        </h1>
        {!isLoading && pagination && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {products.length} of {pagination.total} results
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State (Skeletons) */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-80 w-full animate-pulse bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-20">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            We couldn't find anything matching "{searchQuery}". Try adjusting your search.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}