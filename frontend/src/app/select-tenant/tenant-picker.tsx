"use client";
import { Building2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTenantSwitch } from "@/features/tenant/use-tenant-switch";
import { useI18n } from "@/lib/i18n/provider";

export function TenantPicker({ tenants }: { tenants: { id: string; name: string }[] }) {
  const { t } = useI18n();
  const { switchTo, pendingId, error } = useTenantSwitch();
  const auto = useRef(false);

  // A user with exactly one brand never needs to choose.
  useEffect(() => {
    if (tenants.length === 1 && !auto.current) { auto.current = true; void switchTo(tenants[0].id, "/"); }
  }, [tenants]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2">
      {tenants.map((x) => (
        <button key={x.id} type="button" disabled={pendingId !== null} onClick={() => switchTo(x.id, "/")}
          className="flex w-full items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-start shadow-card hover:border-emerald disabled:opacity-60">
          <Building2 className="size-5 text-muted" aria-hidden />
          <span className="flex-1 font-medium">{x.name}</span>
          {pendingId === x.id && <span className="t-support">{t("header.switching")}</span>}
        </button>
      ))}
      {error && <p role="alert" className="text-sm text-danger">{t("header.switchFailed")}</p>}
    </div>
  );
}
