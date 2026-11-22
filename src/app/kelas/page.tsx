import Link from "next/link";
import { CourseCover } from "@/components/course-cover";
import { JoinCta } from "@/components/join-cta";
import { ACCESS_LABEL, listCourses } from "@/lib/lms";
import { SEF_STEPS } from "@/lib/sef";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelas EClub", description: "Kelas berjenjang Sustainable Entrepreneur Framework: dari Personal Mapping sampai Investation." };

export default async function PublicCourses() {
  const courses = await listCourses();
  const order = (k?: string | null) => SEF_STEPS.find((s) => s.key === k)?.no ?? 99;
  const list = [...courses].sort((a, b) => order(a.sef_step) - order(b.sef_step));
  return (
    <>
      <p className="eyebrow">EClub Academy</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading lg:text-4xl">Kelas berjenjang untuk entrepreneur</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">Belajar step by step mengikuti Sustainable Entrepreneur Framework: Survive, Sustain, Scale Up, Spread Up. Lihat dulu isinya, daftar gratis saat siap mulai.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const st = SEF_STEPS.find((s) => s.key === c.sef_step);
          return (
            <Link key={c.id} href={`/kelas/${c.slug}`} className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
              <CourseCover url={c.cover_url} title={c.title} />
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  {st && <span className="rounded-full bg-paper px-2 py-0.5 text-muted">Langkah {st.no} · {st.name}</span>}
                  <span className={`rounded-full px-2 py-0.5 ${c.access === "plus" ? "bg-gold-soft text-brand" : c.access === "purchase" ? "bg-brand text-white" : "bg-success/10 text-success"}`}>{c.access === "purchase" ? rupiah(c.price) : ACCESS_LABEL[c.access]}</span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-[17px] font-bold text-heading">{c.title}</h2>
                {c.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-10">
        <JoinCta next="/learn" title="Siap mulai belajar?" desc="Daftar gratis dalam 1 menit, lalu ikuti kelas sesuai posisi Anda di peta SEF." />
      </div>
    </>
  );
}
