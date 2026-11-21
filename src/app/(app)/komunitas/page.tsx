import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { CIRCLES, listPosts, me } from "@/lib/community";
import { getAccount, isAdmin } from "@/lib/plans";
import { Composer } from "./client";
import { PostCard } from "./post-card";

export const metadata = { title: "Komunitas" };

export default async function KomunitasPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c = "umum" } = await searchParams;
  const circle = CIRCLES.some((x) => x.key === c) ? c : "umum";
  const [posts, uid, acc] = await Promise.all([listPosts(circle), me(), getAccount()]);
  const staff = isAdmin(acc.role);
  const info = CIRCLES.find((x) => x.key === circle)!;
  return (
    <>
      <PageHeader eyebrow="Komunitas EClub" title="Tumbuh bareng, bukan sendirian" desc="Berbagi kemenangan, bertanya, dan saling menyemangati sesama pelaku usaha di fase yang sama." />
      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
        {CIRCLES.map((x) => (
          <Link key={x.key} href={x.key === "umum" ? "/komunitas" : `/komunitas?c=${x.key}`} scroll={false} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${circle === x.key ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-paper"}`}>
            {x.emoji} {x.label}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          {posts === null ? (
            <div className="card p-6 text-sm text-muted">Komunitas sedang disiapkan.</div>
          ) : (
            <>
              <Composer circle={circle} circles={CIRCLES.map((x) => ({ key: x.key, label: x.label }))} />
              {posts.length === 0 ? (
                <div className="card p-8 text-center text-sm text-muted">Belum ada postingan di circle ini. Jadilah yang pertama menyapa! 👋</div>
              ) : (
                posts.map((p) => <PostCard key={p.id} p={p} uid={uid} staff={staff} />)
              )}
            </>
          )}
        </div>
        <aside className="hidden space-y-4 lg:block">
          <section className="rounded-2xl bg-brand p-5 text-white shadow-lift">
            <p className="text-2xl">{info.emoji}</p>
            <p className="mt-2 font-bold">{circle === "umum" ? "Ruang umum" : `Circle ${info.label}`}</p>
            <p className="mt-1 text-sm text-white/75">{info.desc}</p>
          </section>
          <section className="card p-5 text-sm">
            <p className="font-bold text-heading">Etika komunitas</p>
            <ul className="mt-2 space-y-1.5 text-muted">
              <li>🤝 Saling menghargai dan membangun</li>
              <li>🚫 Tanpa spam, promosi berlebihan, atau SARA</li>
              <li>🔒 Jangan bagikan data pribadi atau rekening</li>
              <li>🔥 Beri “Semangat” untuk kemenangan teman</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
