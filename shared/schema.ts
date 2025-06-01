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
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(), // username without @litium.space
  email: varchar("email", { length: 255 }).unique().notNull(), // full email with @litium.space
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan", { length: 50 }).default("basic").notNull(), // basic, pro, enterprise
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email messages table
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toEmail: varchar("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email recipients table (for inbox management)
export const emailRecipients = pgTable("email_recipients", {
  id: serial("id").primaryKey(),
  emailId: serial("email_id").notNull(),
  userId: serial("user_id").notNull(),
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

// Auth schemas
export const registerSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").max(50, "Слишком длинное имя пользователя"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  firstName: z.string().min(1, "Введите имя").max(100),
  lastName: z.string().min(1, "Введите фамилию").max(100),
  plan: z.enum(["basic", "pro", "enterprise"]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type EmailWithSender = Email & { sender: User };
export type EmailWithDetails = Email & { sender: User; isRead: boolean };
