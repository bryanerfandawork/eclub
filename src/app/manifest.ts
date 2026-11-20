import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EClub · Personal Growth Companion",
    short_name: "EClub",
    description: "Find Your Path. Build Your Success.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#8b2220",
    lang: "id",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
