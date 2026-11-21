"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { useI18n } from "@/lib/i18n/provider";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Global search (Ctrl/⌘ + K). In this phase it searches the app's pages. Record search (orders, SKUs,
 * customers) is added with each module in Phase 3 once those screens and queries exist.
 */
export function CommandSearch({ visibleKeys }: { visibleKeys: string[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // <dialog>.showModal() focuses the first control (the close button); move focus to the search box instead.
  useEffect(() => { if (open) { const id = setTimeout(() => inputRef.current?.focus(), 30); return () => clearTimeout(id); } }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    const all = NAV.flatMap((g) => g.items).filter((i) => visibleKeys.includes(i.key)).map((i) => ({ href: i.href, label: t(i.label), icon: i.icon }));
    const s = q.trim().toLowerCase();
    return s ? all.filter((i) => i.label.toLowerCase().includes(s)) : all;
  }, [q, visibleKeys, t]);

  function go(href: string) { setOpen(false); setQ(""); router.push(href); }
  const close = () => { setOpen(false); setQ(""); setCursor(0); };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t("common.search")}
        className="flex h-9 min-w-0 items-center gap-2 rounded-md border border-line-strong bg-white px-3 text-sm text-muted hover:border-gray md:w-64">
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden truncate md:inline">{t("header.search")}</span>
        <kbd className="ms-auto hidden rounded border border-line px-1.5 text-[10px] text-muted lg:inline">Ctrl K</kbd>
      </button>
      <Dialog open={open} onClose={close} title={t("common.search")} description={t("header.searchHint")} size="md">
        <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setCursor(0); }} placeholder={t("header.search")} aria-label={t("header.search")}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
            if (e.key === "Enter" && items[cursor]) go(items[cursor].href);
          }}
          className="mb-3 h-10 w-full rounded-md border border-line-strong px-3 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/25" />
        {items.length === 0 ? <p className="t-support py-6 text-center">{t("header.searchEmpty")}</p> : (
          <ul role="listbox" className="-mx-1">
            {items.map((i, idx) => (
              <li key={i.href} role="option" aria-selected={idx === cursor}>
                <button type="button" onClick={() => go(i.href)} onMouseEnter={() => setCursor(idx)}
                  className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-start text-sm", idx === cursor ? "bg-emerald-soft" : "")}>
                  <i.icon className="size-4 text-muted" aria-hidden />{i.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </>
  );
}
