
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from '@supabase/supabase-js';

interface RequestsScreenProps {
  user: User;
}

interface SwapRequest {
  id: string;
  type: "incoming" | "outgoing";
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  offered_item: {
    id: string;
    title: string;
    images: string[];
    owner: string;
  };
  requested_item: {
    id: string;
    title: string;
    images: string[];
    owner: string;
  };
}

const RequestsScreen = ({ user }: RequestsScreenProps) => {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const { toast } = useToast();

  const { messages, sendMessage, sendImage, loading: chatLoading } = useRealTimeChat(user, selectedRequestId || undefined);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          offered_item:swap_items!swap_requests_offered_item_id_fkey (
            id,
            title,
            images,
            profiles!swap_items_user_id_fkey (display_name)
          ),
          requested_item:swap_items!swap_requests_requested_item_id_fkey (
            id,
            title,
            images,
            profiles!swap_items_user_id_fkey (display_name)
          )
        `)
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data.map(request => ({
        id: request.id,
        type: (request.requester_id === user.id ? 'outgoing' : 'incoming') as 'outgoing' | 'incoming',
        status: request.status as 'pending' | 'accepted' | 'rejected',
        message: request.message,
        created_at: request.created_at,
        offered_item: {
          id: request.offered_item?.id || '',
          title: request.offered_item?.title || 'Unknown Item',
          images: request.offered_item?.images || [],
          owner: request.offered_item?.profiles?.display_name || 'User'
        },
        requested_item: {
          id: request.requested_item?.id || '',
          title: request.requested_item?.title || 'Unknown Item',  
          images: request.requested_item?.images || [],
          owner: request.requested_item?.profiles?.display_name || 'User'
        }
      }));

      setRequests(formattedRequests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load swap requests",
        variant: "destructive",
      });
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: "accepted" as const }
            : req
        )
      );

      toast({
        title: "Request Accepted",
        description: "The swap request has been accepted!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: "rejected" as const }
            : req
        )
      );

      toast({
        title: "Request Rejected",
        description: "The swap request has been rejected.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    await sendMessage(messageInput);
    setMessageInput("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await sendImage(file);
    }
  };

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
            <span className="text-xs text-muted-foreground">
              {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Swap Items */}
          <div className="flex items-center space-x-3 mb-4">
            {/* Offered Item */}
            <div className="flex-1">
              <div className="aspect-square w-16 rounded-lg overflow-hidden bg-muted mb-2">
                <img 
                  src={request.offered_item.images[0] || "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400"} 
                  alt={request.offered_item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium line-clamp-2">{request.offered_item.title}</p>
              <p className="text-xs text-muted-foreground">by {request.offered_item.owner}</p>
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
                  src={request.requested_item.images[0] || "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400"} 
                  alt={request.requested_item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium line-clamp-2">{request.requested_item.title}</p>
              <p className="text-xs text-muted-foreground">by {request.requested_item.owner}</p>
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
                  size="sm"
                  onClick={() => onAccept(request.id)}
                  className="bg-green-600 hover:bg-green-700"
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

  const incomingRequests = requests.filter(req => req.type === "incoming");
  const outgoingRequests = requests.filter(req => req.type === "outgoing");

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-border">
          <h1 className="text-2xl font-bold">Swap Requests</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Chat Modal */}
      <Dialog open={!!selectedRequestId} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat</DialogTitle>
          </DialogHeader>
          
          {chatLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          message.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.message_type === 'image' ? (
                          <img 
                            src={message.image_url} 
                            alt="Shared image" 
                            className="max-w-full h-auto rounded"
                          />
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="icon" as="span">
                    📷
                  </Button>
                </label>
                <Button onClick={handleSendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsScreen;
