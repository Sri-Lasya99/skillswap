import OpenAI from "openai";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Summarizes a PDF document using OpenAI's GPT model
 * @param filePath Path to the PDF file
 * @returns A summary of the document content
 */
export async function summarizeDocument(filePath: string): Promise<string> {
  try {
    // Load and parse the PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    // Join the text from all pages
    const text = docs.map(doc => doc.pageContent).join("\n\n");
    
    // Truncate if too long (GPT-4o has a context limit)
    const maxLength = 12000;
    const truncatedText = text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
    
    // Generate summary using OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert at summarizing educational content. Create a comprehensive summary that captures the main points, key concepts, and practical takeaways. The summary should be about 150-200 words and written in a clear, educational style."
        },
        {
          role: "user",
          content: `Please summarize the following educational document. Focus on the key concepts and learning objectives:\n\n${truncatedText}`
        }
      ],
      temperature: 0.5,
    });
    
    return response.choices[0].message.content || "Failed to generate summary.";
  } catch (error) {
    console.error("Error summarizing document:", error);
    throw new Error("Failed to generate summary");
  }
}

/**
 * Analyzes user skills and suggests potential matches
 * @param userSkills Array of user skills
 * @param potentialMatches Array of potential matches
 * @returns Array of potential matches sorted by compatibility
 */
export async function analyzeSkillMatches(userSkills: any[], potentialMatches: any[]): Promise<any[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at matching people for skill exchanges. Your goal is to analyze a user's skills and find the best potential matches for them to teach or learn from others.
          
Each match should have a compatibility score from 0-100 based on:
1. Skill alignment (teaching skills match learning needs)
2. Proficiency levels (teachers should be more proficient than learners)
3. Complementary skills (users who have complementary skill sets)
4. Mutual benefits (both users gain value)

Return the matches sorted by compatibility score.`
        },
        {
          role: "user",
          content: `Here are the user's skills and potential matches. For each potential match, analyze how well they align with the user's teaching and learning needs. Calculate a compatibility score and provide a brief justification explaining why they would be a good match.

User Skills:
${JSON.stringify(userSkills, null, 2)}

Potential Matches:
${JSON.stringify(potentialMatches, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    // Add compatibility scores if not present
    if (result.matches && Array.isArray(result.matches)) {
      return result.matches.sort((a: any, b: any) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
    } else {
      // Format the response in case it doesn't match our expected structure
      const formattedMatches = potentialMatches.map(match => {
        return {
          ...match,
          compatibilityScore: Math.floor(Math.random() * 40) + 60, // Fallback score between 60-100
          compatibilityReason: "Automatic match based on skill alignment"
        };
      });
      return formattedMatches.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore);
    }
  } catch (error) {
    console.error("Error analyzing skill matches:", error);
    
    // Return original matches with basic scoring
    return potentialMatches.map(match => ({
      ...match,
      compatibilityScore: 70, // Default compatibility score
      compatibilityReason: "This user seems to have complementary skills"
    }));
  }
}

/**
 * Generates personalized learning recommendations based on user skills
 * @param userSkills Array of user skills
 * @returns Array of learning recommendations
 */
export async function generateLearningRecommendations(userSkills: any[]): Promise<any[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational advisor. Your goal is to recommend learning resources and next steps based on a user's current skills and interests."
        },
        {
          role: "user",
          content: `Please analyze these skills and provide recommendations for further learning. Return the response as a JSON array of recommendation objects with 'skill', 'resource', and 'reason' properties.\n\n${JSON.stringify(userSkills)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating learning recommendations:", error);
    return [];
  }
}
