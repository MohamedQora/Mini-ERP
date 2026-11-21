"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { BrandMark } from "@/components/shell/brand";
import { LanguageSwitcher } from "@/components/shell/language-switcher";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // blocks duplicate submissions
    const next: typeof errors = {};
    if (!email.trim()) next.email = t("auth.required");
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t("auth.invalidEmail");
    if (!password) next.password = t("auth.required");
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setErrors({ form: t("auth.invalid") }); setLoading(false); return; }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="absolute end-4 top-4"><LanguageSwitcher variant="secondary" /></div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark className="size-10 text-base" />
          <div><p className="text-lg font-semibold leading-tight">{t("app.name")}</p><p className="t-support">{t("app.tagline")}</p></div>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-lg border border-line bg-white p-6 shadow-card">
          <div>
            <h1 className="t-page-title">{t("auth.signInTitle")}</h1>
            <p className="t-support mt-1">{t("auth.signInHint")}</p>
          </div>
          {errors.form && <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{errors.form}</p>}
          <Field label={t("auth.email")} htmlFor="email" error={errors.email} required>
            <Input id="email" type="email" autoComplete="email" inputMode="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} />
          </Field>
          <Field label={t("auth.password")} htmlFor="password" error={errors.password} required>
            <Input id="password" type="password" autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} />
          </Field>
          <Button type="submit" className="w-full" loading={loading}>{loading ? t("auth.signingIn") : t("auth.signIn")}</Button>
        </form>
      </div>
    </main>
  );
}
