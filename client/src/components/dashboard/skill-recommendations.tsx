import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillRecommendation {
  skill: string;
  resource: string;
  reason: string;
}

export const SkillRecommendations = () => {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/users/current/skill-recommendations'],
    queryFn: getQueryFn<{ recommendations: SkillRecommendation[] }>({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <Card className="col-span-1 glass border border-white/5">
        <CardHeader>
          <div className="h-6 w-3/4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-4 w-1/2 mt-1.5">
            <Skeleton className="h-full w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendations) {
    // Determine if it's a rate limit error by checking various possible error formats
    const isRateLimitError = 
      (error as any)?.message?.toLowerCase().includes("quota") || 
      (error as any)?.message?.toLowerCase().includes("rate limit") ||
      (error as any)?.message?.toLowerCase().includes("429") ||
      (error as any)?.status === 429;
      
    return (
      <Card className="col-span-1 glass border border-white/5">
        <CardHeader>
          <CardTitle>Skill Recommendations</CardTitle>
          <CardDescription>AI-powered learning suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white/5 rounded-lg space-y-2">
            {isRateLimitError ? (
              <>
                <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                  <h4 className="text-sm font-medium text-amber-400">API Rate Limit Reached</h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    OpenAI API quota has been reached. AI recommendations will be available again once the rate limit resets.
                  </p>
                </div>
                <div className="p-3 text-sm">
                  <p className="mb-2">While waiting, you can:</p>
                  <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                    <li>Explore the skills of other users on the platform</li>
                    <li>Update your own skills and proficiency levels</li>
                    <li>Connect with potential skill-sharing partners</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm">
                  Unable to load recommendations at this time. Please add more skills to your profile to get personalized suggestions.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Recommendations are based on your current skills and expertise level.</p>
                  <p>Add more skills to get better recommendations!</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 glass border border-white/5">
      <CardHeader>
        <CardTitle>Skill Recommendations</CardTitle>
        <CardDescription>AI-powered learning suggestions based on your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
          recommendations.recommendations.map((recommendation, index) => (
            <div key={index} className="p-4 bg-white/5 hover:bg-white/10 rounded-lg space-y-2 transition-all duration-300 border border-transparent hover:border-primary/20">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className="text-xs px-3 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30"
                >
                  {recommendation.skill}
                </Badge>
                {recommendation.resource && recommendation.resource.startsWith('http') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-3 text-xs bg-transparent border border-primary/30 hover:bg-primary/10 hover:text-white transition-all duration-300" 
                    asChild
                  >
                    <a href={recommendation.resource} target="_blank" rel="noopener noreferrer">
                      Learn <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{recommendation.reason}</p>
              {recommendation.resource && !recommendation.resource.startsWith('http') && (
                <div className="flex items-center mt-2 text-xs text-muted-foreground bg-white/5 p-2 rounded border border-white/10">
                  <span className="font-medium mr-1">Resource:</span> {recommendation.resource}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-6 border border-dashed border-white/20 rounded-lg">
            <p className="text-muted-foreground mb-2">
              No recommendations available yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Try adding more skills to your profile to get personalized AI recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillRecommendations;