import React from "react";
import { Button } from "@/components/ui/button";

export default function ProductInfo({ product }) {
    // Format pricing
    const price = parseFloat(product.price).toFixed(2);
    const salePrice = product.salePrice ? parseFloat(product.salePrice).toFixed(2) : null;

    return (
        <div className="flex flex-col py-4 h-full">
            {/* Badge & Category */}
            <div className="flex items-center gap-2 mb-2">
                {product.badge && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                        {product.badge}
                    </span>
                )}
                <span className="text-sm text-muted-foreground font-medium">
                    {product.category?.name}
                </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
                {salePrice ? (
                    <>
                        <span className="text-3xl font-bold">${salePrice}</span>
                        <span className="text-xl text-muted-foreground line-through">${price}</span>
                    </>
                ) : (
                    <span className="text-3xl font-bold text-foreground">${price}</span>
                )}
            </div>

            {/* Description */}
            <div className="mb-8">
                <p className="text-base text-gray-600 leading-relaxed">
                    {product.description}
                </p>
            </div>
            {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Specifications</h3>
                    <ul className="space-y-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <li key={key} className="flex items-start text-sm">
                                {/* The bullet point */}
                                <span className="text-primary mr-2 mt-1">•</span>
                                
                                {/* The Key and Value */}
                                <div>
                                    <span className="font-medium text-gray-900 capitalize">
                                        {/* Optional: Hardcode specific casing if needed, e.g., 'ram' -> 'RAM' */}
                                        {key}:{" "}
                                    </span>
                                    <span className="text-gray-600">{value}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}    
            {/* Action Area (Add to Cart) */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-500">
                        Availability: <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                    </span>
                </div>
                
                <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-12 py-6 text-lg rounded-full font-semibold"
                    disabled={product.stock <= 0}
                    onClick={() => alert(`Added ${product.name} to cart!`)}
                >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
            </div>
        </div>
    );
}