"use client";
import { Bell, Building2, Check, ChevronDown, LogOut, Menu, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { useTenantSwitch } from "@/features/tenant/use-tenant-switch";
import { IconButton } from "@/components/ui/button";
import { Popover } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandSearch } from "./command-search";
import { LanguageSwitcher } from "./language-switcher";

export type ShellContext = {
  userName: string; userEmail: string; roleCode: string | null; roleName: string | null;
  tenants: { id: string; name: string }[]; activeTenantId: string | null; visibleKeys: string[];
};

export function Header({ ctx, onOpenMenu }: { ctx: ShellContext; onOpenMenu: () => void }) {
  const { t } = useI18n();
  const active = ctx.tenants.find((x) => x.id === ctx.activeTenantId);
  const initials = (ctx.userName || ctx.userEmail).trim().slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-white px-3 sm:px-5">
      <IconButton label={t("nav.open")} onClick={onOpenMenu} className="md:hidden"><Menu className="size-5" /></IconButton>
      <div className="hidden min-w-0 flex-1 md:block"><Breadcrumbs /></div>
      <div className="flex-1 md:hidden" />

      <CommandSearch visibleKeys={ctx.visibleKeys} />

      <Popover label={t("header.notifications")} trigger={({ toggle }) => <IconButton label={t("header.notifications")} onClick={toggle}><Bell className="size-[18px]" /></IconButton>}>
        {() => (
          <div className="w-72 p-4 text-center">
            <p className="t-section">{t("header.notificationsEmpty")}</p>
            <p className="t-support mt-1">{t("header.notificationsHint")}</p>
          </div>
        )}
      </Popover>

      <div className="hidden sm:block"><LanguageSwitcher /></div>

      <TenantSelector tenants={ctx.tenants} activeId={ctx.activeTenantId} activeName={active?.name} />

      <Popover label={t("header.account")} trigger={({ toggle, open }) => (
        <button type="button" onClick={toggle} aria-label={t("header.account")} aria-expanded={open} className="flex items-center gap-2 rounded-md p-1 hover:bg-navy/5">
          <span className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">{initials}</span>
        </button>
      )}>
        {({ close }) => (
          <div className="w-64">
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-sm font-semibold">{ctx.userName || ctx.userEmail}</p>
              <p className="t-support truncate">{ctx.userEmail}</p>
              {ctx.roleCode && <p className="t-support mt-1">{t(`role.${ctx.roleCode}` as never) === `role.${ctx.roleCode}` ? ctx.roleName : t(`role.${ctx.roleCode}` as never)}</p>}
            </div>
            <div className="py-1">
              <Link href="/settings" onClick={close} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-canvas"><SlidersHorizontal className="size-4 text-muted" />{t("header.preferences")}</Link>
              <div className="px-4 py-2 sm:hidden"><LanguageSwitcher variant="secondary" /></div>
              <form action="/auth/signout" method="post">
                <button type="submit" className="flex w-full items-center gap-2 px-4 py-2 text-start text-sm text-danger hover:bg-canvas"><LogOut className="size-4" />{t("header.signOut")}</button>
              </form>
            </div>
          </div>
        )}
      </Popover>
    </header>
  );
}

function TenantSelector({ tenants, activeId, activeName }: { tenants: { id: string; name: string }[]; activeId: string | null; activeName?: string }) {
  const { t } = useI18n();
  const { switchTo, pendingId, error } = useTenantSwitch();
  return (
    <Popover label={t("header.switchBrand")} trigger={({ toggle }) => (
      <button type="button" onClick={toggle} aria-label={t("header.switchBrand")} className="flex h-9 max-w-44 items-center gap-2 rounded-md border border-line-strong px-2.5 text-sm hover:bg-canvas">
        <Building2 className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="hidden truncate font-medium sm:inline">{activeName ?? t("header.brand")}</span>
        {tenants.length > 1 && <ChevronDown className="size-3.5 shrink-0 text-muted" aria-hidden />}
      </button>
    )}>
      {({ close }) => (
        <div className="w-64 py-1">
          <p className="t-th px-4 py-2">{t("header.brand")}</p>
          {tenants.map((x) => (
            <button key={x.id} type="button" disabled={pendingId !== null}
              onClick={async () => { if (x.id === activeId) return close(); if (await switchTo(x.id)) close(); }}
              className={cn("flex w-full items-center justify-between gap-2 px-4 py-2 text-start text-sm hover:bg-canvas disabled:opacity-60")}>
              <span className="truncate">{x.name}</span>
              {pendingId === x.id ? <span className="t-support">{t("header.switching")}</span> : x.id === activeId && <Check className="size-4 text-emerald" />}
            </button>
          ))}
          {error && <p role="alert" className="px-4 py-2 text-xs text-danger">{t("header.switchFailed")}</p>}
        </div>
      )}
    </Popover>
  );
}
