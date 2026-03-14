import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/products";
import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";

export default function ProductPage() {
    const { id } = useParams();
    
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError("Failed to load product details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (isLoading) {
        return <div className="py-20 text-center text-gray-500">Loading product...</div>;
    }

    if (error || !product) {
        return <div className="py-20 text-center text-red-500">{error || "Product not found"}</div>;
    }

    return (
        <div className="w-full px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
            {/* Split layout: Gallery on left, Info on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                
                <ProductGallery 
                    images={product.imageUrls} 
                    productName={product.name} 
                />
                
                <ProductInfo 
                    product={product} 
                />

            </div>
        </div>
    );
}