"use client";
import { Languages } from "lucide-react";
import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";

/** Toggles EN <-> AR. The label shows the language you will switch TO, in its own script. */
export function LanguageSwitcher({ variant = "ghost" }: { variant?: "ghost" | "secondary" }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();
  const next = locale === "en" ? "ar" : "en";
  return (
    <Button variant={variant} size="sm" loading={pending} aria-label={t("common.language")} onClick={() => start(() => setLocale(next))}>
      {!pending && <Languages className="size-4" aria-hidden />}
      {t(next === "ar" ? "lang.ar" : "lang.en")}
    </Button>
  );
}
