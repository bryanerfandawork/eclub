import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import { BrandProvider } from "@/components/brand";
import { getSettings } from "@/lib/plans";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const BASE_META: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id"),
  title: { default: "EClub · Personal Growth Companion", template: "%s · EClub" },
  description: "Find Your Path. Build Your Success. Teman bertumbuh untuk hidup dan usaha Anda.",
  applicationName: "EClub",
  appleWebApp: { capable: true, title: "EClub", statusBarStyle: "default" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const icon = String((await getSettings()).icon_url ?? "");
  return icon ? { ...BASE_META, icons: { icon, apple: icon } } : BASE_META;
}

export const viewport: Viewport = {
  themeColor: "#8b2220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const st = await getSettings();
  const brand = { logo: String(st.logo_url ?? ""), logoDark: String(st.logo_dark_url ?? ""), icon: String(st.icon_url ?? "") };
  return (
    <html lang="id">
      <body className={`${jakarta.variable} antialiased`}>
        <BrandProvider value={brand}>{children}</BrandProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
