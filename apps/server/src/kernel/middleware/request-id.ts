import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";

const HEADER = "x-request-id";

export async function requestIdMiddleware(c: Context, next: Next) {
  const id = c.req.header(HEADER) ?? randomUUID();
  c.set(HEADER, id);
  c.header(HEADER, id);
  await next();
}
