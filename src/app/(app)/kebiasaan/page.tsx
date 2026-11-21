import { Archive, Flame } from "lucide-react";
import { archiveHabit, toggleHabit } from "@/app/actions/habits";
import { PageHeader } from "@/components/ui";
import { hariSingkat, todayJakarta } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AddHabit, GratitudeForm } from "./client";

export const metadata = { title: "Kebiasaan & Syukur" };

type Habit = { id: string; name: string; emoji: string };
type Entry = { entry_date: string; items: string[]; mood: number | null };
const MOODS = ["", "😞", "😕", "😐", "🙂", "😄"];

function streak(dates: Set<string>, today: string) {
  let n = 0;
  let i = dates.has(today) ? 0 : 1; // belum dicentang hari ini tidak memutus rangkaian
  while (dates.has(todayJakarta(-i))) {
    n++;
    i++;
  }
  return n;
}

export default async function KebiasaanPage() {
  const today = todayJakarta();
  const week = Array.from({ length: 7 }, (_, i) => todayJakarta(i - 6));
  let habits: Habit[] = [];
  let logs: { habit_id: string; log_date: string }[] = [];
  let entries: Entry[] = [];
  let ready = true;
  if (isDemoMode) {
    habits = [
      { id: "h1", name: "Ibadah tepat waktu", emoji: "🙏" },
      { id: "h2", name: "Catat keuangan", emoji: "💰" },
      { id: "h3", name: "Follow-up 5 pelanggan", emoji: "📞" },
    ];
    logs = [0, 1, 2, 3, 4].flatMap((d) => [{ habit_id: "h1", log_date: todayJakarta(-d) }, ...(d % 2 ? [] : [{ habit_id: "h2", log_date: todayJakarta(-d) }])]);
    entries = [{ entry_date: todayJakarta(-1), items: ["Pesanan katering 50 box", "Anak juara kelas"], mood: 5 }];
  } else {
    const supabase = await createClient();
    const [h, l, g] = await Promise.all([
      supabase.from("habits").select("id, name, emoji").eq("archived", false).order("created_at"),
      supabase.from("habit_logs").select("habit_id, log_date").gte("log_date", todayJakarta(-60)),
      supabase.from("gratitude_entries").select("entry_date, items, mood").order("entry_date", { ascending: false }).limit(14),
    ]);
    if (h.error) ready = false;
    habits = (h.data ?? []) as Habit[];
    logs = l.data ?? [];
    entries = (g.data ?? []) as Entry[];
  }
  if (!ready) return <div className="card p-6 text-sm text-muted">Fitur ini sedang disiapkan.</div>;

  const byHabit = new Map<string, Set<string>>();
  for (const l of logs) byHabit.set(l.habit_id, (byHabit.get(l.habit_id) ?? new Set()).add(l.log_date));
  const doneToday = habits.filter((h) => byHabit.get(h.id)?.has(today)).length;
  const todayEntry = entries.find((e) => e.entry_date === today);
  const past = entries.filter((e) => e.entry_date !== today);

  return (
    <>
      <PageHeader eyebrow="Kebiasaan & syukur" title="Kecil, tapi setiap hari" desc="Kebiasaan baik dan rasa syukur adalah bahan bakar spark Anda. Cukup 1 menit sehari." />
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <section className="card p-5 lg:col-span-3 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-heading">Kebiasaan hari ini</h2>
            {habits.length > 0 && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${doneToday === habits.length ? "bg-success/10 text-success" : "bg-paper text-muted"}`}>
                {doneToday}/{habits.length} selesai
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-2.5">
            {habits.map((h) => {
              const set = byHabit.get(h.id) ?? new Set<string>();
              const done = set.has(today);
              const s = streak(set, today);
              return (
                <li key={h.id} className={`rounded-2xl border p-3 transition ${done ? "border-success/30 bg-success/5" : "border-line"}`}>
                  <div className="flex items-center gap-3">
                    <form action={toggleHabit}>
                      <input type="hidden" name="id" value={h.id} />
                      <input type="hidden" name="date" value={today} />
                      <input type="hidden" name="done" value={done ? "1" : "0"} />
                      <button className={`grid h-11 w-11 place-items-center rounded-xl text-xl transition active:scale-90 ${done ? "bg-success text-white" : "bg-paper"}`} aria-label={done ? "Batalkan" : "Tandai selesai"}>
                        {done ? "✓" : h.emoji}
                      </button>
                    </form>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate font-semibold ${done ? "text-success" : "text-heading"}`}>{h.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {s > 0 ? (
                          <>
                            <Flame className="h-3.5 w-3.5 text-gold" /> {s} hari berturut-turut
                          </>
                        ) : (
                          "Mulai rangkaian hari ini"
                        )}
                      </span>
                    </span>
                    <div className="hidden gap-1 sm:flex">
                      {week.map((d) => (
                        <span key={d} title={d} className={`grid h-6 w-6 place-items-center rounded-md text-[9px] font-semibold ${set.has(d) ? "bg-success text-white" : "bg-paper text-muted"}`}>
                          {hariSingkat(d).slice(0, 1)}
                        </span>
                      ))}
                    </div>
                    <form action={archiveHabit}>
                      <input type="hidden" name="id" value={h.id} />
                      <button className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper" aria-label="Arsipkan" title="Arsipkan">
                        <Archive className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
          <AddHabit existing={habits.map((h) => h.name)} />
        </section>

        <aside className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="font-bold text-heading">Jurnal syukur</h2>
            <p className="mt-0.5 mb-4 text-xs text-muted">Riset psikologi positif: menulis 3 hal yang disyukuri secara rutin membantu suasana hati dan optimisme.</p>
            <GratitudeForm items={todayEntry?.items ?? []} mood={todayEntry?.mood ?? null} />
          </section>
          {past.length > 0 && (
            <section className="card p-5">
              <h3 className="font-bold text-heading">Catatan sebelumnya</h3>
              <ul className="mt-2 space-y-3">
                {past.slice(0, 7).map((e) => (
                  <li key={e.entry_date} className="text-sm">
                    <p className="text-xs font-semibold text-muted">
                      {new Date(e.entry_date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} {e.mood ? MOODS[e.mood] : ""}
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-ink">
                      {e.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
