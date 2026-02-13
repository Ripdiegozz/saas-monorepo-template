/**
 * Business tables: tenant-scoped Service, Availability, Appointment, Subscription (Polar).
 * All tenant-scoped tables use organizationId (Better Auth organization = tenant).
 */
import { pgTable, text, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const service = pgTable("service", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("durationMinutes").notNull(), // slot duration in minutes
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const availability = pgTable("availability", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  serviceId: text("serviceId")
    .notNull()
    .references(() => service.id, { onDelete: "cascade" }),
  dayOfWeek: integer("dayOfWeek").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text("startTime").notNull(), // e.g. "09:00"
  endTime: text("endTime").notNull(), // e.g. "17:00"
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const appointment = pgTable("appointment", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  serviceId: text("serviceId")
    .notNull()
    .references(() => service.id, { onDelete: "cascade" }),
  startAt: timestamp("startAt", { mode: "date" }).notNull(),
  endAt: timestamp("endAt", { mode: "date" }).notNull(),
  customerEmail: text("customerEmail").notNull(),
  customerName: text("customerName"),
  status: text("status").notNull().default("scheduled"), // scheduled | canceled | completed
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" })
    .unique(), // one subscription per org
  polarSubscriptionId: text("polarSubscriptionId").unique(),
  polarCustomerId: text("polarCustomerId"),
  plan: text("plan").notNull(), // free | pro | enterprise
  status: text("status").notNull().default("active"), // active | canceled | past_due | etc.
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
