
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Edit3, Star, Calendar, MapPin, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from '@supabase/supabase-js';

interface ProfileScreenProps {
  user: User;
  onTabChange?: (tab: string) => void;
}

const ProfileScreen = ({ user, onTabChange }: ProfileScreenProps) => {
  const [userItems, setUserItems] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
        } else {
          setUserProfile(profile);
        }

        // Fetch user items
        const { data: items, error: itemsError } = await supabase
          .from('swap_items')
          .select(`
            *,
            categories (name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (itemsError) {
          console.error('Items error:', itemsError);
          throw itemsError;
        }
        
        const formattedItems = items?.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.categories?.name || 'Other',
          images: item.images || [],
          preferredItems: item.preferred_items || [],
          status: item.status,
          createdAt: new Date(item.created_at).toLocaleDateString(),
          views: 0,
          requests: 0
        })) || [];
        
        setUserItems(formattedItems);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user.id, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Edit profile feature coming soon!",
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('swap_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setUserItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item deleted",
        description: "Your item has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsSwapped = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('swap_items')
        .update({ status: 'swapped' })
        .eq('id', itemId);

      if (error) throw error;

      setUserItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'swapped' } : item
      ));
      
      toast({
        title: "Item marked as swapped",
        description: "Item moved to swap history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive",
      });
    }
  };
  
  // Use actual user data when available
  const displayName = userProfile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const displayProfile = {
    name: displayName,
    email: user.email || '',
    location: userProfile?.location || 'Location not set',
    rating: userProfile?.rating || 5.0,
    totalSwaps: userProfile?.total_swaps || 0,
    activeListings: userItems.filter(item => item.status === "available").length
  };

  const activeItems = userItems.filter(item => item.status === "available");
  const swappedItems = userItems.filter(item => item.status === "swapped");

  const ItemCard = ({ item, showActions = true }: { item: any; showActions?: boolean }) => (
    <Card className="mb-4 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img 
              src={item.images[0] || "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400"} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium line-clamp-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
              </div>
              <Badge 
                variant={item.status === "available" ? "default" : "secondary"}
                className="ml-2"
              >
                {item.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.createdAt}</span>
              <div className="flex items-center space-x-3">
                <span>{item.views} views</span>
                <span>{item.requests} requests</span>
              </div>
            </div>
            
            {showActions && item.status === "available" && (
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMarkAsSwapped(item.id)}
                >
                  ✅ Swapped
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditProfile}>
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {displayProfile.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{displayProfile.name}</h2>
                <p className="text-muted-foreground">{displayProfile.email}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayProfile.location}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-lg">{displayProfile.totalSwaps}</div>
                <div className="text-xs text-muted-foreground">Total Swaps</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-lg">{displayProfile.rating}</span>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div>
                <div className="font-semibold text-lg">{displayProfile.activeListings}</div>
                <div className="text-xs text-muted-foreground">Active Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Active ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History ({swappedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Your Active Listings</h3>
              <Button size="sm" onClick={() => onTabChange?.('add')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {activeItems.length > 0 ? (
              <div>
                {activeItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">No active listings</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding an item you'd like to swap.
                </p>
                <Button onClick={() => onTabChange?.('add')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Item
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="mb-4">
              <h3 className="font-medium">Swap History</h3>
              <p className="text-sm text-muted-foreground">Items you've successfully swapped</p>
            </div>

            {swappedItems.length > 0 ? (
              <div>
                {swappedItems.map(item => (
                  <ItemCard key={item.id} item={item} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-lg font-medium mb-2">No swap history</h3>
                <p className="text-muted-foreground">
                  Your completed swaps will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileScreen;
