"use client";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: string; count?: number };

/** Controlled tab strip. Render the active panel yourself. */
export function Tabs({ items, value, onChange, label }: { items: TabItem[]; value: string; onChange: (id: string) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button key={it.id} role="tab" type="button" aria-selected={active} onClick={() => onChange(it.id)}
            className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors", active ? "border-emerald text-navy" : "border-transparent text-muted hover:text-navy")}>
            {it.label}
            {it.count !== undefined && <span className="t-number ms-1.5 rounded-full bg-navy/5 px-1.5 text-xs">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
