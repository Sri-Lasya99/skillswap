import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserWithStats } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface LeaderboardItemProps {
  user: UserWithStats;
  rank: number;
  isCurrentUser: boolean;
}

const LeaderboardItem = ({ user, rank, isCurrentUser }: LeaderboardItemProps) => {
  const getRankClasses = () => {
    if (isCurrentUser) return "bg-primary/20 text-primary";
    if (rank === 1) return "bg-primary/20 text-primary";
    if (rank === 2) return "bg-primary/10 text-primary";
    return "bg-white/10 text-white";
  };

  return (
    <div className={`flex items-center py-3 ${isCurrentUser ? 'border border-primary/30 rounded-lg bg-primary/5 px-3' : 'border-b border-white/10'}`}>
      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${getRankClasses()} text-sm font-medium mr-3`}>
        {rank}
      </div>
      <div className={`w-10 h-10 rounded-full ${isCurrentUser ? 'bg-primary/30 border border-primary/50' : 'bg-secondary/30 border border-secondary/50'} overflow-hidden mr-3`}>
        {user.avatar ? (
          <img src={user.avatar} alt={`${user.username}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            {user.username.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white">{isCurrentUser ? 'You' : user.username}</h3>
        <p className="text-xs text-muted">{user.skillsShared} skills shared</p>
      </div>
      <div className={isCurrentUser ? 'text-primary' : 'text-accent'}>
        <i className="ri-trophy-line mr-1"></i>
        <span className="text-sm font-medium">{user.points} pts</span>
      </div>
    </div>
  );
};

interface LeaderboardCardProps {
  limit?: number;
  showViewAll?: boolean;
}

const LeaderboardCard = ({ limit = 3, showViewAll = true }: LeaderboardCardProps) => {
  const [, setLocation] = useLocation();
  const { data: leaderboard } = useQuery<UserWithStats[]>({
    queryKey: ['/api/leaderboard'],
  });
  
  const { data: currentUser } = useQuery<UserWithStats>({
    queryKey: ['/api/users/current/stats'],
  });
  
  if (!leaderboard) {
    return (
      <div className="glass p-6 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
        </div>
        <div className="py-6 text-center text-muted">Loading leaderboard data...</div>
      </div>
    );
  }
  
  const topUsers = leaderboard.slice(0, limit);
  const currentUserRank = currentUser ? leaderboard.findIndex(user => user.id === currentUser.id) + 1 : 0;
  const showCurrentUser = currentUser && currentUserRank > limit;
  
  return (
    <div className="glass p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        {showViewAll && (
          <Button 
            variant="link" 
            className="text-sm text-primary hover:underline p-0"
            onClick={() => setLocation("/leaderboard")}
          >
            Full Rankings
          </Button>
        )}
      </div>
      
      {topUsers.map((user, index) => (
        <LeaderboardItem 
          key={user.id} 
          user={user} 
          rank={index + 1} 
          isCurrentUser={currentUser ? user.id === currentUser.id : false} 
        />
      ))}
      
      {showCurrentUser && currentUser && (
        <div className="mt-2">
          <LeaderboardItem 
            user={currentUser} 
            rank={currentUserRank} 
            isCurrentUser={true} 
          />
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;
