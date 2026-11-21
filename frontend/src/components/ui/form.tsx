"use client";
import { Search, X } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

const control = "block w-full rounded-md border bg-white px-3 text-sm text-navy placeholder:text-gray focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/25 disabled:bg-canvas disabled:text-muted";

export function Field({ label, hint, error, required, children, htmlFor }: { label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="t-label block">
        {label}{required && <span className="text-danger" aria-hidden> *</span>}
      </label>
      {children}
      {error ? <p role="alert" className="text-xs text-danger">{error}</p> : hint ? <p className="t-support">{hint}</p> : null}
    </div>
  );
}

export function Input({ invalid, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(control, "h-9", invalid ? "border-danger" : "border-line-strong", className)} {...rest} />;
}

export function Textarea({ invalid, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={cn(control, "min-h-20 py-2", invalid ? "border-danger" : "border-line-strong", className)} {...rest} />;
}

export function Select({ invalid, className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select aria-invalid={invalid || undefined} className={cn(control, "h-9 pe-8", invalid ? "border-danger" : "border-line-strong", className)} {...rest}>{children}</select>;
}

/** Controlled search box with clear button. Debounce in the caller if it triggers network requests. */
export function SearchField({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const { t } = useI18n();
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray" aria-hidden />
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? t("common.search")} aria-label={placeholder ?? t("common.search")}
        className={cn(control, "h-9 border-line-strong ps-9 pe-8 [&::-webkit-search-cancel-button]:hidden")} />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label={t("common.close")} className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray hover:text-navy">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
