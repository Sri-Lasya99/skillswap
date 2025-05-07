import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { customApiRequest } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User, UserSkill } from "@shared/schema";

interface ChatMessage {
  id: string;
  isBot: boolean;
  text: string;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      isBot: true,
      text: "Hi there! I'm SkillBot, your personal assistant. How can I help you with skill-sharing today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user data
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/current"],
    queryFn: getQueryFn<User>({ on401: "throw" }),
  });

  // Get user skills
  const { data: userSkills } = useQuery({
    queryKey: ["/api/users/current/skills"],
    queryFn: getQueryFn<UserSkill[]>({ on401: "throw" }),
  });

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessageId = Date.now().toString();

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        isBot: false,
        text: input,
        timestamp: new Date(),
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      // Send to backend
      const response = await customApiRequest("/api/chatbot", "POST", {
        message: input,
      });
      const data = await response.json();

      // Add bot response when it arrives
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          isBot: true,
          text: data?.message || "Sorry, I couldn't process your request.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          isBot: true,
          text: "Sorry, I'm having trouble responding right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              aria-label="Open chat assistant"
            >
              {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Close" : "Open"} chat assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chatbot dialog */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 h-[450px] glass border border-white/10 shadow-xl rounded-lg flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-white/10 bg-card/80 backdrop-blur-md flex items-center">
            <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xs">SB</span>
            </div>
            <div className="ml-2">
              <h3 className="text-sm font-medium text-white">SkillBot</h3>
              <p className="text-xs text-muted-foreground">
                Your skill-sharing assistant
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.isBot
                      ? "bg-card/80 text-foreground"
                      : "bg-primary/20 text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs text-muted-foreground block text-right mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg bg-card/80 text-foreground">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-white/10 bg-card/80 backdrop-blur-md flex"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="glass-input flex-1 bg-black/20 text-sm py-2 px-3 rounded-l-md focus:outline-none"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-l-none"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
