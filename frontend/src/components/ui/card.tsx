import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("min-w-0 rounded-lg border border-line bg-white shadow-card", className)}>{children}</section>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div>
        <h2 className="t-section">{title}</h2>
        {description && <p className="t-support mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Compact KPI tile. `delta` is a ready-formatted string; pass `deltaTone` to color it. */
export function KpiCard({ label, value, delta, deltaTone = "neutral", hint, icon }: { label: string; value: string; delta?: string; deltaTone?: "up" | "down" | "neutral"; hint?: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="t-support font-medium">{label}</p>
        {icon && <span className="text-gray">{icon}</span>}
      </div>
      <p className="t-kpi mt-2 text-navy">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={cn("t-number inline-flex items-center gap-0.5 text-xs font-medium", deltaTone === "up" && "text-emerald", deltaTone === "down" && "text-danger", deltaTone === "neutral" && "text-muted")}>
            {deltaTone === "up" && <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />}
            {deltaTone === "down" && <ArrowDownRight className="size-3.5 rtl:-scale-x-100" aria-hidden />}
            {delta}
          </span>
        )}
        {hint && <span className="t-support">{hint}</span>}
      </div>
    </Card>
  );
}
