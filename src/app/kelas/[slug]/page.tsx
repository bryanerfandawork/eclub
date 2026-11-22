import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, Clock, Lock, PlayCircle } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { JoinCta } from "@/components/join-cta";
import { ACCESS_LABEL, getCourseBySlug } from "@/lib/lms";
import { SEF_STEPS } from "@/lib/sef";
import { getSettings } from "@/lib/plans";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getCourseBySlug((await params).slug);
  return data ? { title: data.course.title, description: data.course.summary ?? undefined, openGraph: { title: data.course.title, description: data.course.summary ?? undefined, images: data.course.cover_url ? [data.course.cover_url] : undefined } } : { title: "Kelas" };
}

export default async function PublicCourse({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data || data.course.status !== "published") notFound();
  const { course: c, lessons } = data;
  const s = await getSettings();
  const st = SEF_STEPS.find((x) => x.key === c.sef_step);
  const totalMin = lessons.reduce((n, l) => n + (l.duration_min ?? 0), 0);
  const next = `/learn/${c.slug}`;
  const how =
    c.access === "purchase"
      ? `Kelas berbayar ${rupiah(c.price)} sekali beli${c.include_in_plus ? ", sudah termasuk untuk member Plus" : ""}.`
      : c.access === "plus"
        ? `Termasuk dalam EClub Plus (mulai ${rupiah(Number(s.plus_price_monthly) || 79000)}/bulan). Ada materi cuplikan yang bisa dicoba gratis.`
        : "Gratis untuk semua member. Cukup daftar akun gratis.";

  return (
    <>
      <Link href="/kelas" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> Semua kelas
      </Link>
      <div className="grid gap-6 pb-20 lg:grid-cols-5 lg:pb-0">
        <div className="space-y-5 lg:col-span-3">
          <div className="card overflow-hidden">
            <CourseCover url={c.cover_url} title={c.title} />
            <div className="p-6">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                {st && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">Langkah {st.no} · {st.name}</span>}
                {c.level && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">{c.level}</span>}
                <span className={`rounded-full px-2.5 py-1 ${c.access === "plus" ? "bg-gold-soft text-brand" : c.access === "purchase" ? "bg-brand text-white" : "bg-success/10 text-success"}`}>{c.access === "purchase" ? rupiah(c.price) : ACCESS_LABEL[c.access]}</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-heading lg:text-3xl">{c.title}</h1>
              {c.instructor && <p className="mt-1 text-sm text-muted">Bersama {c.instructor}</p>}
              {c.description ? <p className="mt-4 leading-relaxed whitespace-pre-line text-ink">{c.description}</p> : c.summary && <p className="mt-4 leading-relaxed text-ink">{c.summary}</p>}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-heading">Isi kelas</h2>
              <p className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" /> {lessons.length} materi{totalMin ? ` · ${totalMin} menit` : ""}
              </p>
            </div>
            <ol className="mt-3 divide-y divide-line">
              {lessons.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-xs font-bold text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-heading">{l.title}</span>
                    {l.summary && <span className="line-clamp-1 text-xs text-muted">{l.summary}</span>}
                  </span>
                  {l.access === "preview" || l.access === "public" ? <PlayCircle className="h-4 w-4 shrink-0 text-success" /> : <Lock className="h-4 w-4 shrink-0 text-muted" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <p className="text-xs font-semibold text-gold uppercase">Cara ikut</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{how}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {["Belajar kapan saja dari HP", "Materi berjenjang sesuai peta SEF", "Sertifikat setelah menyelesaikan satu langkah"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <JoinCta next={next} title="Mulai kelas ini" desc="Daftar gratis 1 menit. Setelah itu Anda langsung kembali ke kelas ini." />
        </div>
      </div>
      <JoinCta next={next} title={c.title} sticky />
    </>
  );
}
