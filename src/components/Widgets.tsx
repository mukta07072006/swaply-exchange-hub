import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  ArrowRight, 
  Zap, 
  Target,
  Award,
  Heart,
  MessageCircle
} from "lucide-react";

interface WidgetProps {
  className?: string;
}

export const StatsWidget = ({ className, user }: WidgetProps & { user?: any }) => {
  const [stats, setStats] = useState([
    { label: "Active Swaps", value: "0", trend: "+0", icon: TrendingUp, color: "text-green-600" },
    { label: "Community", value: "0", trend: "+0%", icon: Users, color: "text-blue-600" },
    { label: "Avg Response", value: "-", trend: "-", icon: Clock, color: "text-purple-600" },
    { label: "Rating", value: "5.0", trend: "+0", icon: Star, color: "text-yellow-600" },
  ]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total items count for community stat
        const { count: totalItems } = await supabase
          .from('swap_items')
          .select('*', { count: 'exact', head: true });
          
        // Get user's active items
        const { count: userActiveItems } = await supabase
          .from('swap_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('status', 'available');
          
        // Get user's real rating from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('rating')
          .eq('user_id', user?.id)
          .single();
          
        setStats([
          { label: "Active Items", value: userActiveItems?.toString() || "0", trend: "+0", icon: TrendingUp, color: "text-green-600" },
          { label: "Total Items", value: totalItems?.toString() || "0", trend: "+0%", icon: Users, color: "text-blue-600" },
          { label: "Avg Response", value: "2h", trend: "-", icon: Clock, color: "text-purple-600" },
          { label: "Rating", value: profile?.rating?.toString() || "5.0", trend: "+0", icon: Star, color: "text-yellow-600" },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center space-y-1">
                <div className={`flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4 w-4 mr-1" />
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="flex items-center justify-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const TrendingWidget = ({ className }: WidgetProps) => {
  const [trending, setTrending] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase
          .from('swap_items')
          .select(`
            categories (name),
            category_id
          `)
          .eq('status', 'available');
          
        if (error) throw error;
        
        // Count items per category
        const categoryCounts: Record<string, number> = {};
        data?.forEach(item => {
          const categoryName = item.categories?.name || 'Other';
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        });
        
        // Convert to trending format
        const trendingData = Object.entries(categoryCounts)
          .map(([category, count]) => ({
            category,
            count,
            change: '+0%' // TODO: Implement real change tracking
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
          
        setTrending(trendingData);
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    
    fetchTrending();
  }, []);

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Trending Categories</h3>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <div className="space-y-2">
          {trending.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                <span className="text-sm">{item.category}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="mr-2 font-medium">{item.count}</span>
                <span className="text-green-600">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActionsWidget = ({ className, onAction }: WidgetProps & { onAction?: (action: string) => void }) => {
  const actions = [
    { id: "add-item", label: "Add Item", icon: Target, color: "bg-blue-500" },
    { id: "my-items", label: "My Items", icon: Award, color: "bg-purple-500" },
    { id: "favorites", label: "Favorites", icon: Heart, color: "bg-red-500" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "bg-green-500" },
  ];

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="h-16 flex flex-col space-y-1 hover:bg-muted/50"
                onClick={() => onAction?.(action.id)}
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentActivityWidget = ({ className, user }: WidgetProps & { user?: any }) => {
  const [activities, setActivities] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Get recent items added by user
        const { data: recentItems, error } = await supabase
          .from('swap_items')
          .select('id, title, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Get user profiles for the items
        const userIds = [...new Set(recentItems?.map(item => item.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        const formattedActivities = recentItems?.map(item => {
          const profile = profiles?.find(p => p.user_id === item.user_id);
          return {
            type: "item",
            text: `${profile?.display_name || 'Someone'} added ${item.title}`,
            time: new Date(item.created_at).toLocaleDateString(),
            icon: "📦"
          };
        }) || [];
        
        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([
          { type: "swap", text: "No recent activity", time: "now", icon: "📭" }
        ]);
      }
    };
    
    fetchRecentActivity();
  }, [user]);

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="text-xs">
            See All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="text-lg">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const AIInsightsWidget = ({ className }: WidgetProps) => {
  const [insight, setInsight] = useState(0);
  const insights = [
    {
      title: "Price Optimization",
      text: "Your iPhone could get 15% more interest if paired with accessories",
      action: "Add accessories",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      title: "Best Time to Post",
      text: "Post between 6-8 PM for 40% more visibility in your area",
      action: "Schedule post",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      title: "Match Opportunity",
      text: "3 users nearby are looking for items like yours",
      action: "View matches",
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    }
  ];

  const currentInsight = insights[insight];

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-0">
        <div className={`${currentInsight.color} p-4 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-20">
            <Zap className="h-16 w-16" />
          </div>
          <div className="relative">
            <div className="flex items-center mb-2">
              <Badge variant="secondary" className="text-xs mb-1 bg-white/20 text-white">
                AI Insight
              </Badge>
            </div>
            <h3 className="font-semibold text-sm mb-1">{currentInsight.title}</h3>
            <p className="text-xs opacity-90 mb-3">{currentInsight.text}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs h-6"
              onClick={() => setInsight((insight + 1) % insights.length)}
            >
              {currentInsight.action}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SwapProgressWidget = ({ className }: WidgetProps) => {
  const progress = 75;
  
  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Monthly Goal</h3>
          <span className="text-xs text-muted-foreground">3/4 swaps</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 more to unlock Premium badge</span>
          <span>{progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
};