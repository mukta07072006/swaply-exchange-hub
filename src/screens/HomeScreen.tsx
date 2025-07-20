import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SwapCard from "@/components/SwapCard";
import { StatsWidget, QuickActionsWidget, RecentActivityWidget } from "@/components/Widgets";
import ProductDetailModal from "@/components/ProductDetailModal";
import LocationSelector from "@/components/LocationSelector";
import NotificationCenter from "@/components/NotificationCenter";
import { useSwapItems } from "@/hooks/useSwapItems";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from '@supabase/supabase-js';

interface HomeScreenProps {
  user: User;
}

const HomeScreen = ({ user }: HomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { items, loading, refetch } = useSwapItems();
  const { unreadCount } = useNotifications(user.id);
  const { toast } = useToast();

  // Check if user has set location preference
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    } else {
      setShowLocationSelector(true);
    }
  }, []);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    localStorage.setItem('userLocation', location);
    setShowLocationSelector(false);
  };

  const handleSwapRequest = async (productId: string) => {
    try {
      const targetItem = items.find(item => item.id === productId);
      if (!targetItem) return;

      // For now, let's use a mock offered item - in real app, user would select from their items
      const { data: userItems, error: itemsError } = await supabase
        .from('swap_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'available')
        .limit(1);

      if (itemsError) throw itemsError;

      if (!userItems || userItems.length === 0) {
        toast({
          title: "No items to offer",
          description: "You need to add items to your profile before making swap requests.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('swap_requests')
        .insert({
          requester_id: user.id,
          owner_id: targetItem.user_id,
          offered_item_id: userItems[0].id,
          requested_item_id: productId,
          message: `Hi! I'd like to swap my ${userItems[0].title} for your ${targetItem.title}.`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Swap request sent!",
        description: "Your swap request has been sent to the item owner.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send swap request",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !selectedLocation || selectedLocation === 'all' || 
      item.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  // Show location selector if no location set
  if (showLocationSelector) {
    return (
      <div className="flex flex-col h-full bg-gradient-primary">
        <div className="flex-1 flex items-center justify-center p-4">
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={selectedLocation || ""}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Swaply</h1>
            <button 
              onClick={() => setShowLocationSelector(true)}
              className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors"
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedLocation || 'Select Location'}
              </span>
            </button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
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
        {/* Widgets */}
        <div className="space-y-4 mb-6">
          <StatsWidget user={user} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionsWidget onAction={() => {}} />
            <RecentActivityWidget />
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {filteredItems.map((item) => (
            <SwapCard 
              key={item.id} 
              item={item} 
              currentUserId={user.id}
              
              onRequestSwap={handleSwapRequest}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "No items available in your location"}
            </p>
          </div>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          productId={selectedProductId}
          onSwapRequest={handleSwapRequest}
          currentUserId={user.id}
        />

        {/* Notification Center */}
        <NotificationCenter
          userId={user.id}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>
    </div>
  );
};

export default HomeScreen;