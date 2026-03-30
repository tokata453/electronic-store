import React, { useState, useEffect } from "react";
import { getProducts } from "@/services/products";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";

export default function BestSellers() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                // Fetching the 'Hot' products from your API
                const data = await getProducts({ badge: 'Hot', limit: 6 });
                setProducts(data.products);
            } catch (err) {
                console.error("Error loading best sellers:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBestSellers();
    }, []);

    return (
        <section className="w-full px-6 py-24 md:px-12 lg:px-24 bg-white">
            
            {/* Header: Centered & Sophisticated */}
            <div className="max-w-3xl mx-auto text-center mb-20">
                <h2 className="text-[42px] font-black text-[#191c1d] tracking-tight mb-4">
                    Trending Products
                </h2>
                <p className="text-[16px] text-[#191c1d]/60 font-sans leading-relaxed">
                    A handpicked selection of our hottest items, loved by our customers. Discover the best of the best in tech and lifestyle.
                </p>
            </div>

            {/* Grid Layout: Using 3 columns for that spacious, high-end gallery feel */}
            <div className="grid grid-cols-1 gap-y-16 gap-x-12 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="w-full max-w-[320px] aspect-[4/5] bg-[#f3f4f5] animate-pulse rounded-2xl" />
                    ))
                ) : (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>

            {/* View All CTA - Placed at the bottom of the section */}
            <div className="mt-20 text-center">
                <a 
                    href="/trending" 
                    className="inline-flex items-center gap-2 text-[#003d9b] font-bold text-[13px] tracking-[0.1em] uppercase border-b-2 border-[#003d9b]/10 pb-1 hover:border-[#003d9b] transition-all"
                >
                    Explore Full Collection
                    <ArrowRight size={16} strokeWidth={2.5} />
                </a>
            </div>
        </section>
    );
}