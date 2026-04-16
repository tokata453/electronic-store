import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ProductCard"; // Adjust path if needed

export default function FeaturedProducts({ products, isLoading }) {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      
      {/* The Editorial Header Layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-[0.2em] mb-4">
            Curated For You
          </span>
          <h2 className="text-[48px] md:text-[64px] font-black text-[#191c1d] tracking-tighter leading-none">
            Discover More<span className="text-[#e1e3e4]">.</span>
          </h2>
        </div>

        <div className="max-w-md md:pb-2">
          <p className="text-[15px] text-[#191c1d]/60 leading-relaxed font-medium">
            Not sure where to start? Browse our latest arrivals and top-rated devices across all categories, perfectly suited for your setup.
          </p>
        </div>
      </div>

      {/* The 3-Column Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {isLoading && (
          [...Array(3)].map((_, index) => (
            <div key={`skeleton-${index}`} className="w-full">
              <div className="aspect-[4/5] bg-[#f8f9fa] animate-pulse rounded-none mb-6" />
              <div className="h-4 w-1/3 bg-[#f8f9fa] mb-2" />
              <div className="h-6 w-2/3 bg-[#f8f9fa] mb-2" />
              <div className="h-5 w-1/4 bg-[#f8f9fa]" />
            </div>
          ))
        )}

        {!isLoading && products.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#191c1d]/40">
            No products are currently available.
          </div>
        )}

        {!isLoading && products.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* View All CTA */}
      <div className="mt-20 text-center">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-[#003d9b] font-bold text-[13px] tracking-[0.1em] uppercase border-b-2 border-[#003d9b]/10 pb-1 hover:border-[#003d9b] transition-all"
        >
          View Entire Catalog
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}