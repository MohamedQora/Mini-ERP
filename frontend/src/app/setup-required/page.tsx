import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getT } from "@/lib/i18n/server";

export default async function SetupRequired() {
  if (isSupabaseConfigured()) redirect("/");
  const { t } = await getT();
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <h1 className="t-page-title">{t("setup.title")}</h1>
      <p className="t-support mt-1">{t("setup.hint")}</p>
      <pre dir="ltr" className="mt-4 overflow-x-auto rounded-lg bg-navy p-4 text-xs text-white">{`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from "supabase status">
SUPABASE_SERVICE_ROLE_KEY=<service_role key, server only>`}</pre>
    </main>
  );
}
