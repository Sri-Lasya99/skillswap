import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Leaderboard from "@/pages/leaderboard";
import Upload from "@/pages/upload";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/layout/sidebar";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="pl-20 md:pl-64 w-full">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/matches" component={Matches} />
          <Route path="/messages" component={Messages} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/upload" component={Upload} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <div className="animated-bg"></div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ChatbotWidget />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
