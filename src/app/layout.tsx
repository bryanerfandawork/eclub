import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "EClub · Personal Growth Companion", template: "%s · EClub" },
  description: "Find Your Path. Build Your Success. Teman bertumbuh untuk hidup dan usaha Anda.",
  applicationName: "EClub",
  appleWebApp: { capable: true, title: "EClub", statusBarStyle: "default" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1e3d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} antialiased`}>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
