"use client";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "./button";
import { useI18n } from "@/lib/i18n/provider";

type BaseProps = { open: boolean; onClose: () => void; title: string; description?: string; children?: React.ReactNode; footer?: React.ReactNode };

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handler = () => onClose();
    d.addEventListener("close", handler);
    return () => d.removeEventListener("close", handler);
  }, [onClose]);
  return ref;
}

function Shell({ title, description, onClose, children, footer }: Omit<BaseProps, "open">) {
  const { t } = useI18n();
  return (
    <div className="flex max-h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="t-section">{title}</h2>
          {description && <p className="t-support mt-0.5">{description}</p>}
        </div>
        <IconButton label={t("common.close")} onClick={onClose} className="-me-2 -mt-1 size-8"><X className="size-4" /></IconButton>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3">{footer}</div>}
    </div>
  );
}

/** Centered dialog for quick actions. Uses the native <dialog> (focus trap + Esc handled by the browser). */
export function Dialog({ open, onClose, size = "md", ...p }: BaseProps & { size?: "sm" | "md" | "lg" }) {
  const ref = useDialog(open, onClose);
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <dialog ref={ref} onClick={(e) => e.target === ref.current && onClose()} className={cn("m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-hidden rounded-lg bg-white shadow-pop", w)}>
      {open && <Shell onClose={onClose} {...p} />}
    </dialog>
  );
}

/** Side drawer anchored to the inline-end edge (right in LTR, left in RTL). */
export function Drawer({ open, onClose, ...p }: BaseProps) {
  const ref = useDialog(open, onClose);
  return (
    <dialog ref={ref} onClick={(e) => e.target === ref.current && onClose()} className="fixed inset-y-0 end-0 start-auto m-0 h-dvh max-h-none w-[440px] max-w-full overflow-hidden bg-white shadow-pop">
      {open && <div className="h-full"><Shell onClose={onClose} {...p} /></div>}
    </dialog>
  );
}

/** Required before any destructive action. */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, loading, danger = true }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description?: string; confirmLabel?: string; loading?: boolean; danger?: boolean }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{t("common.cancel")}</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>{confirmLabel ?? t("common.confirm")}</Button>
      </>} />
  );
}
