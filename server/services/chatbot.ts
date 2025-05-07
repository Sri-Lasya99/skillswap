import OpenAI from "openai";
import { User, UserSkill } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Chatbot service for handling user queries and providing recommendations
 */
export class ChatbotService {
  /**
   * Processes a user message and generates a response
   * @param message User's message text
   * @param user Current user information
   * @param userSkills User's current skills
   * @returns AI-generated response
   */
  async processMessage(message: string, user: User, userSkills: UserSkill[]): Promise<string> {
    try {
      // Create context for the AI about the user and their skills
      const userContext = this.createUserContext(user, userSkills);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are SkillBot, an assistant for the SkillSwap platform. Your goal is to help users find learning partners, 
            improve their skills, and navigate the platform. Be friendly, encouraging, and helpful.
            
            SkillSwap is a skill-sharing platform where users can find learning partners based on complementary skills.
            Users can teach skills they're good at and learn skills from others.
            
            ${userContext}
            
            Keep responses concise (max 3-4 sentences). Focus on being helpful with skill learning advice,
            platform navigation help, and matchmaking suggestions.`
          },
          { role: "user", content: message }
        ],
        max_tokens: 300
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
    } catch (error: any) {
      // Handle rate limit errors gracefully
      if (error.status === 429 || (error.message && error.message.includes("rate limit"))) {
        return "I'm currently unavailable due to high demand. Please try again in a few minutes.";
      }
      
      console.error("Chatbot error:", error);
      return "Sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  /**
   * Creates a context string about the user and their skills
   */
  private createUserContext(user: User, userSkills: UserSkill[]): string {
    const teachingSkills = userSkills.filter(skill => skill.type === "teaching")
      .map(skill => `${skill.skill.name} (proficiency: ${skill.proficiency}/10)`);
    
    const learningSkills = userSkills.filter(skill => skill.type === "learning")
      .map(skill => `${skill.skill.name} (interest: ${skill.proficiency}/10)`);
    
    return `
    Current user information:
    - Username: ${user.username}
    - Bio: ${user.bio || "No bio provided"}
    - Teaching skills: ${teachingSkills.length ? teachingSkills.join(", ") : "None"}
    - Learning skills: ${learningSkills.length ? learningSkills.join(", ") : "None"}
    `;
  }

  /**
   * Suggests potential skill matches based on user's interests
   * @param userSkills User's current skills
   * @returns AI-generated skill match suggestions
   */
  async suggestSkillMatches(userSkills: UserSkill[]): Promise<string> {
    try {
      const teachingSkills = userSkills.filter(skill => skill.type === "teaching")
        .map(skill => `${skill.skill.name} (proficiency: ${skill.proficiency}/10)`);
      
      const learningSkills = userSkills.filter(skill => skill.type === "learning")
        .map(skill => `${skill.skill.name} (interest: ${skill.proficiency}/10)`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are SkillBot's matchmaking assistant. Help provide personalized advice for finding
            good skill matches on the platform.`
          },
          { 
            role: "user", 
            content: `Based on my profile, what kind of skill matches should I look for?
            
            My teaching skills: ${teachingSkills.length ? teachingSkills.join(", ") : "None"}
            My learning interests: ${learningSkills.length ? learningSkills.join(", ") : "None"}
            
            Provide brief, specific advice on what types of users would be good matches for me,
            and how I might improve my profile to find better matches.`
          }
        ],
        max_tokens: 250
      });

      return response.choices[0].message.content || "I couldn't generate match suggestions at this time.";
    } catch (error) {
      console.error("Match suggestion error:", error);
      return "I'm unable to provide personalized match suggestions right now. Please try again later.";
    }
  }
}

export const chatbotService = new ChatbotService();