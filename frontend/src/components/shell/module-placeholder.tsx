import { Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n";

/**
 * Honest "not built yet" page for modules scheduled in a later phase. It lists the planned pages and any
 * known backend constraints so nothing is faked. Replaced by the real module screens in its phase.
 */
export async function ModulePlaceholder({ titleKey, phase, pages, backend }: { titleKey: DictKey; phase: string; pages: string[]; backend?: string[] }) {
  const { t } = await getT();
  return (
    <>
      <PageHeader title={t(titleKey)} description={t("module.planned", { phase })} />
      <Card>
        <EmptyState icon={<Construction className="size-5" />} title={t("module.notBuilt")} description={t("module.notBuiltHint")} />
        <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
          <div>
            <h2 className="t-section mb-2">{t("module.plannedPages")}</h2>
            <ul className="t-body list-disc space-y-1 ps-5 text-muted">{pages.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          {backend && backend.length > 0 && (
            <div>
              <h2 className="t-section mb-2">{t("module.backend")}</h2>
              <ul className="t-body list-disc space-y-1 ps-5 text-muted">{backend.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
