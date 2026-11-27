import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isLate, onTask, type TeamTask } from "@/lib/team";

type Mode = "minggu" | "bulan" | "tahun";
const DAY = 86_400_000;
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const toD = (s: string) => new Date(s + "T00:00:00Z");
const toS = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => toS(new Date(toD(s).getTime() + n * DAY));
const monday = (s: string) => addDays(s, -((toD(s).getUTCDay() + 6) % 7));
const monthStart = (s: string) => s.slice(0, 8) + "01";
const addMonths = (s: string, n: number) => {
  const d = toD(monthStart(s));
  d.setUTCMonth(d.getUTCMonth() + n);
  return toS(d);
};
const daysIn = (s: string) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7), 0)).getUTCDate();

/** Warna hari: makin banyak tugas berjalan, makin pekat. */
const heat = (n: number) => (n === 0 ? "bg-white" : n <= 2 ? "bg-gold-soft" : n <= 4 ? "bg-gold/40" : "bg-brand/25");

/**
 * Kalender tim: lihat hari mana yang padat. Tugas dihitung "berjalan" dari tanggal mulai sampai deadline-nya.
 * Tampilan minggu / bulan / tahun, bisa disaring "Tugas saya".
 */
export function TeamCalendar({
  ws,
  tasks,
  today,
  me,
  mode: rawMode,
  at,
  mineOnly,
  nameOf,
}: {
  ws: string;
  tasks: TeamTask[];
  today: string;
  me: string;
  mode?: string;
  at?: string;
  mineOnly: boolean;
  nameOf: (t: TeamTask) => string;
}) {
  const mode: Mode = rawMode === "minggu" || rawMode === "tahun" ? rawMode : "bulan";
  const anchor = at && /^\d{4}-\d{2}-\d{2}$/.test(at) ? at : today;
  const list = tasks.filter((t) => t.status !== "closed" && (!mineOnly || onTask(t, me)));
  const end = (t: TeamTask) => (t.due_date && t.due_date > t.plan_date ? t.due_date : t.plan_date);
  const running = (day: string) => list.filter((t) => t.plan_date <= day && end(t) >= day && (t.status === "open" || (t.done_at ?? "").slice(0, 10) >= day));
  const dueOn = (day: string) => list.filter((t) => (t.due_date ?? t.plan_date) === day);
  const href = (m: Mode, d: string) => `/tim/${ws}?tab=tugas&v=kalender&cal=${m}&d=${d}${mineOnly ? "&lihat=saya" : ""}`;

  const step = mode === "minggu" ? addDays(anchor, 7) : mode === "bulan" ? addMonths(anchor, 1) : `${+anchor.slice(0, 4) + 1}-01-01`;
  const back = mode === "minggu" ? addDays(anchor, -7) : mode === "bulan" ? addMonths(anchor, -1) : `${+anchor.slice(0, 4) - 1}-01-01`;
  const title =
    mode === "tahun"
      ? anchor.slice(0, 4)
      : mode === "bulan"
        ? `${BULAN[+anchor.slice(5, 7) - 1]} ${anchor.slice(0, 4)}`
        : (() => {
            const a = monday(anchor);
            const b = addDays(a, 6);
            return `${+a.slice(8)} ${BULAN[+a.slice(5, 7) - 1].slice(0, 3)} – ${+b.slice(8)} ${BULAN[+b.slice(5, 7) - 1].slice(0, 3)} ${b.slice(0, 4)}`;
          })();

  return (
    <section className="card p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Link href={href(mode, back)} className="rounded-lg border border-line p-1.5 text-muted hover:text-heading" aria-label="Sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={href(mode, step)} className="rounded-lg border border-line p-1.5 text-muted hover:text-heading" aria-label="Berikutnya">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <h2 className="mr-auto text-lg font-bold text-heading">{title}</h2>
        <Link href={href(mode, today)} className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-heading">
          Hari ini
        </Link>
        <div className="inline-flex rounded-lg bg-paper p-0.5 text-xs">
          {(["minggu", "bulan", "tahun"] as const).map((m) => (
            <Link key={m} href={href(m, anchor)} className={`rounded-md px-2.5 py-1 font-semibold capitalize ${mode === m ? "bg-heading text-white" : "text-muted"}`}>
              {m}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <Link href={`/tim/${ws}?tab=tugas&v=kalender&cal=${mode}&d=${anchor}`} className={`rounded-full px-2.5 py-1 font-semibold ${!mineOnly ? "bg-heading text-white" : "border border-line text-muted"}`}>
          Semua
        </Link>
        <Link href={`/tim/${ws}?tab=tugas&v=kalender&cal=${mode}&d=${anchor}&lihat=saya`} className={`rounded-full px-2.5 py-1 font-semibold ${mineOnly ? "bg-heading text-white" : "border border-line text-muted"}`}>
          Tugas saya
        </Link>
        <span className="ml-auto flex items-center gap-1 text-muted">
          Sepi
          {[0, 1, 3, 5].map((n) => (
            <span key={n} className={`h-3 w-3 rounded-sm border border-line ${heat(n)}`} />
          ))}
          Padat
        </span>
      </div>

      {mode === "minggu" && (
        <ul className="mt-4 space-y-2">
          {Array.from({ length: 7 }, (_, i) => addDays(monday(anchor), i)).map((day, i) => {
            const run = running(day);
            const due = new Set(dueOn(day).map((t) => t.id));
            return (
              <li key={day} className={`rounded-xl border p-3 ${day === today ? "border-brand" : "border-line"} ${heat(run.length)}`}>
                <p className="flex items-center justify-between text-sm font-bold text-heading">
                  <span>
                    {HARI[i]}, {+day.slice(8)} {BULAN[+day.slice(5, 7) - 1].slice(0, 3)} {day === today && <span className="text-brand">· hari ini</span>}
                  </span>
                  <span className="text-xs font-semibold text-muted">{run.length} tugas</span>
                </p>
                {run.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {run.map((t) => (
                      <li key={t.id}>
                        <Link href={`/tim/${ws}/tugas/${t.id}`} className={`flex items-center gap-1.5 text-sm ${t.status === "done" ? "text-muted line-through" : isLate(t, today) ? "text-danger" : "text-ink"}`}>
                          {due.has(t.id) ? "⏰" : "·"} <span className="truncate">{t.title}</span>
                          <span className="ml-auto shrink-0 text-[11px] text-muted no-underline">{nameOf(t)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          <li className="text-xs text-muted">⏰ = deadline hari itu. Tugas dihitung dari tanggal mulai sampai deadline.</li>
        </ul>
      )}

      {mode === "bulan" && (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
            {HARI.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {(() => {
              const first = monthStart(anchor);
              const lead = (toD(first).getUTCDay() + 6) % 7;
              const n = daysIn(first);
              const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => addDays(first, i))];
              while (cells.length % 7) cells.push(null);
              return cells.map((day, i) => {
                if (!day) return <span key={i} />;
                const run = running(day);
                const due = dueOn(day);
                const late = due.some((t) => isLate(t, today));
                return (
                  <Link key={day} href={href("minggu", day)} className={`min-h-16 rounded-lg border p-1 text-left lg:min-h-24 lg:p-1.5 ${day === today ? "border-brand" : "border-line"} ${heat(run.length)}`}>
                    <span className="flex items-center justify-between text-[11px] font-bold text-heading">
                      {+day.slice(8)}
                      {run.length > 0 && <span className={`rounded-full px-1 text-[10px] ${late ? "bg-danger text-white" : "bg-white/80 text-muted"}`}>{run.length}</span>}
                    </span>
                    <span className="mt-0.5 hidden space-y-0.5 lg:block">
                      {due.slice(0, 2).map((t) => (
                        <span key={t.id} className={`block truncate text-[10px] ${t.status === "done" ? "text-muted line-through" : "text-ink"}`}>
                          ⏰ {t.title}
                        </span>
                      ))}
                      {due.length > 2 && <span className="block text-[10px] text-muted">+{due.length - 2} lagi</span>}
                    </span>
                    {due.length > 0 && <span className="mt-1 block h-1 w-1 rounded-full bg-brand lg:hidden" />}
                  </Link>
                );
              });
            })()}
          </div>
          <p className="mt-2 text-xs text-muted">Angka = tugas berjalan hari itu (merah bila ada yang terlambat). Titik/⏰ = ada deadline. Ketuk tanggal untuk lihat detail minggunya.</p>
        </>
      )}

      {mode === "tahun" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }, (_, m) => `${anchor.slice(0, 4)}-${String(m + 1).padStart(2, "0")}-01`).map((first) => {
            const lead = (toD(first).getUTCDay() + 6) % 7;
            const days = Array.from({ length: daysIn(first) }, (_, i) => addDays(first, i));
            const total = new Set(days.flatMap((d) => dueOn(d).map((t) => t.id))).size;
            return (
              <Link key={first} href={href("bulan", first)} className="rounded-xl border border-line p-2.5 hover:border-gold">
                <p className="mb-1.5 flex justify-between text-sm font-bold text-heading">
                  {BULAN[+first.slice(5, 7) - 1]} <span className="text-xs font-semibold text-muted">{total} deadline</span>
                </p>
                <span className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: lead }, (_, i) => (
                    <span key={`x${i}`} />
                  ))}
                  {days.map((d) => (
                    <span key={d} className={`aspect-square rounded-sm border ${d === today ? "border-brand" : "border-line/60"} ${heat(running(d).length)}`} title={`${+d.slice(8)}: ${running(d).length} tugas`} />
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
