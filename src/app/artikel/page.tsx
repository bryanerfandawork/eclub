import Link from "next/link";
import { Crown } from "lucide-react";
import { listArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Artikel", description: "Artikel EClub tentang spark, keuangan usaha, penjualan, sistem, dan investasi." };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const all = await listArticles();
  const cats = [...new Set(all.map((a) => a.category).filter(Boolean))] as string[];
  const items = k ? all.filter((a) => a.category === k) : all;
  return (
    <>
      <p className="eyebrow">Artikel EClub</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Bacaan untuk bertumbuh</h1>
      <p className="mt-3 max-w-2xl text-muted">Spark, keuangan usaha, penjualan, sistem, dan investasi. Sebagian gratis, sebagian khusus member Plus.</p>
      {cats.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/artikel" className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!k ? "bg-brand text-white" : "bg-white text-heading"}`}>Semua</Link>
          {cats.map((c) => (
            <Link key={c} href={`/artikel?k=${encodeURIComponent(c)}`} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${k === c ? "bg-brand text-white" : "bg-white text-heading"}`}>
              {c}
            </Link>
          ))}
        </div>
      )}
      {items.length === 0 ? (
        <p className="card mt-8 p-8 text-center text-sm text-muted">Artikel segera hadir.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Link key={a.id} href={`/artikel/${a.slug}`} className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {a.category && <span className="text-brand">{a.category}</span>}
                <span className="text-muted">· {a.read_min} menit</span>
                {a.access === "plus" && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] text-brand">
                    <Crown className="h-3 w-3" /> Plus
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg leading-snug font-bold text-heading">{a.title}</h2>
              {a.excerpt && <p className="mt-2 text-sm leading-relaxed text-muted">{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
