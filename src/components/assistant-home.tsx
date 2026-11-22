import Link from "next/link";
import { ArrowRight, Bot, CalendarCheck2, Clock, Repeat } from "lucide-react";
import { AssistantPanel } from "./assistant-panel";
import { getAssistantStats, getWorks, statusOf } from "@/lib/assistant";
import { getDailyRange } from "@/lib/data";
import { demoDaily } from "@/lib/demo";
import { todayJakarta } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";

/** Home: asisten pribadi (ringkasan laporan harian + statistik). */
export async function AssistantHome({ streak }: { streak: number }) {
  const today = todayJakarta();
  const [stats, works, items] = await Promise.all([getAssistantStats(), getWorks(), isDemoMode ? Promise.resolve(demoDaily) : getDailyRange(today, today)]);
  const open = items.filter((a) => a.action_date === today && statusOf(a) === "open").slice(0, 4);
  const workName = (id?: string | null) => works.find((w) => w.id === id)?.name;
  const h = new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" });
  const evening = Number(h) >= 17;
  const tiles = [
    { icon: Repeat, label: "Kebiasaan", v: `${stats.habits.doneToday}/${stats.habits.count}` },
    { icon: CalendarCheck2, label: "Rencana hari ini", v: `${stats.today.done}/${stats.today.total}` },
    { icon: Clock, label: "Tertunda", v: String(stats.overdue.length) },
  ];
  const msg =
    stats.today.total === 0
      ? "Belum ada rencana aksi hari ini. Tulis 1 sampai 3 hal terpenting, kaitkan ke pekerjaan dan mimpi Anda."
      : stats.today.open === 0
        ? "Semua rencana hari ini selesai. Luar biasa! Tutup hari dengan menulis syukur."
        : evening
          ? `Masih ada ${stats.today.open} rencana yang belum dilaporkan. Tandai selesai, lanjut besok, atau tutup.`
          : `${stats.today.open} rencana menunggu Anda hari ini. Satu per satu saja.`;
  return (
    <section className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <div className="card p-5 lg:col-span-3 lg:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft text-brand">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Asisten pribadi</p>
            <h2 className="font-bold text-heading">Laporan hari ini</h2>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink">{msg}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl bg-paper p-3">
              <t.icon className="h-4 w-4 text-gold" />
              <p className="mt-1 text-xl font-bold text-heading">{t.v}</p>
              <p className="text-[11px] leading-tight text-muted">{t.label}</p>
            </div>
          ))}
        </div>
        {open.length > 0 && (
          <ul className="mt-4 divide-y divide-line">
            {open.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />
                <span className="min-w-0 flex-1 truncate text-ink">{a.title}</span>
                {workName(a.work_id) && <span className="shrink-0 truncate text-xs text-muted">{workName(a.work_id)}</span>}
              </li>
            ))}
          </ul>
        )}
        {stats.week.topDream && (
          <p className="mt-3 rounded-xl bg-gold-soft/60 px-3 py-2 text-xs text-heading">
            ✨ Minggu ini paling maju: <b>{stats.week.topDream.title}</b> ({stats.week.topDream.done} aksi selesai)
          </p>
        )}
        <Link href="/today" className="btn-primary mt-4 w-full py-3">
          Buka laporan harian <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="lg:col-span-2">
        <AssistantPanel stats={stats} streak={streak} />
      </div>
    </section>
  );
}
