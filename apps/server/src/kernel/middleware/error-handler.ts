import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

interface CodedError extends Error {
  code?: string;
}

function isCodedError(e: Error): e is CodedError {
  return "code" in e;
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  const code = isCodedError(err) ? err.code : undefined;
  if (code === "NOT_FOUND") {
    return c.json({ error: err.message }, 404);
  }
  if (code === "UNAUTHORIZED") {
    return c.json({ error: err.message }, 401);
  }
  if (code === "FORBIDDEN") {
    return c.json({ error: err.message }, 403);
  }
  if (code === "CONFLICT") {
    return c.json({ error: err.message }, 409);
  }
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
}
