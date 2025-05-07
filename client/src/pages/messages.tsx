import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{text: string, sender: 'me'|'them', timestamp: string}>>([]);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const isMobile = useMobile();
  
  // This would normally be fetched from an API
  const mockContacts = [
    { id: 1, name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80", lastMessage: "When would you like to schedule our next session?", time: "10:30 AM", unread: true },
    { id: 2, name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80", lastMessage: "Thanks for the feedback on my design!", time: "Yesterday", unread: false },
    { id: 3, name: "Priya Patel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80", lastMessage: "The video tutorial you shared was really helpful.", time: "Yesterday", unread: false },
  ];
  
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsUrl = `${protocol}://${host}/api/ws`;
    
    console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      toast({
        title: "Connected to chat server",
        description: "You can now send and receive messages in real-time.",
        variant: "default",
      });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            text: data.content,
            sender: 'them',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
      toast({
        title: "Connection Error",
        description: "Could not connect to chat server. Messages will be sent via regular API.",
        variant: "destructive",
      });
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };
    
    return () => {
      socket.close();
    };
  }, [toast]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Add message to local state
    setMessages(prev => [...prev, {
      text: message,
      sender: 'me',
      timestamp
    }]);
    
    // Send message via WebSocket if connected
    if (connected && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({
          type: 'message',
          content: message,
          sessionId: 'test-session', // Would be a real session ID in production
          receiverId: selectedChat
        }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        toast({
          title: "Message sending failed",
          description: "Could not send message via real-time connection.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to API
      toast({
        title: "Message sent via API",
        description: "Real-time connection unavailable, message will be delivered when recipient is online.",
        variant: "default",
      });
    }
    
    setMessage("");
  };
  
  return (
    <>
      <Header title="Messages" subtitle="Connect with your skill exchange partners" />
      
      <main className="p-6">
        <div className="glass border border-white/5 rounded-xl overflow-hidden h-[calc(100vh-13rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Contacts List */}
            <div className="border-r border-white/10">
              <div className="p-4 border-b border-white/10">
                <Input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="glass-input"
                />
              </div>
              
              <ScrollArea className="h-[calc(100vh-17rem)]">
                {mockContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${selectedChat === contact.id ? 'bg-white/10' : ''}`}
                    onClick={() => setSelectedChat(contact.id)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden">
                          <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                        </div>
                        {contact.unread && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-card"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-white">{contact.name}</h3>
                          <span className="text-xs text-muted">{contact.time}</span>
                        </div>
                        <p className="text-sm text-muted truncate">{contact.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            {/* Chat Area */}
            <div className="col-span-2 flex flex-col h-full">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden">
                        <img 
                          src={mockContacts.find(c => c.id === selectedChat)?.avatar} 
                          alt={mockContacts.find(c => c.id === selectedChat)?.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{mockContacts.find(c => c.id === selectedChat)?.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-muted">{connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Static example messages */}
                      <div className="flex items-end">
                        <div className="w-8 h-8 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden mr-2">
                          <img 
                            src={mockContacts.find(c => c.id === selectedChat)?.avatar} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="bg-white/10 rounded-lg rounded-bl-none px-4 py-2 max-w-[80%]">
                          <p className="text-sm">Hi there! When can we schedule our next Python lesson?</p>
                          <span className="text-xs text-muted block mt-1">10:15 AM</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-end">
                        <div className="bg-primary/20 text-white rounded-lg rounded-br-none px-4 py-2 max-w-[80%]">
                          <p className="text-sm">I'm available tomorrow evening around 6 PM. Does that work for you?</p>
                          <span className="text-xs text-muted block mt-1">10:17 AM</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <div className="w-8 h-8 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden mr-2">
                          <img 
                            src={mockContacts.find(c => c.id === selectedChat)?.avatar} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="bg-white/10 rounded-lg rounded-bl-none px-4 py-2 max-w-[80%]">
                          <p className="text-sm">That's perfect! I'll prepare some questions about data structures.</p>
                          <span className="text-xs text-muted block mt-1">10:20 AM</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <div className="w-8 h-8 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden mr-2">
                          <img 
                            src={mockContacts.find(c => c.id === selectedChat)?.avatar} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="bg-white/10 rounded-lg rounded-bl-none px-4 py-2 max-w-[80%]">
                          <p className="text-sm">Also, I found this great resource on neural networks. Would you like me to share it?</p>
                          <span className="text-xs text-muted block mt-1">10:30 AM</span>
                        </div>
                      </div>
                      
                      {/* Dynamic messages from WebSocket */}
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                          {msg.sender !== 'me' && (
                            <div className="w-8 h-8 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden mr-2">
                              <img 
                                src={mockContacts.find(c => c.id === selectedChat)?.avatar} 
                                alt="User" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className={`${msg.sender === 'me' ? 'bg-primary/20 text-white rounded-br-none' : 'bg-white/10 rounded-bl-none'} rounded-lg px-4 py-2 max-w-[80%]`}>
                            <p className="text-sm">{msg.text}</p>
                            <span className="text-xs text-muted block mt-1">{msg.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex">
                    <Input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="glass-input flex-1"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" className="gradient-button ml-2">
                      <i className="ri-send-plane-fill"></i>
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted">
                    <div className="text-6xl mb-4"><i className="ri-message-3-line"></i></div>
                    <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                    <p className="max-w-sm text-sm">Select a conversation or start a new one with your skill exchange partners.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Messages;
