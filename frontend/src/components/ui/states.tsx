"use client";
import { AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useI18n } from "@/lib/i18n/provider";

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-navy/5 text-muted">{icon ?? <Inbox className="size-5" aria-hidden />}</div>
      <h3 className="t-section">{title}</h3>
      {description && <p className="t-support mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-danger-soft text-danger"><AlertCircle className="size-5" aria-hidden /></div>
      <h3 className="t-section">{title ?? t("common.error")}</h3>
      <p className="t-support mt-1 max-w-sm">{description ?? t("common.errorHint")}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>{t("common.retry")}</Button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded bg-navy/8", className)} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line" aria-busy>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className={cn("h-4", c === 0 ? "w-1/4" : "flex-1")} />)}
        </div>
      ))}
    </div>
  );
}
