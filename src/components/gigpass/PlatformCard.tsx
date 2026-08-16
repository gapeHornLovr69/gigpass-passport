import { Star, CheckCircle2, Clock } from "lucide-react";
import type { Platform } from "@/lib/gigpass/data";

const ACCENTS: Record<Platform["accent"], string> = {
  primary: "from-primary/25 to-transparent text-primary",
  accent: "from-accent/25 to-transparent text-accent",
  success: "from-success/25 to-transparent text-success",
};

interface PlatformCardProps {
  platform: Platform;
  connected?: boolean | undefined;
  connectedAt?: string | undefined;
  action?: React.ReactNode | undefined;
  delay?: number | undefined;
}

export function PlatformCard({
  platform,
  connected,
  connectedAt,
  action,
  delay = 0,
}: PlatformCardProps) {
  const { metrics } = platform;
  return (
    <div
      className="panel animate-rise relative overflow-hidden p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br blur-2xl ${ACCENTS[platform.accent]}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{platform.name}</h3>
            {connected ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success ring-1 ring-success/30">
                Connected
              </span>
            ) : (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                Not connected
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{platform.category} · simulated</p>
        </div>
        {action}
      </div>

      <p className="relative mt-3 text-sm text-muted-foreground">{platform.blurb}</p>

      <dl className="relative mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-surface-2/60 p-2.5">
          <dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <Star className="size-3" /> Rating
          </dt>
          <dd className="mt-1 font-display text-base font-semibold">{metrics.rating.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg bg-surface-2/60 p-2.5">
          <dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="size-3" /> Jobs
          </dt>
          <dd className="mt-1 font-display text-base font-semibold">
            {metrics.jobs.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg bg-surface-2/60 p-2.5">
          <dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" /> On-time
          </dt>
          <dd className="mt-1 font-display text-base font-semibold">{metrics.onTimeRate}%</dd>
        </div>
      </dl>

      {connectedAt ? (
        <p className="relative mt-3 text-[11px] text-muted-foreground">
          Linked {new Date(connectedAt).toLocaleDateString()}
        </p>
      ) : null}
    </div>
  );
}
