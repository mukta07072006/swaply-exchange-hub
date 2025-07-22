import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Heart, MapPin } from "lucide-react";

interface SwapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  preferredItems: string[];
  location: string;
  user_id: string;
  owner: {
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface SwapCardProps {
  item: SwapItem;
  onRequestSwap: (itemId: string) => void;
  onToggleFavorite?: (itemId: string) => void;
  isFavorited?: boolean;
  currentUserId?: string;
  onClick?: () => void;
}

const SwapCard = ({ item, onRequestSwap, onToggleFavorite, isFavorited, currentUserId, onClick }: SwapCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <Card 
      className="mb-4 overflow-hidden hover:shadow-card transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      {/* Image Carousel */}
      <div className="relative aspect-square bg-muted">
        {item.images.length > 0 ? (
          <>
            <img
              src={item.images[currentImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.images.length > 1 && (
              <>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {item.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 right-2 bg-black/30 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{item.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="absolute top-2 left-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {item.location}
            </div>
          </div>
          <Badge variant="secondary">{item.category}</Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Preferred Items */}
        <div className="mb-4">
          <div className="flex items-center text-sm font-medium text-foreground mb-2">
            <ArrowRightLeft className="h-4 w-4 mr-1 text-primary" />
            Looking for:
          </div>
          <div className="flex flex-wrap gap-1">
            {item.preferredItems.slice(0, 3).map((preferredItem, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {preferredItem}
              </Badge>
            ))}
            {item.preferredItems.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.preferredItems.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Owner and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-primary">
                {item.owner.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{item.owner.name}</p>
              <p className="text-xs text-muted-foreground">{item.createdAt}</p>
            </div>
          </div>
          
          {currentUserId && currentUserId !== item.user_id ? (
            <Button
              size="sm"
              onClick={() => onRequestSwap(item.id)}
              className="ml-2"
            >
              Request Swap
            </Button>
          ) : currentUserId === item.user_id ? (
            <Badge variant="outline" className="ml-2">
              Your Item
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapCard;