import { db } from "./index";
import * as schema from "@shared/schema";
import { eq, and as drizzleAnd } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Run seed anyway for testing
    console.log("Forcing seed for testing purposes.");
    
    // Delete existing data first (for testing only)
    try {
      await db.delete(schema.messages);
      await db.delete(schema.matches);
      await db.delete(schema.userSkills);
      await db.delete(schema.contents);
      await db.delete(schema.users);
      await db.delete(schema.skills);
      console.log("Cleared existing data");
    } catch(err) {
      console.log("Error clearing data:", err);
    }
    
    // Create users
    const users = [
      {
        username: "Alex",
        password: "password123",
        bio: "Developer passionate about technology and teaching others.",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "Sarah Johnson",
        password: "password123",
        bio: "Experienced web developer and digital marketing specialist.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "Michael Chen",
        password: "password123",
        bio: "UI/UX designer looking to learn Python programming.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "Priya Patel",
        password: "password123",
        bio: "Data scientist interested in video editing and visual storytelling.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "David Kim",
        password: "password123",
        bio: "Educational content creator with expertise in multiple programming languages.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "Elena Rodriguez",
        password: "password123",
        bio: "Front-end developer and language enthusiast.",
        avatar: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        username: "James Wilson",
        password: "password123",
        bio: "Full-stack developer specialized in educational technology.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      }
    ];
    
    console.log("Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const [user] = await db.insert(schema.users).values(userData).returning();
      createdUsers.push(user);
    }
    
    // Create skills
    const skills = [
      { name: "JavaScript", category: "Programming" },
      { name: "React", category: "Programming" },
      { name: "UI Design", category: "Design" },
      { name: "Web Development", category: "Programming" },
      { name: "Digital Marketing", category: "Marketing" },
      { name: "Python", category: "Programming" },
      { name: "Data Science", category: "Data" },
      { name: "Video Editing", category: "Media" },
      { name: "Machine Learning", category: "Data" },
      { name: "Spanish", category: "Language" },
      { name: "Photography", category: "Media" }
    ];
    
    console.log("Creating skills...");
    const createdSkills = [];
    for (const skillData of skills) {
      const [skill] = await db.insert(schema.skills).values(skillData).returning();
      createdSkills.push(skill);
    }
    
    // Map skills by name for easier reference
    const skillMap = createdSkills.reduce((map, skill) => {
      map[skill.name] = skill;
      return map;
    }, {} as Record<string, typeof createdSkills[0]>);
    
    // Create user skills
    console.log("Creating user skills...");
    
    // Alex's skills
    await db.insert(schema.userSkills).values([
      {
        userId: createdUsers[0].id,
        skillId: skillMap["JavaScript"].id,
        type: "teach",
        proficiency: "Advanced",
        description: "Professional JavaScript developer for 5 years",
        partners: 3
      },
      {
        userId: createdUsers[0].id,
        skillId: skillMap["React"].id,
        type: "teach",
        proficiency: "Intermediate",
        description: "Built several medium-sized React applications",
        partners: 2
      },
      {
        userId: createdUsers[0].id,
        skillId: skillMap["UI Design"].id,
        type: "teach",
        proficiency: "Intermediate",
        description: "Designed UI for multiple web applications",
        partners: 1
      },
      {
        userId: createdUsers[0].id,
        skillId: skillMap["Machine Learning"].id,
        type: "learn",
        proficiency: "Beginner",
        description: "Interested in machine learning fundamentals",
        progress: 25,
        teacher: "Jason"
      },
      {
        userId: createdUsers[0].id,
        skillId: skillMap["Spanish"].id,
        type: "learn",
        proficiency: "Beginner",
        description: "Want to learn basic conversational Spanish",
        progress: 10
      },
      {
        userId: createdUsers[0].id,
        skillId: skillMap["Photography"].id,
        type: "learn",
        proficiency: "Intermediate",
        description: "Improving composition and lighting techniques",
        progress: 60,
        teacher: "Maya"
      }
    ]);
    
    // Sarah's skills
    await db.insert(schema.userSkills).values([
      {
        userId: createdUsers[1].id,
        skillId: skillMap["Web Development"].id,
        type: "teach",
        proficiency: "Advanced",
        description: "Full-stack web developer with 7 years of experience",
        partners: 4
      },
      {
        userId: createdUsers[1].id,
        skillId: skillMap["Digital Marketing"].id,
        type: "learn",
        proficiency: "Intermediate",
        description: "Expanding knowledge in SEO and content marketing",
        progress: 65
      }
    ]);
    
    // Michael's skills
    await db.insert(schema.userSkills).values([
      {
        userId: createdUsers[2].id,
        skillId: skillMap["UI Design"].id,
        type: "teach",
        proficiency: "Expert",
        description: "Lead UI designer with focus on accessible interfaces",
        partners: 5
      },
      {
        userId: createdUsers[2].id,
        skillId: skillMap["Python"].id,
        type: "learn",
        proficiency: "Beginner",
        description: "Learning Python for data visualization",
        progress: 30
      }
    ]);
    
    // Priya's skills
    await db.insert(schema.userSkills).values([
      {
        userId: createdUsers[3].id,
        skillId: skillMap["Data Science"].id,
        type: "teach",
        proficiency: "Advanced",
        description: "Data scientist with focus on predictive analytics",
        partners: 3
      },
      {
        userId: createdUsers[3].id,
        skillId: skillMap["Video Editing"].id,
        type: "learn",
        proficiency: "Beginner",
        description: "Creating educational data visualization videos",
        progress: 15
      }
    ]);
    
    // Create matches
    console.log("Creating matches...");
    
    // Get user skills for reference
    const alexJS = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[0].id),
        eq(schema.userSkills.skillId, skillMap["JavaScript"].id)
      )
    });
    
    const alexML = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[0].id),
        eq(schema.userSkills.skillId, skillMap["Machine Learning"].id)
      )
    });
    
    const sarahWeb = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[1].id),
        eq(schema.userSkills.skillId, skillMap["Web Development"].id)
      )
    });
    
    const sarahMarketing = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[1].id),
        eq(schema.userSkills.skillId, skillMap["Digital Marketing"].id)
      )
    });
    
    const michaelUI = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[2].id),
        eq(schema.userSkills.skillId, skillMap["UI Design"].id)
      )
    });
    
    const michaelPython = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[2].id),
        eq(schema.userSkills.skillId, skillMap["Python"].id)
      )
    });
    
    const priyaData = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[3].id),
        eq(schema.userSkills.skillId, skillMap["Data Science"].id)
      )
    });
    
    const priyaVideo = await db.query.userSkills.findFirst({ 
      where: drizzleAnd(
        eq(schema.userSkills.userId, createdUsers[3].id),
        eq(schema.userSkills.skillId, skillMap["Video Editing"].id)
      )
    });
    
    // Create matches if we have the user skills
    if (alexJS && sarahMarketing) {
      await db.insert(schema.matches).values({
        sourceUserId: createdUsers[0].id,
        targetUserId: createdUsers[1].id,
        sourceTeachSkillId: alexJS.id,
        sourceLearnSkillId: sarahMarketing.id,
        status: "pending"
      });
    }
    
    if (michaelUI && michaelPython && alexJS) {
      await db.insert(schema.matches).values({
        sourceUserId: createdUsers[2].id,
        targetUserId: createdUsers[0].id,
        sourceTeachSkillId: michaelUI.id,
        sourceLearnSkillId: michaelPython.id,
        status: "pending"
      });
    }
    
    if (priyaData && priyaVideo && alexML) {
      await db.insert(schema.matches).values({
        sourceUserId: createdUsers[3].id,
        targetUserId: createdUsers[0].id,
        sourceTeachSkillId: priyaData.id,
        sourceLearnSkillId: priyaVideo.id,
        status: "accepted"
      });
    }
    
    // Create some messages
    console.log("Creating messages...");
    
    await db.insert(schema.messages).values([
      {
        senderId: createdUsers[3].id,
        receiverId: createdUsers[0].id,
        content: "Hi there! When can we schedule our next Python lesson?",
        read: false,
        createdAt: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        senderId: createdUsers[0].id,
        receiverId: createdUsers[3].id,
        content: "I'm available tomorrow evening around 6 PM. Does that work for you?",
        read: true,
        createdAt: new Date(Date.now() - 13 * 60000) // 13 minutes ago
      },
      {
        senderId: createdUsers[3].id,
        receiverId: createdUsers[0].id,
        content: "That's perfect! I'll prepare some questions about data structures.",
        read: false,
        createdAt: new Date(Date.now() - 10 * 60000) // 10 minutes ago
      },
      {
        senderId: createdUsers[3].id,
        receiverId: createdUsers[0].id,
        content: "Also, I found this great resource on neural networks. Would you like me to share it?",
        read: false,
        createdAt: new Date() // Just now
      }
    ]);
    
    // Create mock content
    console.log("Creating content...");
    
    await db.insert(schema.contents).values([
      {
        userId: createdUsers[0].id,
        filename: "JavaScript Fundamentals.pdf",
        type: "pdf",
        filePath: "/uploads/javascript-fundamentals.pdf",
        fileSize: 2500000,
        summary: "This comprehensive guide covers JavaScript basics including variables, functions, and control flow. It explains how the event loop works and provides practical examples of asynchronous programming with promises and async/await syntax. The document also explores modern ES6+ features and best practices for writing maintainable code.",
        status: "complete"
      },
      {
        userId: createdUsers[0].id,
        filename: "React Component Architecture.mp4",
        type: "video",
        filePath: "/uploads/react-architecture.mp4",
        fileSize: 75000000,
        summary: "Video tutorial explaining React component patterns, state management strategies, and performance optimization techniques. The presenter demonstrates how to structure large applications and implement context API for global state management.",
        status: "complete"
      },
      {
        userId: createdUsers[0].id,
        filename: "UI Design Principles.pdf",
        type: "pdf",
        filePath: "/uploads/ui-principles.pdf",
        fileSize: 3800000,
        summary: "A detailed guide on UI design fundamentals covering layout principles, color theory, typography, and accessibility best practices. The document includes case studies of successful interface redesigns and guidelines for creating consistent design systems.",
        status: "complete"
      }
    ]);
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// No need for a helper function as we imported drizzleAnd

seed();
