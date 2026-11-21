import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getAppContext } from "@/lib/session";
import { visibleNav } from "@/lib/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  // No active brand in the session claim yet (first sign-in, or brand removed): pick one.
  if (!ctx.activeTenant) redirect("/select-tenant");

  const keys = visibleNav(ctx.permissions, ctx.isOwner).flatMap((g) => g.items.map((i) => i.key));
  return (
    <AppShell
      ctx={{
        userName: ctx.profile?.full_name ?? "",
        userEmail: ctx.user.email,
        roleCode: ctx.role?.code ?? null,
        roleName: ctx.role?.name ?? null,
        tenants: ctx.tenants.map((t) => ({ id: t.id, name: t.name })),
        activeTenantId: ctx.activeTenant.id,
        visibleKeys: keys,
      }}
    >
      {children}
    </AppShell>
  );
}
