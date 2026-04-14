import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { addToCart } from "@/services/cart"; // Import the service
import { toast } from "react-hot-toast";


export default function ProductCard({ product }) {
    const imageUrl = product?.imageUrls?.[0] || product?.images?.[0] || 'placeholder.png';
    const price = parseFloat(product?.price || 0).toLocaleString();
    const salePrice = product?.salePrice ? parseFloat(product.salePrice).toLocaleString() : null;

    // Loading state for the button
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Prevent navigating to the product page
        if (isAdding || product.stock <= 0) return;

        setIsAdding(true);
        try {
            await addToCart(product.id, 1);
            // Optionally: show a success toast here
            toast.success(`${product.name} added to cart!`);
            console.log(`Successfully added ${product.name} to cart`);
        } catch (error) {
            // Optionally: show an error toast here
            console.error("Error adding to cart", error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="group relative flex flex-col w-full max-w-[320px] font-sans">
            {/* 1. Image Container with Tonal Layering */}
            <Link to={`/product/${product.id}`} className="relative mb-6 block overflow-hidden rounded-2xl bg-[#f3f4f5] aspect-square flex items-center justify-center p-8">
                {/* Badge Logic */}
                {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#003d9b] text-white text-[9px] font-bold px-3 py-1 uppercase tracking-[0.15em] rounded-sm">
                            {product.badge === 'Hot' ? 'Trending' : product.badge}
                        </span>
                    </div>
                )}
                
                <img
                    src={imageUrl}
                    alt={product?.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                />
            </Link>

            {/* 2. Product Info */}
            <div className="flex flex-col flex-1 px-1">
                {/* Category Label */}
                <span className="text-[10px] font-bold text-[#003d9b]/50 uppercase tracking-[0.1em] mb-1">
                    {product?.category?.name || "Premium Tech"}
                </span>

                <Link to={`/product/${product.id}`}>
                    <h3 className="text-[18px] font-bold text-[#191c1d] leading-tight mb-2 group-hover:text-[#003d9b] transition-colors line-clamp-2">
                        {product?.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < (product.rating || 5) ? "#FFC107" : "none"} stroke={i < (product.rating || 5) ? "#FFC107" : "#E1E3E4"} />
                    ))}
                    <span className="text-[11px] text-[#191c1d]/40 font-medium ml-1">({product.reviewCount || 0})</span>
                </div>

                {/* 3. Price & Action Row */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {salePrice ? (
                            <>
                                <span className="text-[20px] font-bold text-[#191c1d]">${salePrice}</span>
                                <span className="text-[12px] text-[#191c1d]/40 line-through font-medium">${price}</span>
                            </>
                        ) : (
                            <span className="text-[20px] font-bold text-[#191c1d]">${price}</span>
                        )}
                    </div>

                    {/* Gradient Primary Button with Soul */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock <= 0}
                        className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white text-[11px] font-bold px-6 py-3 rounded-lg shadow-[0_10px_20px_rgba(0,61,155,0.15)] hover:shadow-[0_15px_25px_rgba(0,61,155,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isAdding ? "Adding..." : product.stock > 0 ? "Add to Cart" : "Sold Out"}
                    </button>
                </div>
            </div>
        </div>
    );
}