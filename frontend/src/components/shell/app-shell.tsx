"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header, type ShellContext } from "./header";
import { Sidebar } from "./sidebar";

const KEY = "mini-erp.sidebar-collapsed";

export function AppShell({ ctx, children }: { ctx: ShellContext; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Per-viewer convenience only; the shell renders fine if storage is unavailable.
  useEffect(() => { try { setCollapsed(localStorage.getItem(KEY) === "1"); } catch { /* ignore */ } }, []);
  useEffect(() => setMobileOpen(false), [pathname]);
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem(KEY, c ? "0" : "1"); } catch { /* ignore */ } return !c; });

  return (
    <div className="flex min-h-dvh">
      <Sidebar visibleKeys={ctx.visibleKeys} collapsed={collapsed} onToggleCollapsed={toggle} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header ctx={ctx} onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
