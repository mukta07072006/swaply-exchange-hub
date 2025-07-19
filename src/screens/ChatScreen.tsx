import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface ChatScreenProps {
  user: any;
  recipientName: string;
  recipientUserId?: string;
  swapItemId?: string;
  recipientAvatar?: string;
  swapItem?: {
    title: string;
    image: string;
  };
  onBack: () => void;
}

const ChatScreen = ({ user, recipientName, recipientUserId, swapItemId, recipientAvatar, swapItem, onBack }: ChatScreenProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sendMessage } = useRealTimeChat(user, recipientUserId, swapItemId);

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

  const handleSendImage = () => {
    // TODO: Implement image upload to storage
    sendMessage("Photo", "image", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400");
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
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSendImage}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
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