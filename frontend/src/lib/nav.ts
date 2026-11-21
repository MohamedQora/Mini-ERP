import { BarChart3, Boxes, LayoutDashboard, Package, Plug, Settings, ShoppingCart, Truck, Users, Wallet, ClipboardList, type LucideIcon } from "lucide-react";
import type { DictKey } from "./i18n";

export type NavItem = {
  key: string;
  href: string;
  label: DictKey;
  icon: LucideIcon;
  /** Shown if the user holds ANY of these permission codes (UX only — RLS is the real gate). Empty = always. */
  anyOf: string[];
  /** Sub-pages. Add only for routes that exist. */
  children?: { href: string; label: DictKey; anyOf?: string[] }[];
};
export type NavGroup = { key: string; label: DictKey | null; items: NavItem[] };

/** Permission codes come from the seeded `permissions` table (migration 14). */
export const NAV: NavGroup[] = [
  { key: "main", label: null, items: [
    { key: "dashboard", href: "/", label: "nav.dashboard", icon: LayoutDashboard, anyOf: [] },
  ]},
  { key: "operations", label: "nav.group.operations", items: [
    { key: "products", href: "/products", label: "nav.products", icon: Package, anyOf: ["products.view"] },
    { key: "inventory", href: "/inventory", label: "nav.inventory", icon: Boxes, anyOf: ["inventory.view"] },
    { key: "orders", href: "/orders", label: "nav.orders", icon: ShoppingCart, anyOf: ["orders.view"] },
    { key: "customers", href: "/customers", label: "nav.customers", icon: Users, anyOf: ["customers.view"] },
    { key: "purchasing", href: "/purchasing", label: "nav.purchasing", icon: ClipboardList, anyOf: ["purchasing.view"] },
    { key: "shipping", href: "/shipping", label: "nav.shipping", icon: Truck, anyOf: ["shipping.view", "shipping.dispatch"] },
  ]},
  { key: "business", label: "nav.group.business", items: [
    { key: "finance", href: "/finance", label: "nav.finance", icon: Wallet, anyOf: ["finance.view"] },
    { key: "integrations", href: "/integrations", label: "nav.integrations", icon: Plug, anyOf: ["integrations.view"] },
    { key: "reports", href: "/reports", label: "nav.reports", icon: BarChart3, anyOf: ["finance.view", "orders.view"] },
  ]},
  { key: "system", label: "nav.group.system", items: [
    { key: "settings", href: "/settings", label: "nav.settings", icon: Settings, anyOf: [] },
  ]},
];

export function visibleNav(perms: Set<string>, isOwner: boolean): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => isOwner || i.anyOf.length === 0 || i.anyOf.some((p) => perms.has(p))),
  })).filter((g) => g.items.length > 0);
}

export const flatNav = () => NAV.flatMap((g) => g.items);
export const isActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
