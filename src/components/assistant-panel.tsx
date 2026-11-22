import { Flame } from "lucide-react";
import type { AssistantStats } from "@/lib/assistant";

/** Panel statistik asisten (Laporan Harian & Home). */
export function AssistantPanel({ stats, streak }: { stats: AssistantStats; streak: number }) {
  return (
    <section className="rounded-2xl bg-brand p-5 text-white shadow-lift">
      <p className="eyebrow">Statistik 30 hari</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {[
          [`${stats.rate}%`, "rencana selesai"],
          [String(stats.total30), "rencana aksi"],
          [`${stats.dreamPct}%`, "mendukung mimpi"],
          [String(stats.overdue.length), "masih tertunda"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl bg-white/10 p-3">
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-xs text-white/70">{l}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-white/85">
        <Flame className="h-4 w-4 text-gold" /> {streak} hari berturut-turut · kebiasaan {stats.habits.rate7}% (7 hari)
      </p>
      {stats.longest.length > 0 && (
        <div className="mt-4 rounded-xl bg-white/5 p-3">
          <p className="text-xs font-semibold text-gold">Paling lama berjalan</p>
          <ul className="mt-1.5 space-y-1.5 text-sm">
            {stats.longest.map((a) => (
              <li key={a.id} className="flex gap-2">
                <span className="min-w-0 flex-1 truncate">{a.title}</span>
                <span className="shrink-0 text-xs text-white/70">{a.age} hari</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {stats.byWork.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gold">Per pekerjaan</p>
          {stats.byWork.map((w) => (
            <div key={w.id}>
              <div className="flex justify-between text-xs">
                <span className="truncate">{w.name}</span>
                <span className="text-white/70">
                  {w.done}/{w.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round((w.done / w.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
