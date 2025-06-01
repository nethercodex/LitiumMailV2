import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmailSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email routes
  app.post('/api/emails/send', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailData = insertEmailSchema.parse(req.body);
      
      const email = await storage.sendEmail(userId, emailData);
      res.json(email);
    } catch (error) {
      console.error("Error sending email:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid email data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    }
  });

  app.get('/api/emails/inbox', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emails = await storage.getInboxEmails(userId);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching inbox:", error);
      res.status(500).json({ message: "Failed to fetch inbox" });
    }
  });

  app.get('/api/emails/sent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emails = await storage.getSentEmails(userId);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching sent emails:", error);
      res.status(500).json({ message: "Failed to fetch sent emails" });
    }
  });

  app.get('/api/emails/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailId = parseInt(req.params.id);
      
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }

      const email = await storage.getEmailById(emailId, userId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Mark as read if user is recipient
      await storage.markEmailAsRead(emailId, userId);

      res.json(email);
    } catch (error) {
      console.error("Error fetching email:", error);
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  app.patch('/api/emails/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailId = parseInt(req.params.id);
      
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }

      await storage.markEmailAsRead(emailId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking email as read:", error);
      res.status(500).json({ message: "Failed to mark email as read" });
    }
  });

  app.delete('/api/emails/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emailId = parseInt(req.params.id);
      
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }

      await storage.deleteEmail(emailId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  app.get('/api/emails/search/:query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.params.query;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const emails = await storage.searchEmails(userId, query);
      res.json(emails);
    } catch (error) {
      console.error("Error searching emails:", error);
      res.status(500).json({ message: "Failed to search emails" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
