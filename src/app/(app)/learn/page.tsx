import Link from "next/link";
import { Award, BookOpen, CalendarDays, Clock, GraduationCap, Lock, MapPin, Newspaper, Sparkles, Users } from "lucide-react";
import { Rail, railCard } from "@/components/rail";
import { listArticles } from "@/lib/articles";
import { getEvents, getMentoring } from "@/lib/schedule";
import { regencyName } from "@/lib/regions";
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

const tgl = (iso: string) => new Date(iso).toLocaleString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function LearnPage() {
  const [courses, account, articles, events, mentoring] = await Promise.all([listCourses(), getAccount(), listArticles().catch(() => []), getEvents(), getMentoring()]);
  const prog = await getSefProgress(courses);
  const staff = account.role === "admin" || account.role === "super_admin";
  const plus = account.plan === "plus";
  const stepOf = (key: string | null | undefined) => SEF_STEPS.find((st) => st.key === key);
  const order = (c: Course) => stepOf(c.sef_step)?.no ?? 99;
  const railCourses = [...courses].sort((a, b) => order(a) - order(b));
  const now = Date.now();
  const upcoming = (events ?? []).filter((e) => new Date(e.starts_at).getTime() + e.duration_min * 60_000 > now).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const slots = (mentoring?.slots ?? []).slice(0, 8);
  const chips = [
    { href: "#kelas", label: "Kelas", icon: GraduationCap, n: courses.length },
    { href: "#artikel", label: "Artikel", icon: Newspaper, n: articles.length },
    { href: "#event", label: "Event", icon: CalendarDays, n: upcoming.length },
    { href: "#mentoring", label: "Mentoring", icon: Users, n: slots.length },
  ];

  return (
    <>
      <PageHeader eyebrow="EClub Academy" title="Belajar dan bertumbuh" desc="Pilih cara belajar Anda: ikut kelas berjenjang SEF, baca artikel, ikut event, atau mentoring langsung." />

      <nav className="no-scrollbar -mx-5 mb-7 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        {chips.map(({ href, label, icon: Icon, n }) => (
          <a key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-heading shadow-soft hover:border-gold">
            <Icon className="h-4 w-4 text-gold" /> {label}
            {n > 0 && <span className="rounded-full bg-paper px-1.5 text-[11px] text-muted">{n}</span>}
          </a>
        ))}
      </nav>

      <div className="space-y-9">
        <Rail id="kelas" title="Kelas SEF" desc="Berjenjang: selesaikan satu langkah untuk membuka langkah berikutnya." href="#peta" hrefLabel="Peta kelas">
          {railCourses.length === 0 && <div className={`${railCard} card p-6 text-sm text-muted`}>Kelas pertama sedang disiapkan.</div>}
          {railCourses.map((c) => {
            const st = stepOf(c.sef_step);
            const open = staff || !c.sef_step || prog.unlocked.has(c.sef_step);
            const p = prog.courses[c.id];
            return (
              <Link key={c.id} href={`/learn/${c.slug}`} className={`${railCard} card overflow-hidden transition hover:shadow-lift ${open ? "" : "opacity-60 grayscale"}`}>
                <CourseCover url={c.cover_url} title={c.title} className="aspect-[2.4/1]" />
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                    {st && <span className="rounded-full bg-paper px-2 py-0.5 text-muted">Langkah {st.no} · {st.name}</span>}
                    {!open && (
                      <span className="flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-muted">
                        <Lock className="h-3 w-3" /> Terkunci
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 ${c.access === "plus" ? "bg-gold-soft text-brand" : c.access === "purchase" ? "bg-brand text-white" : "bg-success/10 text-success"}`}>{c.access === "purchase" ? rupiah(c.price) : ACCESS_LABEL[c.access]}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-bold text-heading">{c.title}</h3>
                  {p && p.done > 0 ? (
                    <div className="mt-3">
                      <ProgressBar value={Math.round((p.done / p.total) * 100)} />
                    </div>
                  ) : (
                    c.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </Rail>

        <Rail id="artikel" title="Artikel" desc="Bacaan singkat 3-7 menit untuk naik level." href="/artikel">
          {articles.length === 0 && <div className={`${railCard} card p-6 text-sm text-muted`}>Artikel segera hadir.</div>}
          {articles.slice(0, 10).map((a) => (
            <Link key={a.id} href={`/artikel/${a.slug}`} className={`${railCard} card flex flex-col p-5 transition hover:shadow-lift`}>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                {a.category && <span className="rounded-full bg-paper px-2 py-0.5 text-muted">{a.category}</span>}
                {a.access === "plus" ? <span className="rounded-full bg-gold-soft px-2 py-0.5 text-brand">{plus ? "Plus" : "Khusus Plus"}</span> : <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">Gratis</span>}
              </div>
              <h3 className="mt-3 line-clamp-2 font-bold text-heading">{a.title}</h3>
              {a.excerpt && <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{a.excerpt}</p>}
              <p className="mt-3 flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" /> {a.read_min} menit baca
              </p>
            </Link>
          ))}
        </Rail>

        <Rail id="event" title="Event & webinar" desc="Belajar live bersama mentor dan sesama pelaku usaha." href="/event">
          {upcoming.length === 0 && (
            <Link href="/event" className={`${railCard} card p-6 text-sm text-muted`}>
              Belum ada jadwal terdekat. Lihat rekaman event sebelumnya di halaman Event.
            </Link>
          )}
          {upcoming.map((e) => {
            const price = plus ? e.plus_price : e.price;
            return (
              <Link key={e.id} href="/event" className={`${railCard} card flex flex-col overflow-hidden transition hover:shadow-lift`}>
                <div className="bg-brand px-5 py-4 text-white">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <CalendarDays className="h-3.5 w-3.5" /> {tgl(e.starts_at)} WIB
                  </p>
                  <h3 className="mt-1.5 line-clamp-2 font-bold">{e.title}</h3>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5 text-sm">
                  {e.speaker && <p className="text-muted">Bersama {e.speaker}</p>}
                  <p className="flex items-center gap-1.5 text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {e.location || regencyName(e.regency) || "Online"}
                  </p>
                  <p className="mt-auto pt-2 font-bold text-heading">{e.registered ? "✓ Anda sudah terdaftar" : price ? rupiah(price) : "Gratis"}</p>
                </div>
              </Link>
            );
          })}
        </Rail>

        <Rail id="mentoring" title="Mentoring 1-on-1" desc="Bawa satu masalah usaha, pulang dengan langkah konkret." href="/mentoring">
          {slots.length === 0 && (
            <Link href="/mentoring" className={`${railCard} card p-6 text-sm text-muted`}>
              Jadwal mentoring baru segera dibuka. Cek halaman Mentoring.
            </Link>
          )}
          {slots.map((m) => (
            <Link key={m.id} href="/mentoring" className={`${railCard} card flex gap-4 p-5 transition hover:shadow-lift`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-soft text-brand">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-bold text-heading">{m.topic}</h3>
                <p className="text-sm text-muted">Bersama {m.mentor}</p>
                <p className="mt-1 text-xs text-muted">{tgl(m.starts_at)} WIB · {m.duration_min} menit</p>
                <p className="mt-2 text-sm font-bold text-heading">{(plus ? m.plus_price : m.price) ? rupiah(plus ? m.plus_price : m.price) : "Gratis"}</p>
              </div>
            </Link>
          ))}
        </Rail>

        <Link href="/sertifikat" className="card flex items-center gap-4 p-5 transition hover:border-gold">
          <Award className="h-6 w-6 shrink-0 text-gold" />
          <div>
            <p className="font-semibold text-heading">Sertifikat SEF</p>
            <p className="text-sm text-muted">Selesaikan semua kelas di satu langkah, dapatkan sertifikat resmi EClub.</p>
          </div>
        </Link>

        {courses.length > 0 && (
          <div id="peta" className="scroll-mt-24 space-y-10 border-t border-line pt-8">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
                <BookOpen className="h-5 w-5 text-gold" /> Peta kelas per langkah SEF
              </h2>
              <p className="text-sm text-muted">Survive, Sustain, Scale Up, Spread Up. Ikuti urutannya supaya tidak bingung.</p>
            </div>
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
                          <h3 className="font-bold text-heading">{st.name}</h3>
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
      </div>
    </>
  );
}
