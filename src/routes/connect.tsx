import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Plug, Unplug } from "lucide-react";
import { PageShell } from "@/components/gigpass/PageShell";
import { PlatformCard } from "@/components/gigpass/PlatformCard";
import { PLATFORMS } from "@/lib/gigpass/data";
import { useConnections, type Connection } from "@/lib/gigpass/store";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect a Platform — GigPass" },
      {
        name: "description",
        content:
          "Link simulated gig platforms and choose exactly which performance data you consent to share in your passport.",
      },
      { property: "og:title", content: "Connect a Platform — GigPass" },
      {
        property: "og:description",
        content: "Consent-first platform linking for your reputation passport.",
      },
    ],
  }),
  component: ConnectPage,
});

const CONSENT_FIELDS = [
  { key: "shareRating", label: "Ratings & reviews", hint: "Average star rating and review counts" },
  { key: "shareVolume", label: "Job volume", hint: "Total completed jobs and tenure" },
  {
    key: "shareReliability",
    label: "Reliability metrics",
    hint: "Completion, acceptance and on-time rates",
  },
] as const;

function ConnectPage() {
  const { connections, connect, disconnect } = useConnections();
  const [pending, setPending] = useState<string | null>(null);
  const [consent, setConsent] = useState<Connection["consent"]>({
    shareRating: true,
    shareVolume: true,
    shareReliability: true,
  });

  const handleConnect = (platformId: string) => {
    setPending(platformId);
    // Simulated OAuth-style handshake. Replace with a real platform connector later.
    window.setTimeout(() => {
      connect(platformId, consent);
      setPending(null);
      toast.success("Platform connected", {
        description: "Synthetic performance data imported into your passport.",
      });
    }, 900);
  };

  return (
    <PageShell
      eyebrow="Step 1"
      title="Connect a platform"
      description="These are simulated platforms with synthetic data — no real accounts or APIs are involved. Choose what you consent to share before linking."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          {PLATFORMS.map((platform, i) => {
            const link = connections.find((c) => c.platformId === platform.id);
            const isPending = pending === platform.id;
            return (
              <PlatformCard
                key={platform.id}
                platform={platform}
                connected={Boolean(link)}
                connectedAt={link?.connectedAt}
                delay={i * 80}
                action={
                  link ? (
                    <button
                      onClick={() => {
                        disconnect(platform.id);
                        toast("Platform disconnected");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
                    >
                      <Unplug className="size-3.5" /> Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-70"
                    >
                      {isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Plug className="size-3.5" />
                      )}
                      {isPending ? "Linking…" : "Connect"}
                    </button>
                  )
                }
              />
            );
          })}
        </div>

        <aside className="panel h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Consent settings</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Applied when you connect a platform. Unshared categories are omitted from your signed
            credential.
          </p>
          <div className="mt-5 space-y-3">
            {CONSENT_FIELDS.map((field) => (
              <label
                key={field.key}
                className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-2/50 p-3 transition-colors hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={consent[field.key]}
                  onChange={(e) => setConsent((c) => ({ ...c, [field.key]: e.target.checked }))}
                  className="mt-0.5 size-4 accent-[oklch(0.66_0.21_300)]"
                />
                <span>
                  <span className="block text-sm font-medium">{field.label}</span>
                  <span className="block text-xs text-muted-foreground">{field.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
