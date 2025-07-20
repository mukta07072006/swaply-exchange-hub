import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, MapPin, Calendar, User, Heart, MessageCircle } from "lucide-react";
import { useSwapItems } from "@/hooks/useSwapItems";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  onSwapRequest: (productId: string) => void;
  currentUserId?: string;
}

const ProductDetailModal = ({ isOpen, onClose, productId, onSwapRequest, currentUserId }: ProductDetailModalProps) => {
  const { items } = useSwapItems();
  const [isFavorite, setIsFavorite] = useState(false);

  const product = items.find(item => item.id === productId);

  if (!product) return null;

  const isOwnProduct = product.user_id === currentUserId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Carousel */}
          <div className="relative">
            {product.images && product.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={image} 
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {product.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No images</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{product.category}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Owner Info */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {product.owner.avatar ? (
                  <img 
                    src={product.owner.avatar} 
                    alt={product.owner.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{product.owner.name}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span>4.8 (12 reviews)</span>
                </div>
              </div>
            </div>

            {/* Location & Date */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{product.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Listed {product.createdAt}</span>
              </div>
            </div>

            {/* Preferred Items */}
            {product.preferredItems && product.preferredItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Looking for:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.preferredItems.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => console.log('Contact owner')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            {!isOwnProduct && (
              <Button
                className="flex-1"
                onClick={() => {
                  onSwapRequest(product.id);
                  onClose();
                }}
              >
                Request Swap
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;