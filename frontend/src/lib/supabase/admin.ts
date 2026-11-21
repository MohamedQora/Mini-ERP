import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/**
 * Service-role client. SERVER ONLY (guarded by `server-only`). Never import from a client component.
 * Use only inside route handlers / server actions AFTER verifying the caller's identity and permission.
 * It bypasses RLS, so every call site must justify why and scope by the verified user/tenant.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
