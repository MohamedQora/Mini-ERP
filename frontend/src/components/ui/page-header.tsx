import { cn } from "@/lib/utils";

/** Standard page top: title, optional description, primary actions on the inline-end side. */
export function PageHeader({ title, description, actions, className }: { title: string; description?: string; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="t-page-title">{title}</h1>
        {description && <p className="t-support mt-0.5 max-w-2xl text-[13px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
