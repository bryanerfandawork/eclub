import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { listCourses } from "@/lib/lms";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [arts, courses] = await Promise.all([listArticles().catch(() => []), listCourses().catch(() => [])]);
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/artikel`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/daftar`, priority: 0.7 },
    { url: `${SITE}/kelas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/acara`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/mentoring-1on1`, priority: 0.6 },
    { url: `${SITE}/syarat-affiliate`, priority: 0.3 },
    { url: `${SITE}/kebijakan-privasi`, priority: 0.2 },
    { url: `${SITE}/syarat-ketentuan`, priority: 0.2 },
    { url: `${SITE}/kebijakan-pengembalian`, priority: 0.2 },
    { url: `${SITE}/kontak`, priority: 0.3 },
    ...courses.filter((c) => c.id !== "demo-c1").map((c) => ({ url: `${SITE}/kelas/${c.slug}`, priority: 0.7 })),
    ...arts.filter((a) => a.id !== "demo" && a.id !== "demo2").map((a) => ({ url: `${SITE}/artikel/${a.slug}`, lastModified: a.published_at, priority: 0.6 })),
  ];
}
