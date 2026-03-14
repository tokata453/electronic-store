import React, { useState } from "react";

export default function ProductGallery({ images, productName }) {
    const [selectedImage, setSelectedImage] = useState(images?.[0] || 'placeholder.png');

    return (
        <div className="flex flex-col gap-4">
            {/* Main Large Image */}
            <div className="w-full aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                <img 
                    src={selectedImage} 
                    alt={productName} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Thumbnails Row */}
            {images && images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((imgUrl, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`
                                relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all
                                ${selectedImage === imgUrl ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}
                            `}
                        >
                            <img 
                                src={imgUrl} 
                                alt={`${productName} view ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}