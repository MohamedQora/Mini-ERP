"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useState } from "react";
import { NAV, isActive, type NavGroup } from "@/lib/nav";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand";

export function Sidebar({ visibleKeys, collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: {
  visibleKeys: string[]; collapsed: boolean; onToggleCollapsed: () => void; mobileOpen: boolean; onCloseMobile: () => void;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const groups: NavGroup[] = NAV.map((g) => ({ ...g, items: g.items.filter((i) => visibleKeys.includes(i.key)) })).filter((g) => g.items.length);
  // On mobile the drawer is always full width; "collapsed" only applies from md up.
  const narrow = collapsed;

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-navy/45 md:hidden" onClick={onCloseMobile} aria-hidden />}
      <aside
        aria-label="Main"
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex flex-col bg-navy text-white transition-[width,transform] duration-150 md:sticky md:top-0 md:h-dvh md:translate-x-0 md:rtl:translate-x-0",
          "w-64", narrow && "md:w-[68px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className={cn("flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4", narrow && "md:justify-center md:px-0")}>
          <BrandMark />
          <span className={cn("text-[15px] font-semibold tracking-tight", narrow && "md:hidden")}>{t("app.name")}</span>
          <button type="button" onClick={onCloseMobile} aria-label={t("nav.close")} className="ms-auto rounded p-1 text-white/70 hover:text-white md:hidden"><X className="size-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {groups.map((g, gi) => (
            <div key={g.key} className={cn(gi > 0 && "mt-4")}>
              {g.label && <p className={cn("mb-1 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/45", narrow && "md:hidden")}>{t(g.label)}</p>}
              {g.label && narrow && <div className="mx-2 mb-2 hidden border-t border-white/10 md:block" />}
              <ul className="space-y-0.5">
                {g.items.map((item) => <NavRow key={item.key} item={item} narrow={narrow} pathname={pathname} onNavigate={onCloseMobile} />)}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 border-t border-white/10 p-3 md:block">
          <button type="button" onClick={onToggleCollapsed} aria-label={collapsed ? t("nav.expand") : t("nav.collapse")} title={collapsed ? t("nav.expand") : t("nav.collapse")}
            className={cn("flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm text-white/70 hover:bg-white/8 hover:text-white", collapsed && "justify-center")}>
            {collapsed ? <ChevronsRight className="size-4 rtl:-scale-x-100" /> : <><ChevronsLeft className="size-4 rtl:-scale-x-100" /><span>{t("nav.collapse")}</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavRow({ item, narrow, pathname, onNavigate }: { item: (typeof NAV)[number]["items"][number]; narrow: boolean; pathname: string; onNavigate: () => void }) {
  const { t } = useI18n();
  const active = isActive(item.href, pathname);
  const hasKids = !!item.children?.length;
  const [open, setOpen] = useState(active);
  const Icon = item.icon;
  const row = cn("group flex h-9 items-center gap-3 rounded-md px-2.5 text-[13.5px] font-medium transition-colors", narrow && "md:justify-center md:px-0",
    active ? "bg-emerald text-white" : "text-white/75 hover:bg-white/8 hover:text-white");

  return (
    <li>
      <div className="flex items-center">
        <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={narrow ? t(item.label) : undefined} className={cn(row, "flex-1")}>
          <Icon className="size-[18px] shrink-0" aria-hidden />
          <span className={cn("truncate", narrow && "md:hidden")}>{t(item.label)}</span>
        </Link>
        {hasKids && !narrow && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t(item.label)} className="ms-1 rounded p-1.5 text-white/60 hover:text-white">
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>
      {hasKids && open && !narrow && (
        <ul className="ms-5 mt-0.5 space-y-0.5 border-s border-white/15 ps-2">
          {item.children!.map((c) => (
            <li key={c.href}>
              <Link href={c.href} onClick={onNavigate} className={cn("block rounded-md px-2.5 py-1.5 text-[13px]", isActive(c.href, pathname) ? "bg-white/10 text-white" : "text-white/65 hover:text-white")}>{t(c.label)}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
