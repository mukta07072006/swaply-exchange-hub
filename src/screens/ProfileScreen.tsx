import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Edit3, Star, Calendar, MapPin, Plus } from "lucide-react";
import type { User } from '@supabase/supabase-js';

interface ProfileScreenProps {
  user: User;
}

// Mock user data
const mockUser = {
  id: "user1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  location: "San Francisco, CA",
  joinDate: "January 2024",
  rating: 4.8,
  totalSwaps: 12,
  activeListings: 3,
  completedSwaps: 9,
  avatar: ""
};

// Mock user's items
const mockUserItems = [
  {
    id: "1",
    title: "iPhone 13 Pro",
    description: "Excellent condition iPhone 13 Pro with original box and charger.",
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"],
    preferredItems: ["MacBook", "iPad", "Android Phone"],
    status: "active",
    createdAt: "2 days ago",
    views: 24,
    requests: 3
  },
  {
    id: "2",
    title: "Vintage Camera",
    description: "Classic film camera in working condition.",
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400"],
    preferredItems: ["Lens", "Photography Equipment"],
    status: "active",
    createdAt: "1 week ago",
    views: 18,
    requests: 1
  },
  {
    id: "3",
    title: "Designer Sneakers",
    description: "Limited edition sneakers, size 10.",
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"],
    preferredItems: ["Other Sneakers", "Fashion Items"],
    status: "swapped",
    createdAt: "2 weeks ago",
    views: 45,
    requests: 8
  }
];

const ProfileScreen = ({ user }: ProfileScreenProps) => {
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        const { data, error } = await supabase
          .from('swap_items')
          .select(`
            *,
            categories (name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedItems = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.categories?.name || 'Other',
          images: item.images || [],
          preferredItems: item.preferred_items || [],
          status: item.status,
          createdAt: new Date(item.created_at).toLocaleDateString(),
          views: 0, // TODO: Implement view tracking
          requests: 0 // TODO: Implement request counting
        }));
        
        setUserItems(formattedItems);
      } catch (error) {
        console.error('Error fetching user items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserItems();
  }, [user.id]);
  
  // Use actual user data when available, fall back to mock for display info
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const userProfile = {
    name: displayName,
    email: user.email || '',
    location: 'Location not set',
    rating: 5.0,
    totalSwaps: 0,
    activeListings: userItems.filter(item => item.status === "active").length
  };

  const activeItems = userItems.filter(item => item.status === "active");
  const swappedItems = userItems.filter(item => item.status === "swapped");

  const ItemCard = ({ item, showActions = true }: { item: any; showActions?: boolean }) => (
    <Card className="mb-4 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img 
              src={item.images[0]} 
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
                variant={item.status === "active" ? "default" : "secondary"}
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
            
            {showActions && item.status === "active" && (
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
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
                  {userProfile.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {userProfile.location}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-lg">{userProfile.totalSwaps}</div>
                <div className="text-xs text-muted-foreground">Total Swaps</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-lg">{userProfile.rating}</span>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div>
                <div className="font-semibold text-lg">{userProfile.activeListings}</div>
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
                <Button size="sm" onClick={() => window.location.hash = '#add'}>
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
                <Button onClick={() => window.location.hash = '#add'}>
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