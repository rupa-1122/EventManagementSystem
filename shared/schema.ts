import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // 'student' or 'admin'
  fullName: text("full_name"),
  rollNumber: text("roll_number"),
  branch: text("branch"),
  yearOfStudy: text("year_of_study"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  date: text("date"),
  time: text("time"),
  maxSeats: integer("max_seats").notNull().default(100),
  currentRegistrations: integer("current_registrations").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  eventCategories: text("event_categories").array(),
  registrationTime: timestamp("registration_time").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loginTime: timestamp("login_time").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  fullName: true,
  rollNumber: true,
  branch: true,
  yearOfStudy: true,
  phoneNumber: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  description: true,
  category: true,
  date: true,
  time: true,
  maxSeats: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).pick({
  userId: true,
  eventId: true,
  eventCategories: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registrationFormSchema = z.object({
  eventId: z.string(),
  fullName: z.string().min(1),
  rollNumber: z.string().min(1),
  emailAddress: z.string().email(),
  phoneNumber: z.string().min(10),
  branch: z.string().min(1),
  yearOfStudy: z.string().min(1),
  eventCategories: z.array(z.string()).min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
