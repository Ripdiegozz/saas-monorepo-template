import type { OpenAPIHono, RouteConfig } from "@hono/zod-openapi";
import type { Handler } from "hono";

/**
 * Wraps api.openapi() for handlers that throw on error instead of returning.
 * zod-openapi's Handler type expects a union of all response types; when we throw
 * HTTPException we never return error responses. Single central type workaround.
 */
export function registerRoute<E extends Record<string, unknown>, R extends RouteConfig>(
  api: OpenAPIHono<E>,
  route: R,
  handler: Handler
): void {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- zod-openapi Handler union vs throw
  api.openapi(route, handler as Parameters<OpenAPIHono<E>["openapi"]>[1]);
}
