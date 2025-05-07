import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="glass border border-white/10 rounded-xl p-8 w-full max-w-md mx-4 shadow-glow">
        <div className="flex items-center mb-6 gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">404</h1>
            <p className="text-muted">Page Not Found</p>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg mb-6">
          <p className="text-white/80">
            We couldn't find the page you were looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 border-white/10 hover:bg-white/5"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            className="gradient-button flex items-center justify-center gap-2"
            onClick={() => setLocation("/")}
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
