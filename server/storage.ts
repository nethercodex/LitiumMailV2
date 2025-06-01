import {
  users,
  emails,
  emailRecipients,
  userSessions,
  type User,
  type InsertUser,
  type InsertEmail,
  type Email,
  type EmailWithSender,
  type EmailWithDetails,
  type EmailRecipient,
  type UserSession,
  type InsertUserSession,
  type RegisterData,
  type LoginData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: RegisterData): Promise<User>;
  validateUser(username: string, password: string): Promise<User | undefined>;
  
  // Email operations
  sendEmail(fromUserId: string, email: InsertEmail): Promise<Email>;
  getInboxEmails(userId: string): Promise<EmailWithDetails[]>;
  getSentEmails(userId: string): Promise<EmailWithSender[]>;
  getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined>;
  markEmailAsRead(emailId: number, userId: string): Promise<void>;
  deleteEmail(emailId: number, userId: string): Promise<void>;
  searchEmails(userId: string, query: string): Promise<EmailWithDetails[]>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUser(userId: string, userData: Partial<User>): Promise<User>;
  getUsersCount(): Promise<number>;
  getEmailsCount(): Promise<number>;
  getRecentUsersCount(): Promise<number>;
  getRecentEmailsCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: RegisterData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.username, // Используем username как id
        username: userData.username,
        email: userData.email,
        password: userData.password, // В реальном приложении пароль должен быть захеширован
        firstName: userData.firstName,
        lastName: userData.lastName,
        plan: userData.plan,
        isActive: true,
      })
      .returning();
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)));
    return user;
  }

  // Email operations
  async sendEmail(fromUserId: string, emailData: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values({
        fromUserId: fromUserId,
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        body: emailData.body,
        sentAt: new Date(),
      })
      .returning();

    // Найти получателя по email адресу
    const recipient = await this.getUserByEmail(emailData.toEmail);
    if (recipient) {
      await db.insert(emailRecipients).values({
        emailId: email.id,
        userId: recipient.id,
        isRead: false,
      });
    }

    return email;
  }

  async getInboxEmails(userId: string): Promise<EmailWithDetails[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        isRead: emailRecipients.isRead,
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .innerJoin(emailRecipients, eq(emails.id, emailRecipients.emailId))
      .where(eq(emailRecipients.userId, userId))
      .orderBy(desc(emails.sentAt));

    return result.map(row => ({
      ...row,
      isRead: row.isRead || false,
    }));
  }

  async getSentEmails(userId: string): Promise<EmailWithSender[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(eq(emails.fromUserId, userId))
      .orderBy(desc(emails.sentAt));

    return result;
  }

  async getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined> {
    const [result] = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(
        and(
          eq(emails.id, emailId),
          or(
            eq(emails.fromUserId, userId),
            eq(emailRecipients.userId, userId)
          )
        )
      )
      .leftJoin(emailRecipients, eq(emails.id, emailRecipients.emailId));

    return result;
  }

  async markEmailAsRead(emailId: number, userId: string): Promise<void> {
    await db
      .update(emailRecipients)
      .set({ isRead: true })
      .where(
        and(
          eq(emailRecipients.emailId, emailId),
          eq(emailRecipients.userId, userId)
        )
      );
  }

  async deleteEmail(emailId: number, userId: string): Promise<void> {
    // Удаляем запись получателя
    await db
      .delete(emailRecipients)
      .where(
        and(
          eq(emailRecipients.emailId, emailId),
          eq(emailRecipients.userId, userId)
        )
      );
  }

  async searchEmails(userId: string, query: string): Promise<EmailWithDetails[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        isRead: emailRecipients.isRead,
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .innerJoin(emailRecipients, eq(emails.id, emailRecipients.emailId))
      .where(
        and(
          eq(emailRecipients.userId, userId),
          or(
            like(emails.subject, `%${query}%`),
            like(emails.body, `%${query}%`)
          )
        )
      )
      .orderBy(desc(emails.sentAt));

    return result.map(row => ({
      ...row,
      isRead: row.isRead || false,
    }));
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      plan: users.plan,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }

  async getEmailsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(emails);
    return result[0].count;
  }

  async getRecentUsersCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);
    return result[0].count;
  }

  async getRecentEmailsCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(sql`${emails.createdAt} >= ${thirtyDaysAgo}`);
    return result[0].count;
  }
}

export const storage = new DatabaseStorage();