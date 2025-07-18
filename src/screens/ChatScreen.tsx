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
  Image as ImageIcon, 
  Smile, 
  Mic,
  Check,
  CheckCheck,
  Star,
  MapPin,
  Camera,
  Paperclip
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "system";
  image?: string;
}

interface ChatScreenProps {
  user: any;
  recipientName: string;
  recipientAvatar?: string;
  swapItem?: {
    title: string;
    image: string;
  };
  onBack: () => void;
}

const ChatScreen = ({ user, recipientName, recipientAvatar, swapItem, onBack }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "System: Swap request sent for iPhone 13 Pro",
      sender: "other",
      timestamp: "10:30 AM",
      status: "read",
      type: "system"
    },
    {
      id: "2",
      text: "Hi! I'm interested in your iPhone. Is it still available?",
      sender: "other",
      timestamp: "10:32 AM",
      status: "read",
      type: "text"
    },
    {
      id: "3",
      text: "Yes, it's available! What would you like to trade for it?",
      sender: "me",
      timestamp: "10:35 AM",
      status: "read",
      type: "text"
    },
    {
      id: "4",
      text: "I have an iPad Pro 11\" that I'd like to trade. It's in excellent condition.",
      sender: "other",
      timestamp: "10:36 AM",
      status: "read",
      type: "text"
    },
    {
      id: "5",
      text: "That sounds perfect! Can you send me some photos?",
      sender: "me",
      timestamp: "10:38 AM",
      status: "delivered",
      type: "text"
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: "text"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    }, 1000);
  };

  const startVoiceRecord = () => {
    setIsRecording(true);
    // Mock voice recording
    setTimeout(() => {
      setIsRecording(false);
    }, 3000);
  };

  const sendImage = () => {
    const imageMessage: Message = {
      id: Date.now().toString(),
      text: "Photo",
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: "image",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
    };
    setMessages(prev => [...prev, imageMessage]);
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isMe = message.sender === "me";
    const isSystem = message.type === "system";
    
    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            {message.text}
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
            {message.type === "image" ? (
              <div className="space-y-2">
                <img 
                  src={message.image} 
                  alt="Shared" 
                  className="rounded-lg max-w-full h-32 object-cover"
                />
                <p className="text-sm">{message.text}</p>
              </div>
            ) : (
              <p className="text-sm">{message.text}</p>
            )}
          </div>
          
          <div className={`flex items-center mt-1 text-xs text-muted-foreground ${isMe ? "justify-end" : "justify-start"}`}>
            <span>{message.timestamp}</span>
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
                <span>4.8</span>
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
        
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-muted rounded-2xl px-4 py-2 mr-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        
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
            onClick={sendImage}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
            <Button onClick={sendMessage} size="icon" className="rounded-full">
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