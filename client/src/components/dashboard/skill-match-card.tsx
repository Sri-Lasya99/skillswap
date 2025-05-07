import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SkillMatchWithUsers } from "@shared/schema";
import { 
  User, 
  MessageCircle, 
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillMatchCardProps {
  match: SkillMatchWithUsers;
}

const SkillMatchCard = ({ match }: SkillMatchCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const connect = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/connect/${match.id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Connection request sent to ${match.targetUser.username}`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to connect",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const viewProfile = () => {
    setLocation(`/profile?id=${match.targetUser.id}`);
  };

  const startChat = () => {
    setLocation(`/messages?user=${match.targetUser.id}`);
  };

  const viewDetails = () => {
    toast({
      title: "Match Details",
      description: `This match was created on ${new Date(match.createdAt).toLocaleDateString()}. You both share interests in ${match.teachSkill.skill.name} and ${match.learnSkill.skill.name}.`,
    });
  };

  return (
    <div className="glass border border-white/10 hover:border-primary/30 p-4 rounded-lg mb-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden cursor-pointer"
            onClick={viewProfile}
          >
            {match.targetUser.avatar ? (
              <img src={match.targetUser.avatar} alt={match.targetUser.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-white">
                {match.targetUser.username.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-white cursor-pointer hover:text-primary" onClick={viewProfile}>
              {match.targetUser.username}
            </h3>
            <div className="flex mt-1">
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{match.teachSkill.skill.name}</span>
              <i className="ri-arrow-left-right-line mx-2 text-muted"></i>
              <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{match.learnSkill.skill.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {match.status === 'connected' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-white/10 text-white"
                      onClick={startChat}
                    >
                      <MessageCircle size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-white/10 text-white"
                      onClick={viewProfile}
                    >
                      <User size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-white/10 text-white"
                  onClick={viewDetails}
                >
                  <Info size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Match Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {match.status === 'pending' ? (
            <Button className="gradient-button text-white text-sm" onClick={() => connect.mutate()}>
              Connect
            </Button>
          ) : (
            <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Connected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillMatchCard;
