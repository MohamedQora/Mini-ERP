"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { flatNav } from "@/lib/nav";
import { useI18n } from "@/lib/i18n/provider";

/** Module > page. Dynamic segments (ids) are shown as-is until a page supplies a nicer title. */
export function Breadcrumbs() {
  const { t } = useI18n();
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  const mod = flatNav().find((i) => i.href !== "/" && "/" + segs[0] === i.href);
  const crumbs: { href: string; label: string }[] = [];
  if (!mod) crumbs.push({ href: "/", label: t("nav.dashboard") });
  else {
    crumbs.push({ href: mod.href, label: t(mod.label) });
    segs.slice(1).forEach((s, i) => crumbs.push({ href: "/" + segs.slice(0, i + 2).join("/"), label: decodeURIComponent(s).replace(/-/g, " ") }));
  }
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-[13px] text-muted">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />}
            {i === crumbs.length - 1
              ? <span aria-current="page" className="truncate font-medium capitalize text-navy">{c.label}</span>
              : <Link href={c.href} className="truncate hover:text-navy">{c.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
