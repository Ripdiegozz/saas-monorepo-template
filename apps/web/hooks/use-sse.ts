"use client";

import { useEffect, useRef, useState } from "react";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useSSE(onMessage?: (data: unknown) => void) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${getBaseUrl()}/api/realtime`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("ping", (e: Event) => {
      try {
        if (e instanceof MessageEvent) {
          const data: unknown = JSON.parse(e.data);
          onMessage?.(data);
        }
      } catch {
        onMessage?.(e);
      }
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [onMessage]);

  return { connected };
}
