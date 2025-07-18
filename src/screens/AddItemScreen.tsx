import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

interface AddItemScreenProps {
  user: User;
}

const AddItemScreen = ({ user }: AddItemScreenProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [preferredItems, setPreferredItems] = useState<string[]>([]);
  const [newPreferredItem, setNewPreferredItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    };
    
    fetchCategories();
  }, []);

  const handleImageUpload = () => {
    // Mock image upload - in real app, this would use file picker and storage
    const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400`;
    if (images.length < 4) {
      setImages([...images, mockImageUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addPreferredItem = () => {
    if (newPreferredItem.trim() && !preferredItems.includes(newPreferredItem.trim())) {
      setPreferredItems([...preferredItems, newPreferredItem.trim()]);
      setNewPreferredItem("");
    }
  };

  const removePreferredItem = (item: string) => {
    setPreferredItems(preferredItems.filter(i => i !== item));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !categoryId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('swap_items')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          images,
          preferred_items: preferredItems,
          location: 'San Francisco, CA', // Default location
          status: 'available'
        });

      if (error) throw error;

      toast({
        title: "Item Posted!",
        description: "Your item has been successfully added to the marketplace.",
      });
      
      // Reset form
      setImages([]);
      setTitle("");
      setDescription("");
      setCategoryId("");
      setPreferredItems([]);
      setNewPreferredItem("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Add New Item</h1>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="min-w-[80px]"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="space-y-6">
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
              <p className="text-sm text-muted-foreground">Add up to 4 photos of your item</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 4 && (
                  <button
                    onClick={handleImageUpload}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Camera className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add Photo</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you offering?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail..."
                  className="min-h-[100px] w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferred Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What are you looking for?</CardTitle>
              <p className="text-sm text-muted-foreground">Add items you'd like to receive in exchange</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPreferredItem}
                  onChange={(e) => setNewPreferredItem(e.target.value)}
                  placeholder="e.g., iPhone, Books, Bike"
                  onKeyPress={(e) => e.key === "Enter" && addPreferredItem()}
                  className="flex-1"
                />
                <Button onClick={addPreferredItem} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {preferredItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferredItems.map((item, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {item}
                      <button
                        onClick={() => removePreferredItem(item)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddItemScreen;