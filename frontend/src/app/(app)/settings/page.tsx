import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { getAppContext } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { t } = await getT();
  const ctx = await getAppContext();
  const roleLabel = ctx?.role ? (t(`role.${ctx.role.code}` as never) !== `role.${ctx.role.code}` ? t(`role.${ctx.role.code}` as never) : ctx.role.name) : "—";
  const row = (label: string, value: string) => (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line px-4 py-3 last:border-0">
      <dt className="t-support">{label}</dt><dd className="t-body font-medium">{value}</dd>
    </div>
  );
  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <div className="grid max-w-3xl gap-5">
        <Card>
          <CardHeader title={t("settings.account")} />
          <dl>
            {row(t("settings.name"), ctx?.profile?.full_name || "—")}
            {row(t("settings.email"), ctx?.user.email ?? "—")}
            {row(t("settings.role"), roleLabel)}
          </dl>
        </Card>
        <Card>
          <CardHeader title={t("settings.interface")} description={t("settings.languageHint")} />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="t-label">{t("common.language")}</span>
            <LanguageSwitcher variant="secondary" />
          </div>
        </Card>
      </div>
    </>
  );
}
