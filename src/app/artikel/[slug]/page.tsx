import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, Crown, Lock } from "lucide-react";
import { getArticle, listArticles } from "@/lib/articles";
import { ArticleBody } from "@/components/article-body";
import { HELP } from "@/lib/income";

const FILL: Record<string, string> = { self: "/potensi#minat", sources: "/income#penghasilan", expenses: "/income#pengeluaran", plans: "/rencana", dreams: "/rencana#mimpi", dana: "/goals/baru" };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  return a ? { title: a.title, description: a.excerpt ?? undefined } : { title: "Artikel" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [a, all] = await Promise.all([getArticle(slug), listArticles()]);
  if (!a) notFound();
  const helpKey = (Object.keys(HELP) as (keyof typeof HELP)[]).find((k) => HELP[k].slug === slug);
  const fill = helpKey ? FILL[helpKey] : null;
  const more = all.filter((x) => x.slug !== slug && (x.category === a.category || x.access === "free")).slice(0, 3);
  return (
    <article className="mx-auto max-w-2xl">
      <Link href="/artikel" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> Semua artikel
      </Link>
      <p className="mt-6 flex items-center gap-2 text-xs font-semibold">
        {a.category && <span className="text-brand">{a.category}</span>}
        <span className="text-muted">· {a.read_min} menit baca</span>
        {a.access === "plus" && (
          <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] text-brand">
            <Crown className="h-3 w-3" /> Plus
          </span>
        )}
      </p>
      <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-heading sm:text-4xl">{a.title}</h1>
      {a.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted">{a.excerpt}</p>}
      <div className="mt-8 border-t border-line pt-8">
        {a.locked || !a.body ? (
          <div className="relative overflow-hidden rounded-3xl bg-brand p-7 text-center text-white shadow-lift">
            <Lock className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-3 text-xl font-bold">Artikel khusus member Plus</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/75">
              Buka artikel ini dan semua artikel premium, kelas Plus, laporan lengkap Gaya Diri, serta harga khusus mentoring dan event.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href="/paket" className="btn-gold">
                <Crown className="h-4 w-4" /> Lihat paket Plus
              </Link>
              <Link href="/daftar" className="btn border border-white/30 text-white hover:bg-white/10">Daftar gratis dulu</Link>
            </div>
          </div>
        ) : (
          <ArticleBody text={a.body} />
        )}
      </div>
      {fill ? (
        <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl bg-brand p-6 text-white shadow-lift sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-bold">Sudah lebih jelas? Isi sekarang</p>
            <p className="mt-1 text-sm text-white/75">Langsung kembali ke bagian yang tadi membingungkan dan lihat hasilnya. Gratis.</p>
          </div>
          <Link href={fill} className="btn-gold">
            Isi sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="card mt-10 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-bold text-heading">Ubah bacaan jadi langkah nyata</p>
            <p className="mt-1 text-sm text-muted">Cek posisi Anda di peta SEF dan hitung target jualan harian, gratis.</p>
          </div>
          <Link href={`/daftar?next=${encodeURIComponent("/dashboard")}`} className="btn-primary">
            Mulai gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      {more.length > 0 && (
        <div className="mt-10">
          <p className="text-sm font-bold text-heading">Baca juga</p>
          <ul className="mt-3 divide-y divide-line">
            {more.map((m) => (
              <li key={m.id}>
                <Link href={`/artikel/${m.slug}`} className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-ink hover:text-brand">
                  {m.title} {m.access === "plus" && <Crown className="h-3.5 w-3.5 shrink-0 text-gold" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
