import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, Clock, Lock, PlayCircle } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { ProgressBar } from "@/components/ui";
import { ACCESS_LABEL, getCourseBySlug, sefLockedStep } from "@/lib/lms";
import { getAccount } from "@/lib/plans";
import { rupiah } from "@/lib/format";
import { ShareEarn } from "@/components/share-earn";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data) notFound();
  const { course: c, lessons, done } = data;
  const account = await getAccount();
  const sefBlock = await sefLockedStep(c, account.role === "admin" || account.role === "super_admin");
  const watchable = sefBlock ? new Set<string>() : data.watchable;
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;
  const locked = !sefBlock && lessons.some((l) => !watchable.has(l.id));
  const firstOpen = lessons.find((l) => watchable.has(l.id) && !done.has(l.id)) ?? lessons.find((l) => watchable.has(l.id));
  const totalMin = lessons.reduce((s, l) => s + (l.duration_min ?? 0), 0);

  return (
    <>
      <Link href="/learn" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> Learning Center
      </Link>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="card overflow-hidden">
            <CourseCover url={c.cover_url} title={c.title} />
            <div className="p-6">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                {c.category && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">{c.category}</span>}
                {c.level && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">{c.level}</span>}
                {c.status === "draft" && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-danger">Draf</span>}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-heading lg:text-3xl">{c.title}</h1>
              {c.instructor && <p className="mt-1 text-sm text-muted">Bersama {c.instructor}</p>}
              {c.description && <p className="mt-4 leading-relaxed whitespace-pre-line text-ink">{c.description}</p>}
            </div>
          </div>
        </div>
        <aside className="space-y-5 lg:col-span-2">
          <ShareEarn path={`/kelas/${c.slug}`} text={`Kelas ini bagus banget: *${c.title}*. Lihat dulu isinya di EClub:`} what="kelas ini" />
          <section className="card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-heading">{lessons.length} lesson</span>
              {totalMin > 0 && (
                <span className="flex items-center gap-1 text-muted">
                  <Clock className="h-3.5 w-3.5" /> {totalMin} menit
                </span>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} tone="brand" />
              <p className="mt-1.5 text-xs text-muted">{pct}% selesai</p>
            </div>
            {firstOpen && (
              <Link href={`/learn/${c.slug}/${firstOpen.id}`} className="btn-primary mt-4 w-full">
                <PlayCircle className="h-4 w-4" /> {done.size ? "Lanjutkan belajar" : "Mulai belajar"}
              </Link>
            )}
            {sefBlock && (
              <div className="mt-4 rounded-xl bg-paper p-4 text-sm text-heading">
                <p className="font-semibold">
                  <Lock className="mr-1 inline h-3.5 w-3.5" /> Kelas ini ada di jenjang berikutnya
                </p>
                <p className="mt-1 text-muted">Selesaikan dulu semua kelas di langkah {sefBlock}. Belajar berurutan membuat hasilnya lebih terasa.</p>
                <Link href="/learn" className="btn-ghost mt-3 w-full">Lihat urutan belajar</Link>
              </div>
            )}
            {locked && (
              <div className="mt-4 rounded-xl bg-gold-soft p-4 text-sm text-heading">
                <p className="font-semibold">
                  <Lock className="mr-1 inline h-3.5 w-3.5" /> Akses penuh: {c.access === "purchase" ? `${rupiah(c.price)}${c.include_in_plus ? " atau gratis untuk member Plus" : ""}` : ACCESS_LABEL[c.access]}
                </p>
                <Link href={c.access === "purchase" ? `/beli/course/${c.slug}` : "/paket"} className="btn-gold mt-3 w-full">
                  {c.access === "purchase" ? "Beli course ini" : "Upgrade ke Plus"}
                </Link>
              </div>
            )}
          </section>
          <section className="card p-2">
            <ol>
              {lessons.map((l, i) => {
                const open = watchable.has(l.id);
                const isDone = done.has(l.id);
                const inner = (
                  <>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-xs font-bold text-muted">
                      {isDone ? <CheckCircle2 className="h-4 w-4 text-success" /> : open ? i + 1 : <Lock className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-medium ${open ? "text-heading" : "text-muted"}`}>{l.title}</span>
                      <span className="block text-xs text-muted">
                        {l.duration_min ? `${l.duration_min} menit` : ""}
                        {l.access === "preview" && <span className="ml-1 font-semibold text-success">· Cuplikan gratis</span>}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link href={`/learn/${c.slug}/${l.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-paper">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 p-3">{inner}</div>
                    )}
                  </li>
                );
              })}
              {lessons.length === 0 && <li className="p-4 text-sm text-muted">Lesson sedang disiapkan.</li>}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
