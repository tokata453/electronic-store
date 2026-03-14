import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Added for seamless React routing
import { getCategories } from "@/services/categories"; 
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Laptop, TabletSmartphone, Headphones, Watch, Backpack, LayoutGrid } from "lucide-react";

const iconMap = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  TabletSmartphone: TabletSmartphone,
  Headphones: Headphones,
  Watch: Watch,
  Backpack: Backpack,
};

export default function BrowseCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (error) {
        return (
            <div className="py-12 text-center text-red-500">
                <p>Failed to load categories: {error}</p>
            </div>
        );
    }

    return (
        <section className="w-full px-4 py-12 md:px-8 lg:px-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                
                {isLoading && (
                    [...Array(6)].map((_, index) => (
                        <div 
                            key={`cat-skeleton-${index}`} 
                            className="h-32 w-full animate-pulse rounded-xl bg-muted"
                        />
                    ))
                )}

                {!isLoading && categories.map((category) => {
                    // Grab the icon component, fallback to LayoutGrid
                    const IconComponent = iconMap[category.icon] || LayoutGrid;

                    return (
                        // Swapped <a> for <Link to={...}>
                        <Link 
                            key={category.id} 
                            to={`/category/${category.id}`}
                            className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                        >
                            <Card className="h-full border border-border bg-card transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    
                                    <div className="mb-3 text-gray-700 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
                                        <IconComponent size={50} strokeWidth={1.5} />
                                    </div>
                                    
                                    <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                        {category.name}
                                    </h3>

                                    {category.description && (
                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                            {category.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}