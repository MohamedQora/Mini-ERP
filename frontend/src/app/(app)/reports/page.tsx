import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { getLocale } from "@/lib/i18n/server";
import { PLANNED } from "@/features/modules/planned";

export const metadata = { title: "reports" };

export default async function Page() {
  const locale = await getLocale();
  const m = PLANNED.reports;
  return <ModulePlaceholder titleKey={m.titleKey} phase={m.phase[locale]} pages={m.pages[locale]} backend={m.backend?.[locale]} />;
}
