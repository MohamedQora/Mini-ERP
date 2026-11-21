import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div aria-busy className="space-y-4">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
