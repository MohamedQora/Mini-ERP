import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { BrandMark } from "@/components/shell/brand";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { TenantPicker } from "./tenant-picker";

export const metadata = { title: "Choose a brand" };

export default async function SelectTenantPage() {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  if (ctx.activeTenant) redirect("/");
  const { t } = await getT();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="absolute end-4 top-4"><LanguageSwitcher variant="secondary" /></div>
      <div className="w-full max-w-md">
        <BrandMark className="mb-4 size-10 text-base" />
        {ctx.tenants.length === 0 ? (
          <>
            <h1 className="t-page-title">{t("auth.noBrands")}</h1>
            <p className="t-support mt-1">{t("auth.noBrandsHint")}</p>
            <form action="/auth/signout" method="post" className="mt-5"><button className="text-sm font-medium text-emerald underline" type="submit">{t("header.signOut")}</button></form>
          </>
        ) : (
          <>
            <h1 className="t-page-title">{t("auth.selectBrand")}</h1>
            <p className="t-support mt-1 mb-5">{t("auth.selectBrandHint")}</p>
            <TenantPicker tenants={ctx.tenants.map((x) => ({ id: x.id, name: x.name }))} />
          </>
        )}
      </div>
    </main>
  );
}
