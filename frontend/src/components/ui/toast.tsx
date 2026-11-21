"use client";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info" | "warning";
type Toast = { id: number; kind: Kind; message: string };
type Ctx = { toast: (kind: Kind, message: string) => void };
const ToastContext = createContext<Ctx | null>(null);

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: TriangleAlert };
const colors: Record<Kind, string> = { success: "text-emerald", error: "text-danger", info: "text-info", warning: "text-warning" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((x) => x.id !== id)), []);
  const toast = useCallback((kind: Kind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, kind, message }]);
    setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
  }, [dismiss]);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 end-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => {
          const Icon = icons[t.kind];
          return (
            <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className="pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-white p-3 shadow-pop">
              <Icon className={cn("mt-0.5 size-4 shrink-0", colors[t.kind])} aria-hidden />
              <p className="flex-1 text-sm">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-gray hover:text-navy"><X className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const c = useContext(ToastContext);
  if (!c) throw new Error("useToast must be used inside ToastProvider");
  return c.toast;
}
