import { useState } from "react";
import AuthScreen from "@/screens/AuthScreen";
import HomeScreen from "@/screens/HomeScreen";
import AddItemScreen from "@/screens/AddItemScreen";
import RequestsScreen from "@/screens/RequestsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "add":
        return <AddItemScreen />;
      case "requests":
        return <RequestsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderActiveScreen()}
      </div>
      
      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
