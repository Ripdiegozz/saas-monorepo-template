/**
 * Super admin table. The first user to bootstrap becomes super admin.
 */
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const superAdmin = pgTable("super_admin", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
