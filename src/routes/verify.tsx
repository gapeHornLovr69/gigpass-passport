import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, Loader2, ScanLine, ShieldAlert, XCircle } from "lucide-react";
import { PageShell } from "@/components/gigpass/PageShell";
import {
  decodeCredentialFromUrl,
  loadCredential,
  verifyCredential,
  type SignedCredential,
  type VerificationResult,
} from "@/lib/gigpass/credential";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Passport — GigPass" },
      {
        name: "description",
        content:
          "Paste a GigPass credential to cryptographically verify its signature and confirm the performance data has not been modified.",
      },
      { property: "og:title", content: "Verify a Passport — GigPass" },
      {
        property: "og:description",
        content: "Check a GigPass reputation credential's signature in seconds.",
      },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastCredential, setLastCredential] = useState<SignedCredential | null>(() => loadCredential());

  useEffect(() => {
    const stored = loadCredential();
    setLastCredential(stored);
    const hash = window.location.hash;
    const encoded = hash.startsWith("#credential=") ? hash.slice("#credential=".length) : "";
    const encodedCredential = encoded ? decodeCredentialFromUrl(encoded) : null;
    if (encodedCredential) {
      setRaw(JSON.stringify(encodedCredential, null, 2));
      void verifyCredential(JSON.stringify(encodedCredential)).then(setResult);
    }
  }, []);

  const run = async () => {
    setChecking(true);
    setResult(await verifyCredential(raw.trim()));
    setChecking(false);
  };

  return (
    <PageShell
      eyebrow="For platforms & clients"
      title="Verify a passport"
      description="Verification happens locally with the Web Crypto API: the payload is re-hashed and checked against the attached ECDSA P-256 signature."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <label htmlFor="cred" className="font-display text-base font-semibold">
            Credential JSON
          </label>
          <textarea
            id="cred"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder='{ "payload": { … }, "proof": { … } }'
            className="mt-3 h-80 w-full resize-none rounded-xl border border-input bg-surface-2/50 p-4 font-mono text-[11px] leading-relaxed outline-none transition-colors focus:border-primary"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => lastCredential && setRaw(JSON.stringify(lastCredential, null, 2))}
              disabled={!lastCredential}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <ClipboardCheck className="size-3.5" /> Load last credential
            </button>
            <button
              type="button"
              onClick={() => {
                if (!lastCredential) return;
                const tampered = structuredClone(lastCredential);
                tampered.payload.summary.overallRating = Number(
                  (tampered.payload.summary.overallRating + 0.2).toFixed(2),
                );
                setRaw(JSON.stringify(tampered, null, 2));
                setResult(null);
              }}
              disabled={!lastCredential}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <ShieldAlert className="size-3.5" /> Tamper demo
            </button>
          </div>
          <button
            onClick={run}
            disabled={!raw.trim() || checking}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-60"
          >
            {checking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanLine className="size-4" />
            )}
            Verify credential
          </button>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-base font-semibold">Verification result</h2>

          {!result ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Paste a credential and run verification to see the outcome.
            </p>
          ) : result.status === "invalid" ? (
            <div className="animate-rise mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
              <p className="flex items-center gap-2 font-medium text-destructive">
                <XCircle className="size-5" /> Verification failed
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{result.reason}</p>
            </div>
          ) : (
            <div className="animate-rise mt-4 space-y-4">
              <div className="rounded-xl border border-success/40 bg-success/10 p-4">
                <p className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="size-5" /> Signature valid — credential unmodified
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.expired
                    ? "Note: this credential is past its expiry date."
                    : "Credential is within its validity window."}
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary">Why this works</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  The credential is canonicalized and checked against its attached ECDSA P-256
                  signature. Change a signed field and the proof no longer matches.
                </p>
              </div>

              <div className="rounded-xl bg-surface-2/50 p-4">
                <p className="font-display text-lg font-semibold">
                  {result.credential.payload.subject.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.credential.payload.subject.handle} ·{" "}
                  {result.credential.payload.subject.city}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    [result.credential.payload.summary.overallRating.toFixed(2), "Overall rating"],
                    [
                      result.credential.payload.summary.totalJobs.toLocaleString(),
                      "Jobs completed",
                    ],
                    [`${result.credential.payload.summary.completionRate}%`, "Completion rate"],
                    [
                      String(result.credential.payload.summary.connectedPlatforms),
                      "Platforms included",
                    ],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-lg bg-background/40 p-3">
                      <dt className="text-[11px] text-muted-foreground">{l}</dt>
                      <dd className="font-display text-lg font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-4 space-y-2">
                  {result.credential.payload.platforms.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                    >
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.rating.toFixed(2)} ★ · {p.jobs.toLocaleString()} jobs
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                  key {result.credential.proof.keyFingerprint} · {result.credential.proof.type}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
