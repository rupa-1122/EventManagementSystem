import { type User, type InsertUser, type Event, type InsertEvent, type Registration, type InsertRegistration, type Session } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;

  // Registration methods
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistrationsByUser(userId: string): Promise<Registration[]>;
  getRegistrationsByEvent(eventId: string): Promise<Registration[]>;
  getAllRegistrations(): Promise<Registration[]>;

  // Session methods
  createSession(userId: string): Promise<Session>;
  getActiveSessions(): Promise<Session[]>;
  getUserSessions(userId: string): Promise<Session[]>;
  deactivateSession(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private registrations: Map<string, Registration>;
  private sessions: Map<string, Session>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.sessions = new Map();
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@view.edu.in",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      rollNumber: null,
      branch: null,
      yearOfStudy: null,
      phoneNumber: null,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create default events
    const techEventId = randomUUID();
    const techEvent: Event = {
      id: techEventId,
      name: "Techritz",
      description: "festival",
      category: "Art",
      date: "dec 15 2025",
      time: "12:00",
      maxSeats: 500,
      currentRegistrations: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.events.set(techEventId, techEvent);

    const yuvatarangEventId = randomUUID();
    const yuvatarangEvent: Event = {
      id: yuvatarangEventId,
      name: "yuvatarang",
      description: "",
      category: "Photography",
      date: "",
      time: "",
      maxSeats: 5000,
      currentRegistrations: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.events.set(yuvatarangEventId, yuvatarangEvent);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "student",
      fullName: insertUser.fullName || null,
      rollNumber: insertUser.rollNumber || null,
      branch: insertUser.branch || null,
      yearOfStudy: insertUser.yearOfStudy || null,
      phoneNumber: insertUser.phoneNumber || null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isActive);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent,
      description: insertEvent.description || null,
      date: insertEvent.date || null,
      time: insertEvent.time || null,
      maxSeats: insertEvent.maxSeats || 100,
      id,
      currentRegistrations: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const registration: Registration = { 
      ...insertRegistration,
      eventCategories: insertRegistration.eventCategories || null,
      id,
      registrationTime: new Date(),
    };
    this.registrations.set(id, registration);
    
    // Update event registration count
    const event = this.events.get(insertRegistration.eventId);
    if (event) {
      const updatedEvent = { ...event, currentRegistrations: event.currentRegistrations + 1 };
      this.events.set(insertRegistration.eventId, updatedEvent);
    }
    
    return registration;
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(reg => reg.userId === userId);
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(reg => reg.eventId === eventId);
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async createSession(userId: string): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      userId,
      loginTime: new Date(),
      isActive: true,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, isActive: false });
    }
  }
}

export const storage = new MemStorage();
