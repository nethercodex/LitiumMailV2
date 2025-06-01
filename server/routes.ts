import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { registerSchema, loginSchema, insertEmailSchema } from "@shared/schema";

// Настройка постоянных сессий с базой данных
const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах
const pgStore = connectPg(session);

const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

// Middleware для проверки аутентификации
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = req.session.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Добавляем cookie parser
  app.use(cookieParser());
  
  // Настройка сессий с базой данных
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'litium-space-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'litium.session',
    cookie: {
      secure: false, // true для HTTPS в продакшене
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: 'lax'
    }
  }));

  // Custom Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Проверяем, что пользователь не существует
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email уже используется" });
      }

      // Создаем пользователя
      const user = await storage.createUser(userData);
      
      // Создаем сессию
      (req as any).session.user = user;
      
      res.json({ user, message: "Регистрация успешна" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(loginData.username, loginData.password);
      if (!user) {
        return res.status(401).json({ message: "Неверные данные входа" });
      }

      // Создаем сессию
      (req as any).session.user = user;
      
      res.json({ user, message: "Вход выполнен успешно" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Ошибка входа" });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie('litium.session');
      res.json({ message: "Выход выполнен успешно" });
    });
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const totalUsers = await storage.getUsersCount();
      const totalEmails = await storage.getEmailsCount();
      const recentUsers = await storage.getRecentUsersCount();
      const recentEmails = await storage.getRecentEmailsCount();
      
      // Calculate growth percentages
      const userGrowth = totalUsers > 0 ? Math.round((recentUsers / Math.max(totalUsers - recentUsers, 1)) * 100) : 0;
      const emailGrowth = totalEmails > 0 ? Math.round((recentEmails / Math.max(totalEmails - recentEmails, 1)) * 100) : 0;

      res.json({
        totalUsers,
        totalEmails,
        recentUsers,
        recentEmails,
        userGrowth,
        emailGrowth,
        systemUptime: 99.5,
        serversOnline: "1/1"
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId", requireAuth, async (req: any, res) => {
    try {
      console.log("PATCH request received, user:", req.user);
      const userId = req.user.id;
      if (userId !== 'support') {
        console.log("Access denied for user:", userId);
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId: targetUserId } = req.params;
      const userData = req.body;
      console.log("Updating user:", targetUserId, "with data:", userData);

      const updatedUser = await storage.updateUser(targetUserId, userData);
      console.log("User updated successfully:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Email routes
  app.post("/api/emails/send", requireAuth, async (req: any, res) => {
    try {
      const emailData = insertEmailSchema.parse(req.body);
      const email = await storage.sendEmail(req.user.id, emailData);
      res.json(email);
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  app.get("/api/emails/inbox", requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getInboxEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get inbox error:", error);
      res.status(500).json({ message: "Failed to get inbox" });
    }
  });

  app.get("/api/emails/sent", requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getSentEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get sent emails error:", error);
      res.status(500).json({ message: "Failed to get sent emails" });
    }
  });

  app.get("/api/emails/:id", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const email = await storage.getEmailById(emailId, req.user.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      console.error("Get email error:", error);
      res.status(500).json({ message: "Failed to get email" });
    }
  });

  app.put("/api/emails/:id/read", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.markEmailAsRead(emailId, req.user.id);
      res.json({ message: "Email marked as read" });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.delete("/api/emails/:id", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.deleteEmail(emailId, req.user.id);
      res.json({ message: "Email deleted" });
    } catch (error) {
      console.error("Delete email error:", error);
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  app.get("/api/emails/search/:query", requireAuth, async (req: any, res) => {
    try {
      const query = req.params.query;
      const emails = await storage.searchEmails(req.user.id, query);
      res.json(emails);
    } catch (error) {
      console.error("Search emails error:", error);
      res.status(500).json({ message: "Failed to search emails" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}