import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Link2, FileBadge, ScanLine, Lock, Share2 } from "lucide-react";
import { SiteHeader } from "@/components/gigpass/SiteHeader";
import { PLATFORMS } from "@/lib/gigpass/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GigPass — Your reputation. Your passport." },
      {
        name: "description",
        content:
          "Build a portable, verifiable professional reputation across gig platforms with a cryptographically signed reputation credential.",
      },
      { property: "og:title", content: "GigPass — Your reputation. Your passport." },
      {
        property: "og:description",
        content: "A worker-owned portable reputation passport for gig workers.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: Link2,
    title: "Connect platforms",
    body: "Link simulated gig platforms and choose exactly which performance signals you share.",
  },
  {
    icon: FileBadge,
    title: "Issue your passport",
    body: "GigPass aggregates your metrics into a credential signed with a key you own.",
  },
  {
    icon: ScanLine,
    title: "Get verified anywhere",
    body: "Any platform can check the signature and confirm nothing was altered.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-accent animate-pulse-ring" />
                Demo build · simulated platforms & synthetic data
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">
                Your reputation. <span className="gradient-text">Your passport.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Build a portable, verifiable professional reputation across gig platforms.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/passport"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] glow-primary"
                >
                  Create Your Passport
                </Link>
                <Link
                  to="/verify"
                  className="rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  Verify a Passport
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                {[
                  ["3", "Simulated platforms"],
                  ["ECDSA", "P-256 signatures"],
                  ["100%", "Worker-owned keys"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-semibold">{value}</dt>
                    <dd className="text-xs text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-rise panel relative p-6" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-5" />
                  <span className="font-display text-sm font-semibold">GigPass Credential</span>
                </div>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] text-success ring-1 ring-success/30">
                  Signature valid
                </span>
              </div>
              <p className="mt-6 font-display text-4xl font-semibold">4.88</p>
              <p className="text-xs text-muted-foreground">Weighted overall rating</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["2,599", "Jobs completed"],
                  ["97.9%", "Completion rate"],
                  ["95.7%", "On-time rate"],
                  ["3", "Platforms"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-surface-2/60 p-3">
                    <p className="font-display text-lg font-semibold">{v}</p>
                    <p className="text-[11px] text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
              <p className="mt-5 break-all font-mono text-[10px] text-muted-foreground">
                proof: ECDSA-P256-SHA256 · key 4F2A 91C0 …
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">How GigPass works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="panel animate-rise p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-10 grid gap-6 p-8 md:grid-cols-2">
          <div className="flex gap-4">
            <Lock className="size-5 shrink-0 text-accent" />
            <div>
              <h3 className="font-display text-base font-semibold">Consent-first by design</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing leaves your passport unless you explicitly allow that data category to be
                shared.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Share2 className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-base font-semibold">Portable and tamper-evident</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Credentials are plain JSON with an attached signature — edit one number and
                verification fails.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
