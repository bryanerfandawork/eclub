import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { PageHeader } from "@/components/ui";
import { ACCESS_LABEL, listCourses } from "@/lib/lms";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Learning Center" };

export default async function LearnPage() {
  const courses = await listCourses();
  return (
    <>
      <PageHeader eyebrow="EClub Academy" title="Belajar dan bertumbuh" desc="Kelas video terstruktur mengikuti tahapan EClub Success Framework." />
      {courses.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">Kelas pertama sedang disiapkan. Nantikan segera.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c, i) => (
            <Link key={c.id} href={`/learn/${c.slug}`} className="card animate-rise overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift" style={{ animationDelay: `${i * 50}ms` }}>
              <CourseCover url={c.cover_url} title={c.title} />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  {c.category && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">{c.category}</span>}
                  <span className={`rounded-full px-2.5 py-1 ${c.access === "plus" ? "bg-gold-soft text-brand" : c.access === "purchase" ? "bg-brand text-white" : "bg-success/10 text-success"}`}>
                    {c.access === "purchase" ? rupiah(c.price) : ACCESS_LABEL[c.access]}
                  </span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-[17px] font-bold text-heading">{c.title}</h2>
                {c.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>}
                {(c.level || c.instructor) && <p className="mt-3 text-xs text-muted">{[c.level, c.instructor].filter(Boolean).join(" · ")}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { icon: BookOpen, title: "Artikel EClub Insights", desc: "Bacaan singkat tentang pengembangan diri, karier, dan bisnis." },
          { icon: Users, title: "Mentoring", desc: "Sesi bersama mentor untuk membahas rencana dan tantangan Anda." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-dashed border-line p-5">
            <Icon className="h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="font-semibold text-heading">
                {title} <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">Segera</span>
              </p>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
