import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ArticleMeta = { id: string; slug: string; title: string; excerpt: string | null; category: string | null; sef_step: string | null; access: "free" | "plus"; read_min: number; published_at: string; status?: string };
export type Article = ArticleMeta & { body: string | null; locked: boolean };

const DEMO: Article = {
  id: "demo",
  slug: "mimpi-jadi-target-harian",
  title: "Mengubah Mimpi Menjadi Target Jualan Harian",
  excerpt: "Mimpi besar terasa jauh karena belum dipecah. Begini cara mengubahnya menjadi angka yang bisa dikejar setiap hari.",
  category: "Spark",
  sef_step: "spark",
  access: "free",
  read_min: 4,
  published_at: new Date().toISOString(),
  body: "Hampir semua orang punya mimpi.\n\n## Langkah 1: beri harga dan tanggal\nTuliskan mimpi Anda sejelas mungkin.\n\n## Langkah 2: pecah per hari\n- Rp60 juta dibagi 1.825 hari\n- Sekitar Rp33 ribu per hari",
  locked: false,
};

export async function listArticles(): Promise<ArticleMeta[]> {
  if (isDemoMode) return [DEMO, { ...DEMO, id: "demo2", slug: "demo-plus", title: "Sistem Alokasi Laba untuk UMKM", access: "plus", category: "Keuangan" }];
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("id, slug, title, excerpt, category, sef_step, access, read_min, published_at").eq("status", "published").order("published_at", { ascending: false }).limit(100);
  return (data ?? []) as ArticleMeta[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (isDemoMode) return slug === DEMO.slug ? DEMO : slug === "demo-plus" ? { ...DEMO, slug, title: "Sistem Alokasi Laba untuk UMKM", access: "plus", body: null, locked: true } : null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_article", { p_slug: slug });
  return ((data as Article[] | null) ?? [])[0] ?? null;
}
