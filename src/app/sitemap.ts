import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const arts = await listArticles().catch(() => []);
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/artikel`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/daftar`, priority: 0.7 },
    { url: `${SITE}/kebijakan-privasi`, priority: 0.2 },
    { url: `${SITE}/syarat-ketentuan`, priority: 0.2 },
    ...arts.filter((a) => a.id !== "demo" && a.id !== "demo2").map((a) => ({ url: `${SITE}/artikel/${a.slug}`, lastModified: a.published_at, priority: 0.6 })),
  ];
}
