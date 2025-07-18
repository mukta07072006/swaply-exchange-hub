import { useState } from "react";
import { Search, Filter, MapPin, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SwapCard from "@/components/SwapCard";
import ChatScreen from "@/screens/ChatScreen";
import { useSwapItems } from "@/hooks/useSwapItems";
import { useFavorites } from "@/hooks/useFavorites";
import type { User } from '@supabase/supabase-js';
import { 
  StatsWidget, 
  TrendingWidget, 
  QuickActionsWidget, 
  RecentActivityWidget, 
  AIInsightsWidget,
  SwapProgressWidget 
} from "@/components/Widgets";

interface HomeScreenProps {
  user: User;
}

const HomeScreen = ({ user }: HomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showWidgets, setShowWidgets] = useState(true);
  const [selectedChatItem, setSelectedChatItem] = useState<any>(null);
  
  const { items, loading } = useSwapItems();
  const { favorites, toggleFavorite } = useFavorites(user);

  const handleRequestSwap = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedChatItem(item);
      setShowChat(true);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "messages") {
      setShowChat(true);
    }
    console.log("Quick action:", action);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showChat && selectedChatItem) {
    return (
      <ChatScreen
        user={user}
        recipientName={selectedChatItem.owner.name}
        swapItem={{
          title: selectedChatItem.title,
          image: selectedChatItem.images[0] || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
        }}
        onBack={() => {
          setShowChat(false);
          setSelectedChatItem(null);
        }}
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <SwapCard
                key={item.id}
                item={item}
                onRequestSwap={handleRequestSwap}
                onToggleFavorite={() => toggleFavorite(item.id)}
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