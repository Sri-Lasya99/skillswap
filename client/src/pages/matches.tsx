import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWithStats } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LeaderboardPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("points");

  const { data: leaderboardUsers, isLoading } = useQuery<UserWithStats[]>({
    queryKey: ['/api/leaderboard'],
  });

  const { data: currentUser } = useQuery<UserWithStats>({
    queryKey: ['/api/users/current/stats'],
  });

  const getSortedAndFilteredUsers = () => {
    if (!leaderboardUsers) return [];

    const filteredUsers = leaderboardUsers.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filteredUsers].sort((a, b) => {
      if (sortOption === "points") {
        return b.points - a.points;
      } else if (sortOption === "skillsShared") {
        return b.skillsShared - a.skillsShared;
      } else {
        return a.username.localeCompare(b.username);
      }
    });
  };

  const sortedUsers = getSortedAndFilteredUsers();
  const currentUserRank = currentUser ? leaderboardUsers?.findIndex(user => user.id === currentUser.id) + 1 : 0;

  return (
    <>
      <Header title="Leaderboard" subtitle="See who's sharing the most skills" />

      <main className="p-6">
        <Card className="glass border border-white/5 mb-6">
          <CardHeader>
            <CardTitle>Top Skill Swappers</CardTitle>
            <CardDescription>Users ranked by points earned from skill exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="relative mb-4 md:mb-0 md:w-1/2">
                <i className="ri-search-line absolute left-3 top-2.5 text-muted"></i>
                <Input 
                  type="text"
                  placeholder="Search users..."
                  className="glass-input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted">Sort by:</span>
                <Select
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  <SelectTrigger className="glass-input w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Total Points</SelectItem>
                    <SelectItem value="skillsShared">Skills Shared</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted">Loading leaderboard data...</p>
              </div>
            ) : (
              <>
                <div className="border-b border-white/10 py-2 px-4 hidden md:grid md:grid-cols-12 text-sm text-muted">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">User</div>
                  <div className="col-span-3 text-right">Skills Shared</div>
                  <div className="col-span-3 text-right">Points</div>
                </div>

                <div className="space-y-2 mt-2">
                  {sortedUsers.map((user, index) => {
                    const isCurrentUser = currentUser && user.id === currentUser.id;

                    return (
                      <div 
                        key={user.id}
                        className={`p-4 rounded-lg ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <div className="grid grid-cols-4 md:grid-cols-12 items-center">
                          <div className="col-span-1">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium 
                              ${index === 0 ? 'bg-primary/20 text-primary' : 
                                index === 1 ? 'bg-primary/10 text-primary' : 
                                  isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                              {index + 1}
                            </div>
                          </div>

                          <div className="col-span-3 md:col-span-5 flex items-center">
                            <div className={`w-10 h-10 rounded-full 
                              ${isCurrentUser ? 'bg-primary/30 border border-primary/50' : 'bg-secondary/30 border border-secondary/50'} 
                              overflow-hidden mr-3`}>
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                  {user.username.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{isCurrentUser ? `${user.username} (You)` : user.username}</p>
                              <p className="text-xs text-muted hidden md:block">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="hidden md:block md:col-span-3 text-right">
                            <span>{user.skillsShared}</span>
                          </div>

                          <div className="col-span-text-right md:col-span-3 text-right">
                            <span className={`${isCurrentUser ? 'text-primary' : 'text-accent'} font-medium`}>
                              <i className="ri-trophy-line mr-1"></i>
                              {user.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sortedUsers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted">No users found matching your search.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {currentUser && sortedUsers.findIndex(user => user.id === currentUser.id) === -1 && (
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/30">
                <div className="grid grid-cols-4 md:grid-cols-12 items-center">
                  <div className="col-span-1">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                      {currentUserRank}
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-5 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/30 border border-primary/50 overflow-hidden mr-3">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          {currentUser.username.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{currentUser.username} (You)</p>
                      <p className="text-xs text-muted hidden md:block">Member since {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-3 text-right">
                    <span>{currentUser.skillsShared}</span>
                  </div>

                  <div className="col-span-text-right md:col-span-3 text-right">
                    <span className="text-primary font-medium">
                      <i className="ri-trophy-line mr-1"></i>
                      {currentUser.points} pts
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default LeaderboardPage;
