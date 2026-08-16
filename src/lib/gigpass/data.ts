/**
 * Synthetic demo data for simulated gig platforms.
 * These are fictional platforms — no real API integrations exist.
 * Swap this module for real data sources (Supabase tables / platform APIs) later.
 */

export interface PlatformMetrics {
  rating: number;
  jobs: number;
  completionRate: number;
  onTimeRate: number;
  acceptanceRate: number;
  tenureMonths: number;
}

export interface Platform {
  id: string;
  name: string;
  category: string;
  blurb: string;
  accent: "primary" | "accent" | "success";
  metrics: PlatformMetrics;
}

export const PLATFORMS: Platform[] = [
  {
    id: "quickride",
    name: "QuickRide",
    category: "Rideshare",
    blurb: "Urban rideshare driving — trips, ratings and punctuality.",
    accent: "primary",
    metrics: {
      rating: 4.92,
      jobs: 1284,
      completionRate: 98.4,
      onTimeRate: 96.1,
      acceptanceRate: 91.3,
      tenureMonths: 26,
    },
  },
  {
    id: "taskgo",
    name: "TaskGo",
    category: "Local tasks",
    blurb: "On-demand household and errand tasks with client reviews.",
    accent: "accent",
    metrics: {
      rating: 4.78,
      jobs: 412,
      completionRate: 96.7,
      onTimeRate: 94.4,
      acceptanceRate: 88.9,
      tenureMonths: 14,
    },
  },
  {
    id: "flexifleet",
    name: "FlexiFleet",
    category: "Delivery",
    blurb: "Parcel and grocery delivery routes with SLA tracking.",
    accent: "success",
    metrics: {
      rating: 4.85,
      jobs: 903,
      completionRate: 97.8,
      onTimeRate: 95.2,
      acceptanceRate: 93.5,
      tenureMonths: 19,
    },
  },
];

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export interface ActivityEvent {
  id: string;
  platformId: string;
  title: string;
  detail: string;
  timestamp: string;
  kind: "review" | "milestone" | "sync" | "consent";
}

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    platformId: "quickride",
    title: "5-star trip review",
    detail: "“Smooth ride, very professional driver.” — Passenger #8821",
    timestamp: "2026-08-16T06:12:00Z",
    kind: "review",
  },
  {
    id: "a2",
    platformId: "flexifleet",
    title: "On-time streak milestone",
    detail: "120 consecutive deliveries within the promised SLA window.",
    timestamp: "2026-08-15T18:40:00Z",
    kind: "milestone",
  },
  {
    id: "a3",
    platformId: "taskgo",
    title: "Metrics synced",
    detail: "27 new completed tasks imported into your passport.",
    timestamp: "2026-08-15T09:05:00Z",
    kind: "sync",
  },
  {
    id: "a4",
    platformId: "quickride",
    title: "Consent renewed",
    detail: "Performance data sharing renewed for 90 days.",
    timestamp: "2026-08-13T11:22:00Z",
    kind: "consent",
  },
  {
    id: "a5",
    platformId: "flexifleet",
    title: "4.9-star delivery review",
    detail: "“Careful with fragile items and great communication.”",
    timestamp: "2026-08-12T20:31:00Z",
    kind: "review",
  },
  {
    id: "a6",
    platformId: "taskgo",
    title: "Completion rate improved",
    detail: "Completion rate moved from 95.9% to 96.7% this month.",
    timestamp: "2026-08-10T15:47:00Z",
    kind: "milestone",
  },
];

export interface WorkerProfile {
  id: string;
  name: string;
  handle: string;
  city: string;
  memberSince: string;
}

export const DEMO_WORKER: WorkerProfile = {
  id: "wkr_8f21c9",
  name: "Amara Osei",
  handle: "@amara.works",
  city: "Manchester, UK",
  memberSince: "2024-03-11",
};

export interface AggregateStats {
  overallRating: number;
  totalJobs: number;
  completionRate: number;
  onTimeRate: number;
  connectedCount: number;
  tenureMonths: number;
}

export function aggregate(platforms: Platform[]): AggregateStats {
  if (platforms.length === 0) {
    return {
      overallRating: 0,
      totalJobs: 0,
      completionRate: 0,
      onTimeRate: 0,
      connectedCount: 0,
      tenureMonths: 0,
    };
  }
  const totalJobs = platforms.reduce((s, p) => s + p.metrics.jobs, 0);
  const weighted = (pick: (m: PlatformMetrics) => number) =>
    platforms.reduce((s, p) => s + pick(p.metrics) * p.metrics.jobs, 0) / totalJobs;

  return {
    overallRating: Number(weighted((m) => m.rating).toFixed(2)),
    totalJobs,
    completionRate: Number(weighted((m) => m.completionRate).toFixed(1)),
    onTimeRate: Number(weighted((m) => m.onTimeRate).toFixed(1)),
    connectedCount: platforms.length,
    tenureMonths: Math.max(...platforms.map((p) => p.metrics.tenureMonths)),
  };
}
