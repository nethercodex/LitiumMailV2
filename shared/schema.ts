import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email messages table
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull(),
  toEmail: varchar("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email recipients table (for inbox management)
export const emailRecipients = pgTable("email_recipients", {
  id: serial("id").primaryKey(),
  emailId: serial("email_id").notNull(),
  userId: varchar("user_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentEmails: many(emails),
  receivedEmails: many(emailRecipients),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  sender: one(users, {
    fields: [emails.fromUserId],
    references: [users.id],
  }),
  recipients: many(emailRecipients),
}));

export const emailRecipientsRelations = relations(emailRecipients, ({ one }) => ({
  email: one(emails, {
    fields: [emailRecipients.emailId],
    references: [emails.id],
  }),
  user: one(users, {
    fields: [emailRecipients.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertEmailSchema = createInsertSchema(emails).pick({
  toEmail: true,
  subject: true,
  body: true,
});

export const insertEmailRecipientSchema = createInsertSchema(emailRecipients).pick({
  emailId: true,
  userId: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type EmailWithSender = Email & { sender: User };
export type EmailWithDetails = Email & { sender: User; isRead: boolean };
