import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type TenantLite = { id: string; name: string; slug: string; status: string; default_currency: string; timezone: string };
export type AppContext = {
  user: { id: string; email: string };
  profile: { full_name: string | null; avatar_url: string | null } | null;
  tenants: TenantLite[];
  activeTenant: TenantLite | null;
  role: { code: string; name: string } | null;
  permissions: Set<string>;
  isOwner: boolean;
};

/**
 * Resolves who the user is and which brand they are working in.
 * The active tenant is read from the JWT `app_metadata.tenant_id` claim — the same claim RLS uses via
 * public.current_tenant_id() — so the UI can never disagree with what the database will return.
 * Everything here is read through the user's own session (RLS applies).
 */
export const getAppContext = cache(async (): Promise<AppContext | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: claimsData } = await supabase.auth.getClaims();
  const claimTenant = (claimsData?.claims as { app_metadata?: { tenant_id?: string } } | undefined)?.app_metadata?.tenant_id ?? null;

  const [{ data: tenants }, { data: profile }] = await Promise.all([
    supabase.from("tenants").select("id,name,slug,status,base_currency_code,default_timezone").order("name"),
    supabase.from("user_profiles").select("display_name,avatar_url").eq("user_id", user.id).maybeSingle(),
  ]);
  const list: TenantLite[] = (tenants ?? []).map((tenant) => {
    const row = tenant as { id: string; name: string; slug: string; status: string; base_currency_code: string; default_timezone: string };
    return { id: row.id, name: row.name, slug: row.slug, status: row.status, default_currency: row.base_currency_code, timezone: row.default_timezone };
  });
  const activeTenant = list.find((t) => t.id === claimTenant) ?? null;

  let role: AppContext["role"] = null;
  const permissions = new Set<string>();
  if (activeTenant) {
    const { data: m } = await supabase
      .from("tenant_memberships")
      .select("role_id, roles(code,name)")
      .eq("tenant_id", activeTenant.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    const r = (m as unknown as { role_id: string; roles: { code: string; name: string } | null } | null);
    if (r?.roles) role = r.roles;
    if (r?.role_id) {
      const { data: rp } = await supabase.from("role_permissions").select("permissions(code)").eq("role_id", r.role_id);
      (rp as unknown as { permissions: { code: string } | null }[] | null)?.forEach((x) => x.permissions && permissions.add(x.permissions.code));
    }
  }

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: profile ? { full_name: profile.display_name, avatar_url: profile.avatar_url } : null,
    tenants: list,
    activeTenant,
    role,
    permissions,
    isOwner: role?.code === "owner",
  };
});
