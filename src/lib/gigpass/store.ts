import { useCallback, useEffect, useState } from "react";
import { PLATFORMS, type Platform } from "./data";

/**
 * Local persistence layer for connected platforms + consent.
 * Replace these functions with Supabase queries when a backend is connected.
 */
const STORAGE_KEY = "gigpass.connections.v1";

export interface Connection {
  platformId: string;
  connectedAt: string;
  consent: {
    shareRating: boolean;
    shareVolume: boolean;
    shareReliability: boolean;
  };
}

const DEFAULT_CONNECTIONS: Connection[] = [
  {
    platformId: "quickride",
    connectedAt: "2025-11-02T10:00:00Z",
    consent: { shareRating: true, shareVolume: true, shareReliability: true },
  },
  {
    platformId: "flexifleet",
    connectedAt: "2026-02-18T10:00:00Z",
    consent: { shareRating: true, shareVolume: true, shareReliability: true },
  },
];

function read(): Connection[] {
  if (typeof window === "undefined") return DEFAULT_CONNECTIONS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_CONNECTIONS;
  try {
    return JSON.parse(raw) as Connection[];
  } catch {
    return DEFAULT_CONNECTIONS;
  }
}

function write(connections: Connection[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  window.dispatchEvent(new CustomEvent("gigpass:connections"));
}

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setConnections(read());
    sync();
    setHydrated(true);
    window.addEventListener("gigpass:connections", sync);
    return () => window.removeEventListener("gigpass:connections", sync);
  }, []);

  const connect = useCallback((platformId: string, consent: Connection["consent"]) => {
    const next = read().filter((c) => c.platformId !== platformId);
    next.push({ platformId, connectedAt: new Date().toISOString(), consent });
    write(next);
  }, []);

  const disconnect = useCallback((platformId: string) => {
    write(read().filter((c) => c.platformId !== platformId));
  }, []);

  const connectedPlatforms: Platform[] = connections
    .map((c) => PLATFORMS.find((p) => p.id === c.platformId))
    .filter((p): p is Platform => Boolean(p));

  return { connections, connectedPlatforms, connect, disconnect, hydrated };
}
