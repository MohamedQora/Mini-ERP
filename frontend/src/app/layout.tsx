import type { Metadata, Viewport } from "next";
import "./globals.css";
import { dir } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = { title: { default: "Mini ERP", template: "%s · Mini ERP" }, description: "ERP for clothing and fashion brands" };
export const viewport: Viewport = { themeColor: "#092134" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body>
        <I18nProvider locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
