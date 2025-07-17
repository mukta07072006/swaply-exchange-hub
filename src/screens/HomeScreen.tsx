import { useState } from "react";
import { Search, Filter, MapPin, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SwapCard from "@/components/SwapCard";
import ChatScreen from "@/screens/ChatScreen";
import { 
  StatsWidget, 
  TrendingWidget, 
  QuickActionsWidget, 
  RecentActivityWidget, 
  AIInsightsWidget,
  SwapProgressWidget 
} from "@/components/Widgets";

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
  const [showChat, setShowChat] = useState(false);
  const [showWidgets, setShowWidgets] = useState(true);

  const handleRequestSwap = (itemId: string) => {
    // Open chat for this swap request
    setShowChat(true);
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleQuickAction = (action: string) => {
    if (action === "messages") {
      setShowChat(true);
    }
    console.log("Quick action:", action);
  };

  const filteredItems = mockSwapItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showChat) {
    return (
      <ChatScreen
        recipientName="Alex Johnson"
        swapItem={{
          title: "iPhone 13 Pro",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
        }}
        onBack={() => setShowChat(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => setShowWidgets(!showWidgets)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Swaply</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                San Francisco Bay Area
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items to swap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {/* Widgets Section */}
        {showWidgets && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-4">
              <StatsWidget />
              <AIInsightsWidget />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickActionsWidget onAction={handleQuickAction} />
              <TrendingWidget />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SwapProgressWidget />
              <RecentActivityWidget />
            </div>
          </div>
        )}

        {/* Available Swaps Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            Available Swaps
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredItems.length} items)
            </span>
          </h2>
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