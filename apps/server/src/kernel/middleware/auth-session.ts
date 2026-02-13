import type { Context, Next } from "hono";
import { auth } from "../../auth";

export type SessionVariables = {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  userId: string | undefined;
};

/**
 * Resolves the session from the request (cookies) and sets session + userId on context.
 * Use before admin routes that require authentication.
 */
export async function authSessionMiddleware(
  c: Context<{ Variables: SessionVariables }>,
  next: Next
) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  c.set("session", session);
  c.set("userId", session?.user?.id ?? undefined);
  await next();
}
