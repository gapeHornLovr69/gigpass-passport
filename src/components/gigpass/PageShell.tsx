import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

interface PageShellProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ eyebrow, title, description, actions, children }: PageShellProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {title ? (
          <div className="animate-rise mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </main>
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-xs text-muted-foreground sm:px-6">
          GigPass demo — QuickRide, TaskGo and FlexiFleet are fictional platforms and all metrics
          are synthetic. No real platform integrations are used.
        </div>
      </footer>
    </div>
  );
}
