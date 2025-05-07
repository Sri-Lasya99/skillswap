import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skills Table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UserSkills Table (join table for users and skills with additional metadata)
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  type: text("type").notNull(), // 'teach' or 'learn'
  proficiency: text("proficiency"), // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  description: text("description"),
  progress: integer("progress").default(0), // 0-100 for learning progress
  partners: integer("partners").default(0), // Number of people being taught
  teacher: text("teacher"), // Name of the teacher (if learning)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches Table (for skill bartering connections)
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sourceUserId: integer("source_user_id").references(() => users.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id).notNull(),
  sourceTeachSkillId: integer("source_teach_skill_id").references(() => userSkills.id).notNull(),
  sourceLearnSkillId: integer("source_learn_skill_id").references(() => userSkills.id).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content Table (for uploaded files)
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  type: text("type").notNull(), // 'pdf', 'video'
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  summary: text("summary"),
  status: text("status").default("processing").notNull(), // 'processing', 'complete', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  userSkills: many(userSkills),
  sentMatches: many(matches, { relationName: "sourceUser" }),
  receivedMatches: many(matches, { relationName: "targetUser" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  contents: many(contents),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  sourceUser: one(users, { fields: [matches.sourceUserId], references: [users.id] }),
  targetUser: one(users, { fields: [matches.targetUserId], references: [users.id] }),
  sourceTeachSkill: one(userSkills, { fields: [matches.sourceTeachSkillId], references: [userSkills.id] }),
  sourceLearnSkill: one(userSkills, { fields: [matches.sourceLearnSkillId], references: [userSkills.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id] }),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  user: one(users, { fields: [contents.userId], references: [users.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertSkillSchema = createInsertSchema(skills);
export const insertUserSkillSchema = createInsertSchema(userSkills);
export const insertMatchSchema = createInsertSchema(matches);
export const insertMessageSchema = createInsertSchema(messages);
export const insertContentSchema = createInsertSchema(contents);

// TypeScript types
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect & { skill: Skill };
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Content = typeof contents.$inferSelect;

// Custom types for the application
export type UserWithStats = User & {
  skillsShared: number;
  points: number;
};

export type UserStats = {
  activeMatches: number;
  newMatches: number;
  skillsShared: number;
  newSkillsShared: number;
  leaderboardRank: number;
  leaderboardPercentile: number;
};

export type SkillMatchWithUsers = Match & {
  sourceUser: User;
  targetUser: User;
  teachSkill: UserSkill & { skill: Skill };
  learnSkill: UserSkill & { skill: Skill };
};

export type ContentWithSummary = Content & {
  user: User;
};
