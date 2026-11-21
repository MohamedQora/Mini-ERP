import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sets the caller's active brand.
 * RLS resolves the tenant from the JWT claim app_metadata.tenant_id, which users cannot edit themselves,
 * so this must happen server-side. We:
 *   1. authenticate the caller from their session cookie,
 *   2. verify an ACTIVE membership for (caller, tenant) — the service key is used only for this lookup
 *      and the metadata write, always scoped to the verified user id,
 *   3. write app_metadata.tenant_id. The browser then refreshes its session to receive the new claim.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { tenantId?: string } | null;
  const tenantId = body?.tenantId;
  if (!tenantId || !UUID.test(tenantId)) return NextResponse.json({ error: "invalid tenant" }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch { return NextResponse.json({ error: "server is missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 }); }

  const { data: membership, error: mErr } = await admin
    .from("tenant_memberships").select("id").eq("user_id", user.id).eq("tenant_id", tenantId).eq("status", "active").maybeSingle();
  if (mErr) return NextResponse.json({ error: "membership lookup failed" }, { status: 500 });
  if (!membership) return NextResponse.json({ error: "not a member of this brand" }, { status: 403 });

  const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, tenant_id: tenantId } });
  if (error) return NextResponse.json({ error: "could not set active brand" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
