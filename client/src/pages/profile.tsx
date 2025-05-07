import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { User, UserSkill } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SkillCard from "@/components/dashboard/skill-card";
import AddSkillDialog from "@/components/skills/add-skill-dialog";

const Profile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillType, setSkillType] = useState<"teach" | "learn">("teach");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  const { data: teachSkills } = useQuery<UserSkill[]>({
    queryKey: ['/api/users/current/skills', 'teach'],
  });

  const { data: learnSkills } = useQuery<UserSkill[]>({
    queryKey: ['/api/users/current/skills', 'learn'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User>) => {
      return apiRequest("PATCH", `/api/users/current`, updatedUser);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/current'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedUser = {
      username: formData.get('username') as string,
      bio: formData.get('bio') as string,
    };

    updateProfileMutation.mutate(updatedUser);
  };

  const handleAddSkill = (type: "teach" | "learn") => {
    setSkillType(type);
    setIsAddSkillOpen(true);
  };

  if (!user) {
    return (
      <>
        <Header title="Profile" />
        <div className="p-6">
          <div className="glass p-6 rounded-xl">
            <p className="text-center text-muted">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" />

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="glass border border-white/5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>Profile</CardTitle>
                  {!isEditMode ? (
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={() => setIsEditMode(true)}
                    >
                      <i className="ri-edit-line mr-1"></i> Edit
                    </Button>
                  ) : null}
                </div>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>

              <CardContent>
                {!isEditMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt="User profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-muted">Username</h3>
                      <p className="text-lg font-medium">{user.username}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-muted">Bio</h3>
                      <p className="text-sm">{user.bio || "No bio added yet."}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-muted">Member Since</h3>
                      <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full bg-secondary/30 border border-secondary/50 overflow-hidden flex items-center justify-center relative group">
                        {user.avatar ? (
                          <img src={user.avatar} alt="User profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs">Update Photo</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="username" className="text-sm text-muted">Username</label>
                      <Input 
                        id="username"
                        name="username"
                        defaultValue={user.username}
                        className="glass-input mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="text-sm text-muted">Bio</label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={user.bio || ""}
                        className="glass-input mt-1 resize-none"
                        placeholder="Tell others about yourself..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                        className="border-white/20 text-muted hover:text-white hover:border-white/40"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="gradient-button text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="glass mb-6">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-6">
                <Card className="glass border border-white/5">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-primary">Skills to Teach</CardTitle>
                      <Button 
                        variant="outline" 
                        className="border-dashed border-white/20 hover:border-primary/40 text-muted hover:text-primary"
                        onClick={() => handleAddSkill("teach")}
                      >
                        <i className="ri-add-line mr-1"></i> Add Skill
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {teachSkills && teachSkills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teachSkills.map(skill => (
                          <SkillCard key={skill.id} userSkill={skill} type="teaching" />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted">
                        <p>No teaching skills added yet.</p>
                        <p className="text-sm mt-2">Add skills that you want to teach others.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass border border-white/5">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-secondary">Skills to Learn</CardTitle>
                      <Button 
                        variant="outline" 
                        className="border-dashed border-white/20 hover:border-secondary/40 text-muted hover:text-secondary"
                        onClick={() => handleAddSkill("learn")}
                      >
                        <i className="ri-add-line mr-1"></i> Add Skill
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {learnSkills && learnSkills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {learnSkills.map(skill => (
                          <SkillCard key={skill.id} userSkill={skill} type="learning" />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted">
                        <p>No learning skills added yet.</p>
                        <p className="text-sm mt-2">Add skills that you want to learn from others.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <Card className="glass border border-white/5">
                  <CardHeader>
                    <CardTitle>Your Connections</CardTitle>
                    <CardDescription>People you're learning from or teaching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center text-muted">
                      <p>No active connections yet.</p>
                      <p className="text-sm mt-2">Connect with other users to start sharing skills.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="glass border border-white/5">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent interactions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center text-muted">
                      <p>No recent activity.</p>
                      <p className="text-sm mt-2">Your activities will appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AddSkillDialog
        open={isAddSkillOpen}
        onOpenChange={setIsAddSkillOpen}
      />
    </>
  );
};

export default Profile;
