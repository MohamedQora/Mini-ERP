import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-8 items-center justify-center rounded-md bg-emerald text-sm font-bold text-white", className)} aria-hidden>M</span>
  );
}
