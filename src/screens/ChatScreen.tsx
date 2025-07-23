import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Mic,
  Check,
  CheckCheck,
  Star,
  MapPin,
  Camera,
  Paperclip
} from "lucide-react";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";

const RatingDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  recipientName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (rating: number, comment: string) => void;
  recipientName: string;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
    setRating(5);
    setComment("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="mt-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ChatScreenProps {
  user: any;
  recipientName: string;
  recipientUserId?: string;
  swapRequestId?: string;
  recipientAvatar?: string;
  swapItem?: {
    title: string;
    image: string;
  };
  onBack: () => void;
}

const ChatScreen = ({ user, recipientName, recipientUserId, swapRequestId, recipientAvatar, swapItem, onBack }: ChatScreenProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sendMessage, sendImage, submitRating } = useRealTimeChat(user, swapRequestId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const startVoiceRecord = () => {
    setIsRecording(true);
    // Mock voice recording
    setTimeout(() => {
      setIsRecording(false);
    }, 3000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendImage(file);
    }
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (recipientUserId && swapRequestId) {
      submitRating(recipientUserId, rating, comment, swapRequestId);
    }
  };

  const MessageBubble = ({ message }: { message: any }) => {
    const isMe = message.sender_id === user.id;
    const isSystem = message.message_type === "system";
    
    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            {message.content}
          </Badge>
        </div>
      );
    }

    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 animate-fade-in`}>
        <div className={`max-w-[80%] ${isMe ? "order-2" : "order-1"}`}>
          {!isMe && (
            <div className="flex items-center mb-1">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback className="text-xs">
                  {recipientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{recipientName}</span>
            </div>
          )}
          
          <div
            className={`rounded-2xl px-4 py-2 ${
              isMe
                ? "bg-primary text-primary-foreground ml-2"
                : "bg-muted text-foreground mr-2"
            }`}
          >
            {message.message_type === "image" ? (
              <div className="space-y-2">
                <img 
                  src={message.image_url} 
                  alt="Shared" 
                  className="rounded-lg max-w-full h-32 object-cover"
                />
                <p className="text-sm">{message.content}</p>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
          
          <div className={`flex items-center mt-1 text-xs text-muted-foreground ${isMe ? "justify-end" : "justify-start"}`}>
            <span>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
              <div className="ml-1">
                {message.status === "sent" && <Check className="w-3 h-3" />}
                {message.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                {message.status === "read" && <CheckCheck className="w-3 h-3 text-primary" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Setting up chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="w-10 h-10 mr-3">
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{recipientName}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Online</span>
                <Star className="w-3 h-3 ml-2 mr-1 text-yellow-500" />
                <span>5.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowRatingDialog(true)}>
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <RatingDialog 
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        onSubmit={handleRatingSubmit}
        recipientName={recipientName}
      />

      {/* Swap Item Widget */}
      {swapItem && (
        <div className="mx-4 mt-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={swapItem.image} 
                  alt={swapItem.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Swap Item</p>
                  <p className="text-xs text-muted-foreground">{swapItem.title}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Widget */}
      <div className="px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => setNewMessage("Can we schedule a meetup?")}
          >
            <MapPin className="w-3 h-3 mr-1" />
            Meet Up
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => setNewMessage("Can you send more photos?")}
          >
            <Camera className="w-3 h-3 mr-1" />
            Request Photos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => setNewMessage("This looks great! Let's proceed with the swap.")}
          >
            ✅ Accept Swap
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3">
        <div className="flex items-center space-x-2">
          <label htmlFor="image-upload">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon"
              type="button"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </label>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="pr-10"
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          {newMessage.trim() ? (
            <Button onClick={handleSendMessage} size="icon" className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant={isRecording ? "destructive" : "ghost"} 
              size="icon"
              onClick={startVoiceRecord}
              className={isRecording ? "animate-pulse" : ""}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;