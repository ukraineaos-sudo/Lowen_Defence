/**
 * layout.tsx — кореневий layout Next.js (шрифти, metadata, html lang з cookie)
 */
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { htmlLang } from "@/lib/i18n/locale";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Löwen Defence® Україна",
  description:
    "Практичні курси особистої безпеки та корпоративні тренінги від Löwen Defence® Україна",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={htmlLang(locale)} className={manrope.variable}>
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
