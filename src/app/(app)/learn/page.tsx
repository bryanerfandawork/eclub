import Link from "next/link";
import { BookOpen, Lock, Users } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { PageHeader, ProgressBar } from "@/components/ui";
import { getAccount } from "@/lib/plans";
import { SEF_PHASES, SEF_STEPS } from "@/lib/sef";
import { ACCESS_LABEL, getSefProgress, listCourses, type Course, type SefProgress } from "@/lib/lms";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Learning Center" };

function CourseGrid({ items, locked, prog }: { items: Course[]; locked: boolean; prog: SefProgress }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((c, i) => {
        const p = prog.courses[c.id];
        return (
          <Link
            key={c.id}
            href={`/learn/${c.slug}`}
            className={`card animate-rise overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift ${locked ? "opacity-60 grayscale" : ""}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CourseCover url={c.cover_url} title={c.title} />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                {c.level && <span className="rounded-full bg-paper px-2.5 py-1 text-muted">{c.level}</span>}
                <span className={`rounded-full px-2.5 py-1 ${c.access === "plus" ? "bg-gold-soft text-brand" : c.access === "purchase" ? "bg-brand text-white" : "bg-success/10 text-success"}`}>
                  {c.access === "purchase" ? rupiah(c.price) : ACCESS_LABEL[c.access]}
                </span>
              </div>
              <h3 className="mt-3 line-clamp-2 text-[17px] font-bold text-heading">{c.title}</h3>
              {c.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>}
              {p && p.done > 0 && (
                <div className="mt-3">
                  <ProgressBar value={Math.round((p.done / p.total) * 100)} />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function LearnPage() {
  const [courses, account] = await Promise.all([listCourses(), getAccount()]);
  const prog = await getSefProgress(courses);
  const staff = account.role === "admin" || account.role === "super_admin";
  return (
    <>
      <PageHeader eyebrow="EClub Academy" title="Belajar dan bertumbuh" desc="Belajar berjenjang mengikuti Sustainable Entrepreneur Framework: Survive, Sustain, Scale Up, Spread Up. Ikuti urutannya supaya tidak bingung." />
      {courses.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">Kelas pertama sedang disiapkan. Nantikan segera.</div>
      ) : (
        <div className="space-y-10">
          {SEF_PHASES.map((phase) => {
            const steps = SEF_STEPS.filter((st) => st.phase === phase.key && courses.some((c) => c.sef_step === st.key));
            if (!steps.length) return null;
            return (
              <section key={phase.key}>
                <p className="eyebrow">Fase {phase.name}</p>
                <p className="mt-1 text-sm text-muted">{phase.desc}</p>
                {steps.map((st) => {
                  const open = staff || prog.unlocked.has(st.key);
                  const pct = prog.stepPct[st.key];
                  return (
                    <div key={st.key} id={st.key} className="mt-5 scroll-mt-24">
                      <div className="mb-3 flex items-center gap-3">
                        <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${open ? "bg-brand text-white" : "bg-paper text-muted"}`}>{st.no}</span>
                        <h2 className="font-bold text-heading">{st.name}</h2>
                        {!open && (
                          <span className="flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">
                            <Lock className="h-3 w-3" /> Selesaikan langkah sebelumnya
                          </span>
                        )}
                        {open && pct != null && <span className="ml-auto text-xs font-semibold text-muted">{pct}% selesai</span>}
                      </div>
                      <CourseGrid items={courses.filter((c) => c.sef_step === st.key)} locked={!open} prog={prog} />
                    </div>
                  );
                })}
              </section>
            );
          })}
          {courses.some((c) => !c.sef_step) && (
            <section>
              <p className="eyebrow">Kelas umum</p>
              <div className="mt-4">
                <CourseGrid items={courses.filter((c) => !c.sef_step)} locked={false} prog={prog} />
              </div>
            </section>
          )}
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, title: "Mentoring 1-on-1", desc: "Bawa satu masalah usaha, pulang dengan langkah konkret.", href: "/mentoring" },
          { icon: BookOpen, title: "Event & webinar", desc: "Belajar live bersama mentor dan sesama pelaku usaha.", href: "/event" },
          { icon: Users, title: "Sertifikat SEF", desc: "Selesaikan satu langkah, dapatkan sertifikat resmi.", href: "/sertifikat" },
        ].map(({ icon: Icon, title, desc, href }) => (
          <Link key={title} href={href} className="card flex gap-4 p-5 transition hover:border-gold">
            <Icon className="h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="font-semibold text-heading">{title}</p>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
