import {
  users,
  emails,
  emailRecipients,
  type User,
  type UpsertUser,
  type InsertEmail,
  type Email,
  type EmailWithSender,
  type EmailWithDetails,
  type EmailRecipient,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email operations
  sendEmail(fromUserId: string, email: InsertEmail): Promise<Email>;
  getInboxEmails(userId: string): Promise<EmailWithDetails[]>;
  getSentEmails(userId: string): Promise<EmailWithSender[]>;
  getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined>;
  markEmailAsRead(emailId: number, userId: string): Promise<void>;
  deleteEmail(emailId: number, userId: string): Promise<void>;
  searchEmails(userId: string, query: string): Promise<EmailWithDetails[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Email operations
  async sendEmail(fromUserId: string, emailData: InsertEmail): Promise<Email> {
    // Create the email
    const [email] = await db
      .insert(emails)
      .values({
        fromUserId,
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        body: emailData.body,
      })
      .returning();

    // Find recipient user by email
    const recipientUser = await this.getUserByEmail(emailData.toEmail);
    
    // If recipient exists in our system, add to their inbox
    if (recipientUser) {
      await db.insert(emailRecipients).values({
        emailId: email.id,
        userId: recipientUser.id,
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
        isRead: emailRecipients.isRead,
        createdAt: emails.createdAt,
        updatedAt: emails.updatedAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emailRecipients)
      .innerJoin(emails, eq(emailRecipients.emailId, emails.id))
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(
        and(
          eq(emailRecipients.userId, userId),
          eq(emailRecipients.isDeleted, false)
        )
      )
      .orderBy(desc(emails.createdAt));

    return result;
  }

  async getSentEmails(userId: string): Promise<EmailWithSender[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        isRead: emails.isRead,
        createdAt: emails.createdAt,
        updatedAt: emails.updatedAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(eq(emails.fromUserId, userId))
      .orderBy(desc(emails.createdAt));

    return result;
  }

  async getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined> {
    // Check if user can access this email (either sent by them or received by them)
    const [result] = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        isRead: emails.isRead,
        createdAt: emails.createdAt,
        updatedAt: emails.updatedAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .leftJoin(emailRecipients, eq(emailRecipients.emailId, emails.id))
      .where(
        and(
          eq(emails.id, emailId),
          or(
            eq(emails.fromUserId, userId),
            eq(emailRecipients.userId, userId)
          )
        )
      );

    return result;
  }

  async markEmailAsRead(emailId: number, userId: string): Promise<void> {
    // Mark as read in emailRecipients table if user is recipient
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
    // Soft delete for recipients
    await db
      .update(emailRecipients)
      .set({ isDeleted: true })
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
        isRead: emailRecipients.isRead,
        createdAt: emails.createdAt,
        updatedAt: emails.updatedAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emailRecipients)
      .innerJoin(emails, eq(emailRecipients.emailId, emails.id))
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(
        and(
          eq(emailRecipients.userId, userId),
          eq(emailRecipients.isDeleted, false),
          or(
            like(emails.subject, `%${query}%`),
            like(emails.body, `%${query}%`),
            like(users.email, `%${query}%`)
          )
        )
      )
      .orderBy(desc(emails.createdAt));

    return result;
  }
}

export const storage = new DatabaseStorage();
