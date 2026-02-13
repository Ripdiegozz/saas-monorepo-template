import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

const api = new Hono();

api.get("/realtime", (c) => {
  return streamSSE(c, async (stream) => {
    stream.writeSSE({
      data: JSON.stringify({ type: "connected", ts: new Date().toISOString() }),
      event: "open",
    });
    const interval = setInterval(() => {
      stream.writeSSE({
        data: JSON.stringify({ type: "heartbeat", ts: new Date().toISOString() }),
        event: "ping",
      });
    }, 30000);
    c.req.raw.signal.addEventListener("abort", () => {
      clearInterval(interval);
      stream.close();
    });
  });
});

export { api as realtimeRoutes };
