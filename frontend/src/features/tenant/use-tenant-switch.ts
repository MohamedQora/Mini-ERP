"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Switching brand = server verifies membership and writes app_metadata.tenant_id, then the browser
 * refreshes its JWT so RLS (auth.current_tenant_id()) sees the new tenant.
 */
export function useTenantSwitch() {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function switchTo(tenantId: string, then?: string) {
    setPendingId(tenantId);
    setError(null);
    try {
      const res = await fetch("/api/tenant/switch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tenantId }) });
      if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "switch failed");
      const { error: refreshError } = await createClient().auth.refreshSession();
      if (refreshError) throw refreshError;
      if (then) router.replace(then);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "switch failed");
      return false;
    } finally {
      setPendingId(null);
    }
  }
  return { switchTo, pendingId, error };
}
