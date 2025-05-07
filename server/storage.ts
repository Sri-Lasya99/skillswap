import { db } from "@db";
import { 
  users, 
  skills, 
  userSkills, 
  matches, 
  messages, 
  contents, 
  User, 
  Skill, 
  UserSkill, 
  Match, 
  Message, 
  Content,
  UserWithStats,
  UserStats,
  SkillMatchWithUsers,
  ContentWithSummary
} from "@shared/schema";
import { eq, and, or, desc, sql, asc } from "drizzle-orm";

// Users
export const storage = {
  // User operations
  async getAllUsers(): Promise<User[]> {
    return await db.query.users.findMany({
      orderBy: asc(users.username)
    });
  },
  
  async getUserById(id: number): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result || null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result || null;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const [result] = await db.insert(users).values(userData).returning();
    return result;
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const [result] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result || null;
  },
  
  // Skill operations
  async getAllSkills(): Promise<Skill[]> {
    return await db.query.skills.findMany({
      orderBy: asc(skills.name)
    });
  },
  
  async getSkillByName(name: string): Promise<Skill | null> {
    const result = await db.query.skills.findFirst({
      where: eq(skills.name, name)
    });
    return result || null;
  },
  
  async createSkill(skillData: Omit<Skill, 'id' | 'createdAt'>): Promise<Skill> {
    const [result] = await db.insert(skills).values(skillData).returning();
    return result;
  },
  
  // UserSkill operations
  async getUserSkills(userId: number, type?: string): Promise<UserSkill[]> {
    const query = type 
      ? and(eq(userSkills.userId, userId), eq(userSkills.type, type))
      : eq(userSkills.userId, userId);
      
    return await db.query.userSkills.findMany({
      where: query,
      with: {
        skill: true
      },
      orderBy: desc(userSkills.createdAt)
    });
  },
  
  async createUserSkill(userSkillData: Omit<UserSkill, 'id' | 'createdAt'>): Promise<UserSkill> {
    const [result] = await db.insert(userSkills).values(userSkillData).returning();
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, result.skillId)
    });
    
    return { ...result, skill: skill! };
  },
  
  async updateUserSkill(id: number, data: Partial<UserSkill>): Promise<UserSkill | null> {
    const [result] = await db.update(userSkills)
      .set(data)
      .where(eq(userSkills.id, id))
      .returning();
      
    if (!result) return null;
    
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, result.skillId)
    });
    
    return { ...result, skill: skill! };
  },
  
  // Match operations
  async getUserMatches(userId: number, status?: string): Promise<SkillMatchWithUsers[]> {
    const query = status 
      ? and(
          or(
            eq(matches.sourceUserId, userId),
            eq(matches.targetUserId, userId)
          ),
          eq(matches.status, status)
        )
      : or(
          eq(matches.sourceUserId, userId),
          eq(matches.targetUserId, userId)
        );
    
    const matchesList = await db.query.matches.findMany({
      where: query,
      with: {
        sourceUser: true,
        targetUser: true,
        sourceTeachSkill: {
          with: {
            skill: true
          }
        },
        sourceLearnSkill: {
          with: {
            skill: true
          }
        }
      },
      orderBy: desc(matches.createdAt)
    });
    
    // Transform into our custom type with adjusted references based on the current user's perspective
    return matchesList.map(match => {
      if (match.sourceUserId === userId) {
        return {
          ...match,
          teachSkill: match.sourceTeachSkill,
          learnSkill: match.sourceLearnSkill
        } as unknown as SkillMatchWithUsers;
      } else {
        return {
          ...match,
          teachSkill: match.sourceLearnSkill,
          learnSkill: match.sourceTeachSkill
        } as unknown as SkillMatchWithUsers;
      }
    });
  },
  
  async createMatch(matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    const [result] = await db.insert(matches).values(matchData).returning();
    return result;
  },
  
  async updateMatch(id: number, data: Partial<Match>): Promise<Match | null> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [result] = await db.update(matches)
      .set(updateData)
      .where(eq(matches.id, id))
      .returning();
      
    return result || null;
  },
  
  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    const messagesList = await db.query.messages.findMany({
      where: or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ),
      with: {
        sender: true,
        receiver: true
      },
      orderBy: asc(messages.createdAt)
    });
    
    return messagesList;
  },
  
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    const convoMessages = await db.query.messages.findMany({
      where: or(
        and(
          eq(messages.senderId, userId1),
          eq(messages.receiverId, userId2)
        ),
        and(
          eq(messages.senderId, userId2),
          eq(messages.receiverId, userId1)
        )
      ),
      with: {
        sender: true,
        receiver: true
      },
      orderBy: asc(messages.createdAt)
    });
    
    return convoMessages;
  },
  
  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const [result] = await db.insert(messages).values(messageData).returning();
    return result;
  },
  
  async markMessagesAsRead(userId: number, senderId: number): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, senderId),
          eq(messages.read, false)
        )
      );
  },
  
  // Content operations
  async getUserContent(userId: number): Promise<ContentWithSummary[]> {
    const contentList = await db.query.contents.findMany({
      where: eq(contents.userId, userId),
      with: {
        user: true
      },
      orderBy: desc(contents.createdAt)
    });
    
    return contentList as ContentWithSummary[];
  },
  
  async createContent(contentData: Omit<Content, 'id' | 'createdAt'>): Promise<Content> {
    const [result] = await db.insert(contents).values(contentData).returning();
    return result;
  },
  
  async updateContent(id: number, data: Partial<Content>): Promise<Content | null> {
    const [result] = await db.update(contents)
      .set(data)
      .where(eq(contents.id, id))
      .returning();
      
    return result || null;
  },
  
  // Stats and leaderboard
  async getLeaderboard(): Promise<UserWithStats[]> {
    // This is a complex query that needs to calculate points based on skill sharing
    // For simplicity, using raw SQL might be better for this specific case
    const result = await db.execute<UserWithStats>(sql`
      SELECT 
        u.id, 
        u.username, 
        u.bio, 
        u.avatar, 
        u.created_at as "createdAt",
        COUNT(DISTINCT m.id) as "skillsShared",
        (COUNT(DISTINCT m.id) * 5) + (COUNT(DISTINCT us.id) * 2) as "points"
      FROM 
        users u
      LEFT JOIN 
        matches m ON (m.source_user_id = u.id OR m.target_user_id = u.id) AND m.status = 'accepted'
      LEFT JOIN 
        user_skills us ON us.user_id = u.id
      GROUP BY 
        u.id
      ORDER BY 
        "points" DESC
    `);
    
    // Convert query result to array of UserWithStats objects
    const leaderboard: UserWithStats[] = [];
    
    if (result && result.rows) {
      for (const row of result.rows) {
        // Create a proper UserWithStats object (which must include all User fields)
        leaderboard.push({
          id: Number(row.id),
          username: row.username,
          password: "", // Not used in the UI, but required by the type
          bio: row.bio,
          avatar: row.avatar,
          createdAt: row.createdAt,
          skillsShared: Number(row.skillsShared || 0),
          points: Number(row.points || 0)
        });
      }
    }
    
    return leaderboard;
  },
  
  async getUserStats(userId: number): Promise<UserStats> {
    // Get active matches count
    const activeMatches = await db.query.matches.findMany({
      where: and(
        or(
          eq(matches.sourceUserId, userId),
          eq(matches.targetUserId, userId)
        ),
        eq(matches.status, 'accepted')
      )
    });
    
    // Get new matches in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newMatches = await db.query.matches.findMany({
      where: and(
        or(
          eq(matches.sourceUserId, userId),
          eq(matches.targetUserId, userId)
        ),
        eq(matches.status, 'accepted'),
        sql`${matches.createdAt} > ${oneWeekAgo}`
      )
    });
    
    // Get skills shared (via matches)
    const skillsSharedResult = await db.execute<{ count: number }>(sql`
      SELECT 
        COUNT(DISTINCT id) as count
      FROM 
        matches
      WHERE 
        (source_user_id = ${userId} OR target_user_id = ${userId})
        AND status = 'accepted'
    `);
    
    const skillsShared = skillsSharedResult.rows && skillsSharedResult.rows.length > 0 
      ? Number(skillsSharedResult.rows[0].count) 
      : 0;
    
    // Get new skills shared in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const newSkillsSharedResult = await db.execute<{ count: number }>(sql`
      SELECT 
        COUNT(DISTINCT id) as count
      FROM 
        matches
      WHERE 
        (source_user_id = ${userId} OR target_user_id = ${userId})
        AND status = 'accepted'
        AND created_at > ${oneMonthAgo}
    `);
    
    const newSkillsShared = newSkillsSharedResult.rows && newSkillsSharedResult.rows.length > 0 
      ? Number(newSkillsSharedResult.rows[0].count) 
      : 0;
    
    // Get leaderboard rank and percentile
    const leaderboard = await this.getLeaderboard();
    const userIndex = leaderboard.findIndex(user => user.id === userId);
    const leaderboardRank = userIndex !== -1 ? userIndex + 1 : leaderboard.length;
    const leaderboardPercentile = Math.round(100 * (leaderboard.length - leaderboardRank) / leaderboard.length);
    
    return {
      activeMatches: activeMatches.length,
      newMatches: newMatches.length,
      skillsShared,
      newSkillsShared,
      leaderboardRank,
      leaderboardPercentile
    };
  }
};
