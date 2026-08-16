import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Briefcase, Gauge, Layers, Activity, Plus } from "lucide-react";
import { PageShell } from "@/components/gigpass/PageShell";
import { StatCard } from "@/components/gigpass/StatCard";
import { PlatformCard } from "@/components/gigpass/PlatformCard";
import { ACTIVITY, aggregate, DEMO_WORKER, getPlatform } from "@/lib/gigpass/data";
import { useConnections } from "@/lib/gigpass/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Worker Dashboard — GigPass" },
      {
        name: "description",
        content:
          "Track your overall rating, completed jobs, completion rate and connected gig platforms in one dashboard.",
      },
      { property: "og:title", content: "Worker Dashboard — GigPass" },
      {
        property: "og:description",
        content: "Your cross-platform gig performance at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { connectedPlatforms, connections } = useConnections();
  const stats = aggregate(connectedPlatforms);
  const connectedIds = new Set(connectedPlatforms.map((p) => p.id));
  const activity = ACTIVITY.filter((a) => connectedIds.has(a.platformId));

  return (
    <PageShell
      eyebrow={`Welcome back, ${DEMO_WORKER.name.split(" ")[0]}`}
      title="Worker dashboard"
      description={`${DEMO_WORKER.handle} · ${DEMO_WORKER.city} · synthetic demo profile`}
      actions={
        <div className="flex gap-2">
          <Link
            to="/connect"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" /> Connect platform
          </Link>
          <Link
            to="/passport"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary"
          >
            View passport
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overall rating"
          value={stats.overallRating ? stats.overallRating.toFixed(2) : "—"}
          hint="Weighted by jobs completed"
          icon={Star}
          delay={0}
        />
        <StatCard
          label="Total jobs completed"
          value={stats.totalJobs.toLocaleString()}
          hint={`Across ${stats.connectedCount} platform${stats.connectedCount === 1 ? "" : "s"}`}
          icon={Briefcase}
          tone="accent"
          delay={70}
        />
        <StatCard
          label="Completion rate"
          value={stats.completionRate ? `${stats.completionRate}%` : "—"}
          hint={`On-time ${stats.onTimeRate || 0}%`}
          icon={Gauge}
          tone="success"
          delay={140}
        />
        <StatCard
          label="Connected platforms"
          value={String(stats.connectedCount)}
          hint={`Longest tenure ${stats.tenureMonths} months`}
          icon={Layers}
          delay={210}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connected platforms</h2>
            <Link to="/connect" className="text-sm text-accent hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {connectedPlatforms.map((platform, i) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                connected
                connectedAt={connections.find((c) => c.platformId === platform.id)?.connectedAt}
                delay={i * 80}
              />
            ))}
            {connectedPlatforms.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-muted-foreground md:col-span-2">
                No platforms connected yet.{" "}
                <Link to="/connect" className="text-accent hover:underline">
                  Connect one to start building your passport.
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Recent reputation activity</h2>
          <ol className="panel mt-4 divide-y divide-border/60 p-2">
            {activity.map((event) => (
              <li key={event.id} className="flex gap-3 p-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
                  <Activity className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {getPlatform(event.platformId)?.name} ·{" "}
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {activity.length === 0 ? (
              <li className="p-6 text-center text-sm text-muted-foreground">No activity yet.</li>
            ) : null}
          </ol>
        </section>
      </div>
    </PageShell>
  );
}
