
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

interface AddItemScreenProps {
  user: User;
  onBack?: () => void;
}

const AddItemScreen = ({ user, onBack }: AddItemScreenProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [preferredItems, setPreferredItems] = useState<string[]>([]);
  const [currentPreferredItem, setCurrentPreferredItem] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    "Electronics", "Fashion", "Books", "Home & Garden", 
    "Sports", "Toys", "Music", "Art", "Other"
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addPreferredItem = () => {
    if (currentPreferredItem.trim() && !preferredItems.includes(currentPreferredItem.trim())) {
      setPreferredItems(prev => [...prev, currentPreferredItem.trim()]);
      setCurrentPreferredItem("");
    }
  };

  const removePreferredItem = (item: string) => {
    setPreferredItems(prev => prev.filter(i => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get category ID first
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (categoryError) {
        console.error('Category error:', categoryError);
        throw new Error('Failed to find category');
      }

      const { data, error } = await supabase
        .from('swap_items')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category_id: categoryData.id,
          images,
          preferred_items: preferredItems,
          location: location.trim(),
          user_id: user.id,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your item has been listed successfully!",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setImages([]);
      setPreferredItems([]);
      setCurrentPreferredItem("");
      setLocation("");
      
      // Go back to previous screen
      onBack?.();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Item</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you offering?"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location (city, area)"
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Images (Optional)</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </label>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Add up to 5 images</p>
              </div>

              {/* Preferred Items */}
              <div className="space-y-2">
                <Label>What are you looking for?</Label>
                <div className="flex space-x-2">
                  <Input
                    value={currentPreferredItem}
                    onChange={(e) => setCurrentPreferredItem(e.target.value)}
                    placeholder="e.g., iPhone, Books, etc."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPreferredItem();
                      }
                    }}
                  />
                  <Button type="button" onClick={addPreferredItem} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferredItems.map(item => (
                    <Badge key={item} variant="secondary" className="cursor-pointer" onClick={() => removePreferredItem(item)}>
                      {item}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Button - Moved to bottom */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddItemScreen;
