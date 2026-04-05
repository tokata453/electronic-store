import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Imported Link for fast SPA routing
import { getProducts } from "@/services/products";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react"; // Imported the arrow icon

export default function OnSaleProducts() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                // Fetching exactly 3 to match the 3-column sketch layout
                const data = await getProducts({ badge: 'Sale', limit: 3 });
                setProducts(data.products);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleProducts();
    }, []);

    if (error) {
        return (
            <div className="py-12 text-center text-[#d32f2f]">
                <p>Failed to load sale items: {error}</p>
            </div>
        );
    }

    return (
        <section className="w-full px-6 py-24 md:px-12 lg:px-24 bg-white font-sans">
            
            {/* The Editorial Header Layout */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 max-w-7xl mx-auto">
                
                {/* Left Side: The Massive Title */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-[0.2em] mb-4">
                        Discounted Products
                    </span>
                    <h2 className="text-[48px] md:text-[64px] font-black text-[#191c1d] tracking-tighter leading-none">
                        Special Offers<span className="text-[#e1e3e4]">.</span>
                    </h2>
                </div>

                {/* Right Side: The Description Paragraph */}
                <div className="max-w-md md:pb-2">
                    <p className="text-[15px] text-[#191c1d]/60 leading-relaxed font-medium">
                        A collection of our best deals, handpicked for you. These premium products are now available at an irresistible prices. Don't miss out on these exclusive offers!
                    </p>
                </div>

            </div>

            {/* The 3-Column Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 max-w-7xl mx-auto">
                
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
                        No premium offers are currently available.
                    </div>
                )}

                {/* Mapping the products using your redesigned ProductCard */}
                {!isLoading && products.map((product) => (
                    <div key={product.id} className="w-full">
                        <ProductCard product={product} />
                    </div>
                ))}

            </div>
            
            {/* View All CTA - Matches the BestSellers styling exactly */}
            <div className="mt-20 text-center">
                <Link 
                    to="/sale" 
                    className="inline-flex items-center gap-2 text-[#003d9b] font-bold text-[13px] tracking-[0.1em] uppercase border-b-2 border-[#003d9b]/10 pb-1 hover:border-[#003d9b] transition-all"
                >
                    View All Special Offers
                    <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
            </div>

            {/* Subtle Divider line below the section */}
            <div className="mt-32 max-w-7xl mx-auto border-b border-[#191c1d]/10"></div>
        </section>
    );
}