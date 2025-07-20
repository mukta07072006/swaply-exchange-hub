import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  onLocationSelect: (location: string) => void;
  initialLocation?: string;
}

const popularLocations = [
  "New York, NY",
  "Los Angeles, CA", 
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA"
];

const LocationSelector = ({ onLocationSelect, initialLocation }: LocationSelectorProps) => {
  const [customLocation, setCustomLocation] = useState(initialLocation || "");

  const handleLocationClick = (location: string) => {
    onLocationSelect(location);
  };

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      onLocationSelect(customLocation.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Set Your Location</CardTitle>
        <p className="text-muted-foreground text-sm">
          Choose your location to see nearby items for swapping
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Location Input */}
        <div className="space-y-2">
          <Input
            placeholder="Enter your location"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomLocation()}
          />
          <Button 
            onClick={handleCustomLocation}
            className="w-full"
            disabled={!customLocation.trim()}
          >
            Use This Location
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or choose popular locations
            </span>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="grid grid-cols-1 gap-2">
          {popularLocations.map((location) => (
            <Button
              key={location}
              variant="outline"
              onClick={() => handleLocationClick(location)}
              className="justify-start h-auto py-3 text-left"
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              {location}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;