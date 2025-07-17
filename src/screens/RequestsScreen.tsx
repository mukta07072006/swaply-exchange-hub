import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Clock } from "lucide-react";

interface SwapRequest {
  id: string;
  type: "incoming" | "outgoing";
  status: "pending" | "accepted" | "rejected";
  offeredItem: {
    id: string;
    title: string;
    image: string;
    owner: string;
  };
  requestedItem: {
    id: string;
    title: string;
    image: string;
    owner: string;
  };
  message?: string;
  createdAt: string;
}

// Mock data
const mockRequests: SwapRequest[] = [
  {
    id: "1",
    type: "incoming",
    status: "pending",
    offeredItem: {
      id: "offer1",
      title: "iPad Pro 11\"",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
      owner: "John Doe"
    },
    requestedItem: {
      id: "req1",
      title: "iPhone 13 Pro",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      owner: "You"
    },
    message: "Hi! I'm interested in trading my iPad for your iPhone. It's in excellent condition with original packaging.",
    createdAt: "2 hours ago"
  },
  {
    id: "2",
    type: "outgoing",
    status: "accepted",
    offeredItem: {
      id: "offer2",
      title: "Vintage Leather Jacket",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      owner: "You"
    },
    requestedItem: {
      id: "req2",
      title: "Designer Watch",
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400",
      owner: "Sarah Wilson"
    },
    createdAt: "1 day ago"
  },
  {
    id: "3",
    type: "incoming",
    status: "rejected",
    offeredItem: {
      id: "offer3",
      title: "Mountain Bike",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
      owner: "Mike Rodriguez"
    },
    requestedItem: {
      id: "req3",
      title: "Road Bike",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
      owner: "You"
    },
    createdAt: "3 days ago"
  }
];

const RequestCard = ({ request, onAccept, onReject, onMessage }: {
  request: SwapRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMessage: (id: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3 mr-1" />;
      case "accepted": return <Check className="h-3 w-3 mr-1" />;
      case "rejected": return <X className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Card className="mb-4 animate-fade-in">
      <CardContent className="p-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center mb-3">
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground">{request.createdAt}</span>
        </div>

        {/* Swap Items */}
        <div className="flex items-center space-x-3 mb-4">
          {/* Offered Item */}
          <div className="flex-1">
            <div className="aspect-square w-16 rounded-lg overflow-hidden bg-muted mb-2">
              <img 
                src={request.offeredItem.image} 
                alt={request.offeredItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm font-medium line-clamp-2">{request.offeredItem.title}</p>
            <p className="text-xs text-muted-foreground">by {request.offeredItem.owner}</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center text-muted-foreground">
            <div className="text-2xl">⇄</div>
            <span className="text-xs">swap</span>
          </div>

          {/* Requested Item */}
          <div className="flex-1">
            <div className="aspect-square w-16 rounded-lg overflow-hidden bg-muted mb-2">
              <img 
                src={request.requestedItem.image} 
                alt={request.requestedItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm font-medium line-clamp-2">{request.requestedItem.title}</p>
            <p className="text-xs text-muted-foreground">by {request.requestedItem.owner}</p>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm">{request.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(request.id)}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
          
          {request.type === "incoming" && request.status === "pending" && onAccept && onReject && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(request.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => onAccept(request.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RequestsScreen = () => {
  const [requests, setRequests] = useState(mockRequests);

  const handleAccept = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "accepted" as const }
          : req
      )
    );
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "rejected" as const }
          : req
      )
    );
  };

  const handleMessage = (requestId: string) => {
    console.log("Opening chat for request:", requestId);
    // This would navigate to the chat screen
  };

  const incomingRequests = requests.filter(req => req.type === "incoming");
  const outgoingRequests = requests.filter(req => req.type === "outgoing");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">Swap Requests</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="incoming" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="incoming" className="flex-1">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex-1">
              Sent ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="flex-1 overflow-y-auto px-4 py-4 pb-20">
            {incomingRequests.length > 0 ? (
              <div>
                {incomingRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📬</div>
                <h3 className="text-lg font-medium mb-2">No incoming requests</h3>
                <p className="text-muted-foreground">
                  When someone wants to swap with your items, requests will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="flex-1 overflow-y-auto px-4 py-4 pb-20">
            {outgoingRequests.length > 0 ? (
              <div>
                {outgoingRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-lg font-medium mb-2">No sent requests</h3>
                <p className="text-muted-foreground">
                  Start browsing items and make your first swap request!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RequestsScreen;