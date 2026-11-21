"use client";
import { ErrorState } from "@/components/ui/states";
import { Card } from "@/components/ui/card";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <Card><ErrorState onRetry={reset} /></Card>;
}
