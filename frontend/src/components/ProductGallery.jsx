import React, { useState } from "react";

export default function ProductGallery({ images, productName }) {
    // Safely handle missing images
    const safeImages = images && images.length > 0 ? images : ['/placeholder.png'];
    const [selectedImage, setSelectedImage] = useState(safeImages[0]);

    return (
        <div className="flex flex-col gap-6 w-full lg:sticky lg:top-28">
            
            {/* Main Showcase Image */}
            <div className="w-full aspect-[4/5] bg-[#f3f4f5] rounded-[2rem] flex items-center justify-center p-12 relative overflow-hidden group">
                <img 
                    src={selectedImage} 
                    alt={productName} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
                />
            </div>

            {/* Thumbnails */}
            {safeImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {safeImages.map((imgUrl, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`
                                relative w-24 h-24 rounded-2xl bg-[#f3f4f5] overflow-hidden shrink-0 transition-all duration-300
                                ${selectedImage === imgUrl ? 'ring-2 ring-[#003d9b] ring-offset-2 opacity-100' : 'opacity-60 hover:opacity-100'}
                            `}
                        >
                            <img 
                                src={imgUrl} 
                                alt={`${productName} angle ${index + 1}`}
                                className="w-full h-full object-contain p-2 mix-blend-multiply"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}