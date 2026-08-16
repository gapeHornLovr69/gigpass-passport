import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success";
  delay?: number;
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/15 text-primary ring-primary/25",
  accent: "bg-accent/15 text-accent ring-accent/25",
  success: "bg-success/15 text-success ring-success/25",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="panel animate-rise p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-lg ring-1 ${TONES[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
