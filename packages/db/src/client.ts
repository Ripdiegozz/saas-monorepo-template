import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new pg.Pool({ connectionString });

/**
 * Drizzle DB client with full schema.
 * Use this in apps/server (Better Auth adapter, repositories).
 */
export const db = drizzle(pool, { schema });

export type Database = typeof db;
