"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Click-to-open popover. `trigger` receives open state; `children` receives a close() callback. */
export function Popover({ trigger, children, align = "end", className, label }: {
  trigger: (p: { open: boolean; toggle: () => void }) => React.ReactNode; children: (p: { close: () => void }) => React.ReactNode; align?: "start" | "end"; className?: string; label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div role="menu" aria-label={label} className={cn("absolute z-40 mt-2 min-w-56 rounded-lg border border-line bg-white shadow-pop", align === "end" ? "end-0" : "start-0", className)}>
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, danger, href }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; href?: string }) {
  const cls = cn("flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-canvas", danger ? "text-danger" : "text-navy");
  return href ? <a href={href} className={cls}>{children}</a> : <button type="button" onClick={onClick} className={cls}>{children}</button>;
}
