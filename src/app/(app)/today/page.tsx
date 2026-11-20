import { CalendarCheck2, Flame, Undo2 } from "lucide-react";
import { carryOverDaily } from "@/app/actions/growth";
import { DailyList } from "@/components/daily-list";
import { PageHeader, ProgressBar } from "@/components/ui";
import { WeekBars } from "@/components/week-bars";
import { getDailyRange, getDreams, getProgressStats } from "@/lib/data";
import { tanggalPanjang, todayJakarta } from "@/lib/format";

export const metadata = { title: "Daily Action" };

export default async function TodayPage() {
  const today = todayJakarta();
  const [items, dreams, stats] = await Promise.all([getDailyRange(todayJakarta(-7), today), getDreams(), getProgressStats()]);
  const todayItems = items.filter((a) => a.action_date === today);
  const leftover = items.filter((a) => a.action_date < today && !a.done).length;
  const done = todayItems.filter((a) => a.done).length;
  const pct = todayItems.length ? Math.round((done / todayItems.length) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="Execute · Daily Action" title="Aksi hari ini" desc={tanggalPanjang(today)} />
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <section className="card p-5 lg:col-span-3 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <CalendarCheck2 className="h-5 w-5 text-brand" /> Daftar aksi
            </h2>
            <span className="text-xs font-medium text-muted">
              {done}/{todayItems.length} selesai
            </span>
          </div>
          {todayItems.length > 0 && (
            <div className="mt-3">
              <ProgressBar value={pct} tone="brand" />
            </div>
          )}
          {leftover > 0 && (
            <form action={carryOverDaily} className="mt-4">
              <button className="flex w-full items-center gap-2 rounded-xl border border-dashed border-gold bg-gold-soft/50 px-3.5 py-2.5 text-left text-sm font-medium text-heading hover:bg-gold-soft">
                <Undo2 className="h-4 w-4 text-gold" /> Pindahkan {leftover} aksi yang belum selesai ke hari ini
              </button>
            </form>
          )}
          <div className="mt-2">
            <DailyList items={todayItems} date={today} dreams={dreams.filter((d) => d.status === "active").map((d) => ({ id: d.id, title: d.title }))} />
          </div>
        </section>
        <aside className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <Flame className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.streak} hari</p>
                <p className="text-sm text-white/70">Rangkaian konsisten</p>
              </div>
            </div>
            {(() => {
              const MILESTONES = [3, 7, 14, 21, 30];
              const next = MILESTONES.find((m) => m > stats.streak);
              const prev = [...MILESTONES].reverse().find((m) => m <= stats.streak) ?? 0;
              return (
                <>
                  <div className="mt-5 flex gap-1.5">
                    {MILESTONES.map((m) => (
                      <span key={m} className={`flex-1 rounded-full py-1 text-center text-[11px] font-bold ${stats.streak >= m ? "bg-gold text-brand-deep" : "bg-white/10 text-white/50"}`}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-white/75">
                    {prev > 0 && <span className="font-semibold text-gold">Hebat, {prev} hari berturut-turut tercapai! </span>}
                    {next
                      ? `${next - stats.streak} hari lagi menuju ${next} hari. Selesaikan minimal satu aksi hari ini agar rangkaian tidak putus.`
                      : "Anda sudah 30 hari konsisten. Kebiasaan ini sudah menjadi bagian dari diri Anda."}
                  </p>
                </>
              );
            })()}
          </section>
          <section className="card p-5">
            <h2 className="mb-4 font-bold text-heading">7 hari terakhir</h2>
            <WeekBars days={stats.last7} />
          </section>
        </aside>
      </div>
    </>
  );
}
