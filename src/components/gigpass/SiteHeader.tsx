import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/connect", label: "Connect" },
  { to: "/passport", label: "Passport" },
  { to: "/verify", label: "Verify" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">GigPass</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/passport"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] glow-primary"
        >
          Create passport
        </Link>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/50 px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
