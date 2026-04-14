import React, { useState } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { addToCart } from "@/services/cart"; // Import the service
import { toast } from "react-hot-toast";

export default function ProductInfo({ product }) {
    const price = parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const salePrice = product.salePrice ? parseFloat(product.salePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleQuantityChange = (type) => {
        if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        } else if (type === 'increase' && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleAddToCart = async () => {
        if (isAdding || product.stock <= 0) return;

        setIsAdding(true);
        try {
            await addToCart(product.id, quantity);
            toast.success(`${quantity}x ${product.name} added to cart!`);
            console.log(`Successfully added ${quantity} of ${product.name} to cart`);
            // Reset quantity after successful add
            setQuantity(1);
        } catch (error) {
            toast.error("Failed to add to cart");
            console.error("Error adding to cart", error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex flex-col h-full py-4 lg:py-10">
            {/* Category Label */}
            <div className="mb-4">
                <span className="text-[11px] font-bold text-[#003d9b] uppercase tracking-[0.2em]">
                    {product.category?.name || "Premium Tech"}
                </span>
            </div>

            {/* Title */}
            <h1 className="text-[42px] lg:text-[56px] font-black text-[#191c1d] tracking-tighter leading-[1.1] mb-4">
                {product.name}
            </h1>

            {/* Review Stars & Count */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                        const isFilled = i < Math.round(product.rating || 5);
                        return (
                            <Star 
                                key={i} 
                                size={14} 
                                // UPDATED: Match the ProductCard star colors
                                fill={isFilled ? "#FFC107" : "none"} 
                                stroke={isFilled ? "#FFC107" : "#E1E3E4"} 
                            />
                        );
                    })}
                </div>
                <span className="text-[11px] font-bold tracking-[0.15em] text-[#191c1d]/60 uppercase pt-0.5">
                    {product.rating || 5} / 5 ({product.reviewCount || 0} Reviews)
                </span>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-4 mb-8">
                {salePrice ? (
                    <>
                        <span className="text-[32px] font-bold text-[#191c1d] tracking-tight">${salePrice}</span>
                        <span className="text-[18px] text-[#191c1d]/40 line-through font-medium tracking-tight">${price}</span>
                        {product.badge && (
                            // UPDATED: Changed bg-[#191c1d] to bg-[#003d9b] to match ProductCard
                            <span className="ml-2 bg-[#003d9b] text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-[0.15em] rounded-sm transform -translate-y-1">
                                {product.badge === 'Hot' ? 'Trending' : product.badge}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="text-[32px] font-bold text-[#191c1d] tracking-tight">${price}</span>
                )}
            </div>

            {/* Description Paragraph */}
            <div className="mb-12">
                <p className="text-[16px] text-[#191c1d]/70 leading-relaxed font-medium">
                    {product.description}
                </p>
            </div>

            {/* Technical Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-12 border-y border-[#191c1d]/10 py-8">
                    <h3 className="text-[11px] font-bold text-[#191c1d] uppercase tracking-[0.2em] mb-6">Technical Specs</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex flex-col gap-1">
                                <dt className="text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-widest">{key}</dt>
                                <dd className="text-[14px] font-bold text-[#191c1d]">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}    

            {/* Action Row */}
            <div className="mt-auto">
                <div className="flex items-center gap-2 mb-6">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#191c1d]/60">
                        {product.stock > 0 ? `In Stock (${product.stock})` : "Currently Unavailable"}
                    </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border border-[#191c1d]/10 rounded-xl px-4 py-1 w-full sm:w-32 h-[60px]">
                        <button 
                            onClick={() => handleQuantityChange('decrease')}
                            disabled={quantity <= 1 || product.stock <= 0}
                            className="text-[#191c1d]/60 hover:text-[#191c1d] disabled:opacity-30 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-[14px] font-bold text-[#191c1d]">{quantity}</span>
                        <button 
                            onClick={() => handleQuantityChange('increase')}
                            disabled={quantity >= product.stock || product.stock <= 0}
                            className="text-[#191c1d]/60 hover:text-[#191c1d] disabled:opacity-30 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <button 
                        disabled={isAdding || product.stock <= 0}
                        onClick={handleAddToCart}
                        className="flex-1 bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white text-[13px] font-bold px-12 h-[60px] rounded-xl shadow-[0_15px_30px_rgba(0,61,155,0.2)] hover:shadow-[0_20px_40px_rgba(0,61,155,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {isAdding ? "Adding to Cart..." : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
}