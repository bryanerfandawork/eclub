import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/plans";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const icon = String((await getSettings()).icon_url ?? "");
  const type = icon.endsWith(".webp") ? "image/webp" : icon.endsWith(".jpg") ? "image/jpeg" : "image/png";
  return {
    name: "EClub · Personal Growth Companion",
    short_name: "EClub",
    description: "Find Your Path. Build Your Success.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#8b2220",
    lang: "id",
    icons: icon
      ? [
          { src: icon, sizes: "512x512", type, purpose: "any" },
          { src: icon, sizes: "192x192", type, purpose: "any" },
        ]
      : [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
  };
}
