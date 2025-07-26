import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registrationFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const session = await storage.createSession(user.id);
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName,
          rollNumber: user.rollNumber 
        },
        sessionId: session.id
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        role: "student",
      });

      res.json({ 
        message: "Registration successful",
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName,
          rollNumber: user.rollNumber 
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (sessionId) {
        await storage.deactivateSession(sessionId);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Registration routes
  app.post("/api/registrations", async (req, res) => {
    try {
      const data = registrationFormSchema.parse(req.body);
      
      // Find user by email or create if not exists
      let user = await storage.getUserByEmail(data.emailAddress);
      if (!user) {
        user = await storage.createUser({
          email: data.emailAddress,
          password: "defaultpass", // In real app, this would be handled differently
          role: "student",
          fullName: data.fullName,
          rollNumber: data.rollNumber,
          branch: data.branch,
          yearOfStudy: data.yearOfStudy,
          phoneNumber: data.phoneNumber,
        });
      } else {
        // Update user details
        await storage.updateUser(user.id, {
          fullName: data.fullName,
          rollNumber: data.rollNumber,
          branch: data.branch,
          yearOfStudy: data.yearOfStudy,
          phoneNumber: data.phoneNumber,
        });
      }

      const registration = await storage.createRegistration({
        userId: user.id,
        eventId: data.eventId,
        eventCategories: data.eventCategories,
      });

      res.json(registration);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.get("/api/registrations/user/:userId", async (req, res) => {
    try {
      const registrations = await storage.getRegistrationsByUser(req.params.userId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const registrations = await storage.getAllRegistrations();
      const sessions = await storage.getActiveSessions();
      
      // Get unique students from sessions
      const uniqueStudents = new Set();
      for (const session of sessions) {
        const user = await storage.getUser(session.userId);
        if (user && user.role === "student") {
          uniqueStudents.add(user.id);
        }
      }

      res.json({
        totalEvents: events.length,
        registeredStudents: uniqueStudents.size,
        totalRegistrations: registrations.length,
        activeEvents: events.filter(e => e.isActive).length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/student-activity", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      const studentActivity = [];

      for (const session of sessions) {
        const user = await storage.getUser(session.userId);
        if (user && user.role === "student") {
          studentActivity.push({
            id: session.id,
            studentName: user.fullName || user.rollNumber || user.email.split('@')[0],
            email: user.email,
            loginTime: session.loginTime,
          });
        }
      }

      // Sort by login time (most recent first)
      studentActivity.sort((a, b) => new Date(b.loginTime || 0).getTime() - new Date(a.loginTime || 0).getTime());

      res.json(studentActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student activity" });
    }
  });

  // User management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        branch: user.branch,
        yearOfStudy: user.yearOfStudy,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        rollNumber: updatedUser.rollNumber,
        branch: updatedUser.branch,
        yearOfStudy: updatedUser.yearOfStudy,
        phoneNumber: updatedUser.phoneNumber,
        createdAt: updatedUser.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Event category management routes
  app.get("/api/admin/event-categories", async (req, res) => {
    try {
      const categories = await storage.getEventCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event categories" });
    }
  });

  app.post("/api/admin/event-categories", async (req, res) => {
    try {
      const { category } = req.body;
      await storage.addEventCategory(category);
      res.json({ message: "Category added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add category" });
    }
  });

  app.delete("/api/admin/event-categories/:category", async (req, res) => {
    try {
      const { category } = req.params;
      await storage.deleteEventCategory(decodeURIComponent(category));
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Event management routes
  app.post("/api/admin/events", async (req, res) => {
    try {
      const eventData = req.body;
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.delete("/api/admin/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
