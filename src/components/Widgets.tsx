import { useState } from "react";
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

export const StatsWidget = ({ className }: WidgetProps) => {
  const stats = [
    { label: "Active Swaps", value: "12", trend: "+3", icon: TrendingUp, color: "text-green-600" },
    { label: "Community", value: "2.4K", trend: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Avg Response", value: "2h", trend: "-15m", icon: Clock, color: "text-purple-600" },
    { label: "Rating", value: "4.9", trend: "+0.1", icon: Star, color: "text-yellow-600" },
  ];

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
  const trending = [
    { category: "Electronics", count: 45, change: "+12%" },
    { category: "Fashion", count: 32, change: "+8%" },
    { category: "Books", count: 28, change: "+15%" },
    { category: "Sports", count: 19, change: "+5%" },
  ];

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
    { id: "smart-match", label: "Smart Match", icon: Target, color: "bg-blue-500" },
    { id: "featured", label: "Feature Item", icon: Award, color: "bg-purple-500" },
    { id: "saved", label: "Saved Items", icon: Heart, color: "bg-red-500" },
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

export const RecentActivityWidget = ({ className }: WidgetProps) => {
  const activities = [
    { type: "swap", text: "John swapped iPhone for iPad", time: "2h ago", icon: "🔄" },
    { type: "join", text: "Sarah joined your area", time: "4h ago", icon: "👋" },
    { type: "match", text: "New match found for your bike", time: "6h ago", icon: "✨" },
    { type: "review", text: "You received a 5-star review", time: "1d ago", icon: "⭐" },
  ];

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