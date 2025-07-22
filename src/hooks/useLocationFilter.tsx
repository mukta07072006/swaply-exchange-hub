import { useState, useEffect } from 'react';

export const useLocationFilter = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

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

  const filterItemsByLocation = (items: any[]) => {
    if (!selectedLocation || selectedLocation === 'all') {
      return items;
    }
    
    return items.filter(item => 
      item.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    );
  };

  return {
    selectedLocation,
    showLocationSelector,
    setShowLocationSelector,
    handleLocationSelect,
    filterItemsByLocation
  };
};