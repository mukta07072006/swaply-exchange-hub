import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SwapCard from "@/components/SwapCard";

// Mock data for demonstration
const mockSwapItems = [
  {
    id: "1",
    title: "iPhone 13 Pro",
    description: "Excellent condition iPhone 13 Pro with original box and charger. Perfect for someone looking to upgrade their phone.",
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"],
    preferredItems: ["MacBook", "iPad", "Android Phone"],
    location: "San Francisco, CA",
    owner: {
      name: "Alex Johnson",
      avatar: "",
    },
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "Vintage Leather Jacket",
    description: "Authentic vintage leather jacket from the 80s. Size medium, genuine leather with minimal wear.",
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"],
    preferredItems: ["Designer Shoes", "Watch", "Sunglasses"],
    location: "New York, NY",
    owner: {
      name: "Sarah Chen",
      avatar: "",
    },
    createdAt: "1 day ago",
  },
  {
    id: "3",
    title: "Mountain Bike",
    description: "Well-maintained mountain bike perfect for trails. Recently serviced with new tires.",
    category: "Sports",
    images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"],
    preferredItems: ["Road Bike", "Skateboard", "Sports Equipment"],
    location: "Seattle, WA",
    owner: {
      name: "Mike Rodriguez",
      avatar: "",
    },
    createdAt: "3 days ago",
  },
];

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleRequestSwap = (itemId: string) => {
    // This will be connected to the swap request system
    console.log("Requesting swap for item:", itemId);
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredItems = mockSwapItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Swaply</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              San Francisco Bay Area
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items to swap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Available Swaps</h2>
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} items available for exchange
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <SwapCard
                key={item.id}
                item={item}
                onRequestSwap={handleRequestSwap}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={favorites.includes(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later for new listings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;