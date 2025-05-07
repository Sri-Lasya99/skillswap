import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import StatCard from "@/components/dashboard/stat-card";
import SkillMatchCard from "@/components/dashboard/skill-match-card";
import SkillCard from "@/components/dashboard/skill-card";
import LeaderboardCard from "@/components/dashboard/leaderboard-card";
import SkillRecommendations from "@/components/dashboard/skill-recommendations";
import UploadCard from "@/components/upload/upload-card";
import AddSkillDialog from "@/components/skills/add-skill-dialog";
import { Button } from "@/components/ui/button";
import { UserStats, SkillMatchWithUsers, UserSkill } from "@shared/schema";

const Dashboard = () => {
  const [isAddTeachSkillOpen, setIsAddTeachSkillOpen] = useState(false);
  const [isAddLearnSkillOpen, setIsAddLearnSkillOpen] = useState(false);
  const [skillType, setSkillType] = useState<"teach" | "learn">("teach");
  const [, setLocation] = useLocation();
  
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/users/current/dashboard'],
  });
  
  const { data: skillMatches } = useQuery<SkillMatchWithUsers[]>({
    queryKey: ['/api/matches'],
  });
  
  const { data: teachSkills } = useQuery<UserSkill[]>({
    queryKey: ['/api/users/current/skills', 'teach'],
  });
  
  const { data: learnSkills } = useQuery<UserSkill[]>({
    queryKey: ['/api/users/current/skills', 'learn'],
  });
  
  const handleAddSkill = (type: "teach" | "learn") => {
    setSkillType(type);
    if (type === "teach") {
      setIsAddTeachSkillOpen(true);
    } else {
      setIsAddLearnSkillOpen(true);
    }
  };
  
  return (
    <>
      <Header title="Dashboard" />
      
      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Active Matches" 
            value={stats?.activeMatches || 0}
            subtitle={`${stats?.newMatches || 0} new this week`}
            icon="ri-group-line"
            variant="primary"
          />
          
          <StatCard 
            title="Skills Shared" 
            value={stats?.skillsShared || 0}
            subtitle={`${stats?.newSkillsShared || 0} from last month`}
            icon="ri-arrows-left-right-line"
            variant="secondary"
          />
          
          <StatCard 
            title="Leaderboard Rank" 
            value={`#${stats?.leaderboardRank || 0}`}
            subtitle={`Top ${stats?.leaderboardPercentile || 0}% of users`}
            icon="ri-award-line"
            variant="accent"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Matches Section */}
            <div className="glass p-6 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Skill Matches</h2>
                <Button 
                  variant="link" 
                  className="text-sm text-primary hover:underline"
                  onClick={() => setLocation("/matches")}
                >
                  View All
                </Button>
              </div>
              
              {skillMatches && skillMatches.length > 0 ? (
                skillMatches.slice(0, 3).map(match => (
                  <SkillMatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="py-8 text-center text-muted">
                  <p>No skill matches found.</p>
                  <p className="text-sm mt-2">Add more skills to increase your chances of finding matches.</p>
                </div>
              )}
            </div>
            
            {/* Skills Section */}
            <div className="glass p-6 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Skills</h2>
                <Button 
                  variant="link" 
                  className="text-sm text-primary hover:underline"
                  onClick={() => setLocation("/profile")}
                >
                  Manage Skills
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills to Teach */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-primary">Skills to Teach</h3>
                  
                  {teachSkills && teachSkills.length > 0 ? (
                    teachSkills.map(skill => (
                      <SkillCard key={skill.id} userSkill={skill} type="teaching" />
                    ))
                  ) : (
                    <div className="py-3 text-center text-muted">
                      <p>No teaching skills added yet.</p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="mt-3 flex items-center justify-center w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-primary/40 text-muted hover:text-primary transition-colors"
                    onClick={() => handleAddSkill("teach")}
                  >
                    <i className="ri-add-line mr-1"></i> Add Skill
                  </Button>
                </div>
                
                {/* Skills to Learn */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-secondary">Skills to Learn</h3>
                  
                  {learnSkills && learnSkills.length > 0 ? (
                    learnSkills.map(skill => (
                      <SkillCard key={skill.id} userSkill={skill} type="learning" />
                    ))
                  ) : (
                    <div className="py-3 text-center text-muted">
                      <p>No learning skills added yet.</p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="mt-3 flex items-center justify-center w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-secondary/40 text-muted hover:text-secondary transition-colors"
                    onClick={() => handleAddSkill("learn")}
                  >
                    <i className="ri-add-line mr-1"></i> Add Skill
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Upload Section */}
            <UploadCard />
            
            {/* AI Recommendations Section */}
            <SkillRecommendations />
            
            {/* Leaderboard Section */}
            <LeaderboardCard limit={3} />
          </div>
        </div>
      </main>
      
      {/* Add Skill Dialog */}
      <AddSkillDialog
        open={skillType === "teach" ? isAddTeachSkillOpen : isAddLearnSkillOpen}
        onOpenChange={(open) => {
          if (skillType === "teach") {
            setIsAddTeachSkillOpen(open);
          } else {
            setIsAddLearnSkillOpen(open);
          }
        }}
      />
    </>
  );
};

export default Dashboard;
