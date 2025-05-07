import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertSkillSchema, 
  insertUserSkillSchema, 
  insertMessageSchema,
  insertContentSchema
} from "@shared/schema";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { summarizeDocument, generateLearningRecommendations } from "./services/openai";
import { chatbotService } from "./services/chatbot";
import multer from "multer";

// Define the skill form schema
const skillFormSchema = z.object({
  type: z.enum(["teach", "learn"]),
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  description: z.string().optional(),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create a basic in-memory authentication system
const sessions: Record<string, { userId: number, username: string }> = {};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time messaging
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/api/ws"
  });
  
  console.log("WebSocket server initialized on path: /api/ws");
  
  wss.on("connection", (ws, req) => {
    console.log(`New WebSocket connection established`);
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: "system",
      content: "Connected to chat server",
      timestamp: new Date().toISOString()
    }));
    
    ws.on("message", (message) => {
      try {
        console.log(`Received message: ${message.toString()}`);
        const data = JSON.parse(message.toString());
        
        if (data.type === "message") {
          // Broadcast message to all other clients
          wss.clients.forEach((client) => {
            if (client !== ws) {
              client.send(JSON.stringify({
                type: "message",
                senderId: data.sessionId && sessions[data.sessionId] ? sessions[data.sessionId].userId : "system",
                senderName: data.sessionId && sessions[data.sessionId] ? sessions[data.sessionId].username : "System",
                content: data.content,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
    
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });
  
  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Create a session
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions[sessionId] = { userId: newUser.id, username: newUser.username };
      
      res.status(201).json({
        user: { id: newUser.id, username: newUser.username },
        sessionId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a session
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions[sessionId] = { userId: user.id, username: user.username };
      
      res.json({
        user: { id: user.id, username: user.username },
        sessionId
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  // Middleware to check if user is authenticated
  const authenticate = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization;
    
    if (!sessionId || !sessions[sessionId]) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = { id: sessions[sessionId].userId, username: sessions[sessionId].username };
    next();
  };
  
  // For demo purposes, auto-login the first user if no session
  app.use(async (req: any, res, next) => {
    if (!req.headers.authorization) {
      const users = await storage.getAllUsers();
      if (users && users.length > 0) {
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions[sessionId] = { userId: users[0].id, username: users[0].username };
        req.headers.authorization = sessionId;
      }
    }
    next();
  });
  
  // User endpoints
  app.get("/api/users/current", authenticate, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password for security
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });
  
  app.patch("/api/users/current", authenticate, async (req: any, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password for security
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.get("/api/users/current/skills", authenticate, async (req: any, res) => {
    try {
      const type = req.query.type;
      const userSkills = await storage.getUserSkills(req.user.id, type);
      res.json(userSkills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });
  
  app.get("/api/users/current/skill-recommendations", authenticate, async (req: any, res) => {
    try {
      // Get the user's current skills
      const userSkills = await storage.getUserSkills(req.user.id);
      
      if (!userSkills || userSkills.length === 0) {
        return res.status(404).json({ message: "No skills found to base recommendations on" });
      }
      
      // Use OpenAI to generate personalized learning recommendations
      const recommendations = await generateLearningRecommendations(userSkills);
      
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating skill recommendations:", error);
      res.status(500).json({ message: "Failed to generate skill recommendations" });
    }
  });
  
  app.get("/api/users/current/dashboard", authenticate, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  app.get("/api/users/current/stats", authenticate, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      const currentUser = leaderboard.find(user => user.id === req.user.id);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User stats not found" });
      }
      
      res.json(currentUser);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
  // Skills endpoints
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });
  
  app.post("/api/skills", authenticate, async (req: any, res) => {
    try {
      const validatedData = skillFormSchema.parse(req.body);
      
      // First check if skill exists, if not create it
      let skill = await storage.getSkillByName(validatedData.name);
      
      if (!skill) {
        skill = await storage.createSkill({
          name: validatedData.name,
          category: validatedData.type === "teach" ? "Teaching" : "Learning"
        });
      }
      
      // Then create user skill
      const userSkill = await storage.createUserSkill({
        userId: req.user.id,
        skillId: skill.id,
        type: validatedData.type,
        proficiency: validatedData.proficiency,
        description: validatedData.description || ""
      });
      
      res.status(201).json(userSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });
  
  // Matches endpoints
  app.get("/api/matches", authenticate, async (req: any, res) => {
    try {
      const status = req.query.status;
      const matches = await storage.getUserMatches(req.user.id, status);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });
  
  app.post("/api/matches/connect/:id", authenticate, async (req: any, res) => {
    try {
      const matchId = parseInt(req.params.id);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      const updatedMatch = await storage.updateMatch(matchId, {
        status: "accepted"
      });
      
      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(updatedMatch);
    } catch (error) {
      console.error("Error connecting match:", error);
      res.status(500).json({ message: "Failed to connect with match" });
    }
  });
  
  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  // Messages endpoints
  app.get("/api/messages", authenticate, async (req: any, res) => {
    try {
      const messages = await storage.getUserMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  app.get("/api/messages/:userId", authenticate, async (req: any, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      
      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const conversation = await storage.getConversation(req.user.id, targetUserId);
      
      // Mark received messages as read
      await storage.markMessagesAsRead(req.user.id, targetUserId);
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  app.post("/api/messages", authenticate, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Content upload and summary endpoints
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  });
  
  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
      const allowedMimes = ["application/pdf", "video/mp4"];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only PDF and MP4 files are allowed.") as any);
      }
    }
  });
  
  app.post("/api/content/upload", authenticate, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "video";
      
      const content = await storage.createContent({
        userId: req.user.id,
        filename: req.file.originalname,
        type: fileType,
        filePath: req.file.path,
        fileSize: req.file.size,
        status: "processing",
        summary: null
      });
      
      // Start async processing
      if (fileType === "pdf") {
        // Process PDF
        try {
          const summary = await summarizeDocument(req.file.path);
          await storage.updateContent(content.id, {
            summary,
            status: "complete"
          });
        } catch (error) {
          console.error("Error summarizing PDF:", error);
          await storage.updateContent(content.id, {
            status: "failed"
          });
        }
      } else {
        // For video, mark as processed without summary for now
        // In a real application, you would use video transcription APIs
        await storage.updateContent(content.id, {
          summary: "Video summary is not available in this demo version.",
          status: "complete"
        });
      }
      
      res.status(201).json(content);
    } catch (error) {
      console.error("Error uploading content:", error);
      res.status(500).json({ message: "Failed to upload content" });
    }
  });
  
  app.get("/api/content", authenticate, async (req: any, res) => {
    try {
      const content = await storage.getUserContent(req.user.id);
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });
  
  // Chatbot endpoints
  app.post("/api/chatbot", authenticate, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Get current user and skills for context
      const user = await storage.getUserById(req.user.id);
      const userSkills = await storage.getUserSkills(req.user.id);
      
      // Process message through chatbot service
      const response = await chatbotService.processMessage(message, user, userSkills);
      
      res.json({ message: response });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ 
        error: "Chatbot is temporarily unavailable",
        message: "I'm currently experiencing technical difficulties. Please try again later."
      });
    }
  });
  
  app.get("/api/chatbot/match-suggestions", authenticate, async (req: any, res) => {
    try {
      // Get current user skills for context
      const userSkills = await storage.getUserSkills(req.user.id);
      
      // Get match suggestions
      const suggestions = await chatbotService.suggestSkillMatches(userSkills);
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Match suggestion error:", error);
      res.status(500).json({ 
        error: "Match suggestions are temporarily unavailable", 
        suggestions: "Try browsing the available skills and users manually."
      });
    }
  });

  return httpServer;
}
