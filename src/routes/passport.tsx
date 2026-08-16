import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, Loader2, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell } from "@/components/gigpass/PageShell";
import { aggregate, DEMO_WORKER } from "@/lib/gigpass/data";
import { useConnections } from "@/lib/gigpass/store";
import {
  encodeCredentialForUrl,
  issueCredential,
  loadCredential,
  saveCredential,
  type SignedCredential,
} from "@/lib/gigpass/credential";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Reputation Passport — GigPass" },
      {
        name: "description",
        content:
          "Issue a cryptographically signed reputation credential containing your verified cross-platform performance metrics.",
      },
      { property: "og:title", content: "Reputation Passport — GigPass" },
      {
        property: "og:description",
        content: "Your portable, signed gig reputation credential.",
      },
    ],
  }),
  component: PassportPage,
});

function PassportPage() {
  const { connectedPlatforms, connections } = useConnections();
  const stats = aggregate(connectedPlatforms);
  const [credential, setCredential] = useState<SignedCredential | null>(() => loadCredential());
  const [issuing, setIssuing] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const issue = async () => {
    if (connectedPlatforms.length === 0) {
      toast.error("Connect at least one platform first.");
      return;
    }
    setIssuing(true);
    try {
      const next = await issueCredential(connectedPlatforms, connections);
      setCredential(next);
      saveCredential(next);
      toast.success("Credential issued, signed, and saved");
    } catch {
      toast.error("Could not issue the credential in this browser.");
    } finally {
      setIssuing(false);
    }
  };

  const json = credential ? JSON.stringify(credential, null, 2) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(json);
    toast.success("Credential copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${credential?.payload.credentialId ?? "gigpass"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell
      eyebrow="Step 2"
      title="Reputation passport"
      description="Aggregate your connected platform metrics into one persistent, cryptographically signed credential. This prototype signs locally with the worker-owned demo key."
      actions={
        <button
          onClick={issue}
          disabled={issuing}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-70"
        >
          {issuing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {credential ? "Re-issue credential" : "Issue credential"}
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="panel animate-rise relative overflow-hidden p-7">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <span className="font-display text-sm font-semibold">GigPass Credential</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] ring-1 ${
                credential
                  ? "bg-success/15 text-success ring-success/30"
                  : "bg-secondary text-muted-foreground ring-border"
              }`}
            >
              {credential ? "Signed" : "Unsigned draft"}
            </span>
          </div>

          <div className="relative mt-6">
            <p className="font-display text-2xl font-semibold">{DEMO_WORKER.name}</p>
            <p className="text-xs text-muted-foreground">
              {DEMO_WORKER.handle} · {DEMO_WORKER.city}
            </p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            {[
              [stats.overallRating ? stats.overallRating.toFixed(2) : "—", "Overall rating"],
              [stats.totalJobs.toLocaleString(), "Jobs completed"],
              [`${stats.completionRate || 0}%`, "Completion rate"],
              [String(stats.connectedCount), "Platforms"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-surface-2/60 p-4">
                <p className="font-display text-xl font-semibold">{v}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>

          <ul className="relative mt-5 space-y-2">
            {connectedPlatforms.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <span>{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {p.metrics.rating.toFixed(2)} ★ · {p.metrics.jobs.toLocaleString()} jobs
                </span>
              </li>
            ))}
            {connectedPlatforms.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No platforms connected.{" "}
                <Link to="/connect" className="text-accent hover:underline">
                  Connect one
                </Link>
                .
              </li>
            ) : null}
          </ul>

          {credential ? (
            <div className="relative mt-6 space-y-1 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
              <p>id: {credential.payload.credentialId}</p>
              <p>proof: {credential.proof.type}</p>
              <p>key: {credential.proof.keyFingerprint}</p>
              <p>expires: {new Date(credential.payload.expiresAt).toLocaleDateString()}</p>
            </div>
          ) : null}

          {credential ? (
            <div className="relative mt-6 grid gap-4 rounded-2xl border border-border/60 bg-surface-2/40 p-4 sm:grid-cols-[1fr_160px] sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-accent">
                  <QrCode className="size-4" />
                  <p className="font-display text-sm font-semibold">Quick verification</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Scan this QR code to open GigPass verification for this credential. The QR only
                  contains the public verification URL.
                </p>
                <a
                  href={`/verify#credential=${encodeCredentialForUrl(credential)}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  Open verifier <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="mx-auto rounded-xl bg-white p-2">
                <img
                  src={`https://quickchart.io/qr?size=180&text=${encodeURIComponent(
                    `${origin}/verify#credential=${encodeCredentialForUrl(credential)}`,
                  )}`}
                  alt="QR code for credential verification"
                  className="size-36"
                  loading="lazy"
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="panel flex min-h-[420px] flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">Signed credential JSON</h2>
            {credential ? (
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Copy className="size-3.5" /> Copy
                </button>
                <button
                  onClick={download}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Download className="size-3.5" /> Download
                </button>
              </div>
            ) : null}
          </div>
          <pre className="mt-4 flex-1 overflow-auto rounded-xl bg-surface-2/50 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {json ||
              "Issue a credential to generate the signed JSON you can hand to another platform."}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Paste this into the{" "}
            <Link to="/verify" className="text-accent hover:underline">
              verification page
            </Link>{" "}
            to confirm the signature — change any value and verification will fail.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
