import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center font-sans">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#f3f4f5] rounded-full mb-4"></div>
                    <div className="text-[11px] font-bold text-[#191c1d]/40 uppercase tracking-widest">Loading Specs</div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return <div className="py-20 text-center text-[#d32f2f] font-sans font-medium">{error || "Product not found"}</div>;
    }

    return (
        <div className="w-full px-6 lg:px-12 xl:px-16 py-12 mx-auto max-w-[1600px] font-sans">
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#191c1d]/40 mb-10">
                <Link to="/" className="hover:text-[#003d9b] transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/categories" className="hover:text-[#003d9b] transition-colors">Categories</Link>
                <span className="mx-2">/</span>
                <Link to={`/category/${product.category?.id}`} className="hover:text-[#003d9b] transition-colors">
                    {product.category?.name || 'Category'}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-[#191c1d]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
                <ProductGallery images={product.imageUrls} productName={product.name} />
                <ProductInfo product={product} />
            </div>
        </div>
    );
}