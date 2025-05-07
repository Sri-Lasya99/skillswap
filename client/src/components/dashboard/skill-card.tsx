import { useState } from "react";
import { Skill, UserSkill } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ChevronUp,
  Share2 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillCardProps {
  userSkill: UserSkill;
  type: 'teaching' | 'learning';
}

const SkillCard = ({ userSkill, type }: SkillCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isTeaching = type === 'teaching';
  const borderColorClass = isTeaching 
    ? `hover:border-primary/30` 
    : `hover:border-secondary/30`;
    
  const proficiencyLabel = userSkill.proficiency || 'Beginner';
  
  const handleEdit = () => {
    // This would be a placeholder for edit functionality
    console.log("Edit skill:", userSkill.id);
  };

  const handleDelete = () => {
    // This would be a placeholder for delete functionality
    console.log("Delete skill:", userSkill.id);
  };

  const handleUpgrade = () => {
    // This would be a placeholder for upgrading proficiency
    console.log("Upgrade skill:", userSkill.id);
  };

  const handleShare = () => {
    // This would be a placeholder for sharing skill with others
    console.log("Share skill:", userSkill.id);
  };

  return (
    <div 
      className={`glass border border-white/10 p-3 rounded-lg mb-3 transition-all duration-200 ${borderColorClass} cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">{userSkill.skill.name}</h4>
          <p className="text-xs text-muted mt-1">
            {isTeaching 
              ? `Teaching ${userSkill.partners || 0} ${userSkill.partners === 1 ? 'person' : 'people'}`
              : userSkill.teacher 
                ? `Learning from ${userSkill.teacher}` 
                : 'Searching for a teacher'
            }
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <div className="text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded">{proficiencyLabel}</div>
        </div>
      </div>
      
      {!isTeaching && (
        <div className="mt-2">
          <Progress 
            value={userSkill.progress || 0} 
            className="h-2 bg-white/10"
          />
        </div>
      )}

      {isHovered && (
        <div className="mt-3 pt-2 border-t border-white/10 flex justify-between">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleEdit}
                    className="text-muted hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
                  >
                    <Edit size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit skill</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleDelete}
                    className="text-muted hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
                  >
                    <Trash2 size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove skill</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex space-x-2">
            {!isTeaching && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleUpgrade}
                      className="text-muted hover:text-primary transition-colors p-1 rounded-full hover:bg-white/5"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update progress</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleShare}
                    className="text-muted hover:text-secondary transition-colors p-1 rounded-full hover:bg-white/5"
                  >
                    <Share2 size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
