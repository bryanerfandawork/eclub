import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { AssistantPanel } from "./assistant-panel";
import { getAssistantStats, getSyukurToday, getWorks, statusOf } from "@/lib/assistant";
import { getDailyRange } from "@/lib/data";
import { demoDaily } from "@/lib/demo";
import { getFinance, getFinToday } from "@/lib/finance-server";
import { compactRupiah, rupiah, todayJakarta } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";

/** Home: ritual harian (keuangan, rencana aksi & kebiasaan, syukur) + ringkasan asisten. */
export async function AssistantHome({ streak, hero = true }: { streak: number; hero?: boolean }) {
  const today = todayJakarta();
  const [stats, works, items, fin, finToday, syukur] = await Promise.all([
    getAssistantStats(),
    getWorks(),
    isDemoMode ? Promise.resolve(demoDaily) : getDailyRange(today, today),
    getFinance(today.slice(0, 7)),
    getFinToday(),
    getSyukurToday(),
  ]);
  const open = items.filter((a) => a.action_date === today && statusOf(a) === "open").slice(0, 4);
  const workName = (id?: string | null) => works.find((w) => w.id === id)?.name;
  const plansDone = stats.today.total > 0 && stats.today.open === 0;
  const habitsDone = stats.habits.count === 0 || stats.habits.doneToday >= stats.habits.count;
  const rows = [
    {
      emoji: "💰",
      title: "Lapor keuangan",
      done: finToday.reported,
      sub: finToday.count ? `${finToday.count} catatan hari ini` : finToday.noTx ? "Hari ini tanpa transaksi" : `Pribadi ${compactRupiah(fin.balances.personal)} · Usaha ${compactRupiah(fin.balances.business)}`,
      href: "/today#keuangan",
      cta: "Catat",
    },
    {
      emoji: "✅",
      title: "Rencana & kebiasaan",
      done: plansDone && habitsDone,
      sub: stats.today.total ? `Rencana ${stats.today.done}/${stats.today.total}${stats.habits.count ? ` · kebiasaan ${stats.habits.doneToday}/${stats.habits.count}` : ""}` : "Belum ada rencana hari ini",
      href: "/today",
      cta: stats.today.total ? "Checklist" : "Tulis",
    },
    { emoji: "🙏", title: "Syukur harian", done: syukur, sub: syukur ? "Sudah ditulis hari ini" : "3 hal yang disyukuri, 1 menit", href: "/kebiasaan", cta: "Tulis" },
  ];
  const doneCount = rows.filter((r) => r.done).length;
  const pct = Math.round((doneCount / 3) * 100);

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className={`relative overflow-hidden rounded-3xl p-5 lg:p-7 ${hero ? "bg-brand text-white shadow-lift" : "card"}`}>
        {hero && <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />}
        <div className="relative flex items-center gap-4">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className={hero ? "stroke-white/15" : "stroke-paper"} />
              <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-gold" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
            </svg>
            <span className="text-lg font-bold">{doneCount}/3</span>
          </div>
          <div className="min-w-0">
            <p className={`text-[11px] font-bold tracking-widest uppercase ${hero ? "text-gold" : "text-gold"}`}>Ritual harian · 3 menit</p>
            <h2 className="text-xl leading-tight font-bold lg:text-2xl">{doneCount === 3 ? "Hari ini tuntas. Hebat! 🎉" : "Laporan hari ini"}</h2>
            <p className={`text-sm ${hero ? "text-white/70" : "text-muted"}`}>{doneCount === 3 ? "Kebiasaan kecil inilah yang membawa Anda ke mimpi." : "Selesaikan 3 hal ini setiap hari."}</p>
          </div>
        </div>
        <ul className="relative mt-5 space-y-2.5">
          {rows.map((r) => (
            <li key={r.title}>
              <Link
                href={r.href}
                className={`flex items-center gap-3 rounded-2xl p-3 transition active:scale-[.99] ${hero ? (r.done ? "bg-white/10" : "bg-white text-heading hover:bg-white/95") : r.done ? "bg-success/5" : "border border-line hover:border-gold"}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${r.done ? "bg-success text-white" : "bg-gold-soft"}`}>{r.done ? <Check className="h-5 w-5" /> : r.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-bold ${r.done && hero ? "text-white" : ""}`}>{r.title}</span>
                  <span className={`block truncate text-xs ${hero ? (r.done ? "text-white/60" : "text-muted") : "text-muted"}`}>{r.sub}</span>
                </span>
                {r.done ? (
                  <span className={`text-xs font-semibold ${hero ? "text-gold" : "text-success"}`}>Selesai</span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white">
                    {r.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="card p-5 lg:col-span-3 lg:p-6">
          <div className="grid grid-cols-2 gap-2">
            {(["personal", "business"] as const).map((w) => (
              <Link key={w} href={`/keuangan?w=${w}`} className="rounded-xl border border-line p-3 hover:border-gold">
                <p className="text-xs text-muted">{w === "personal" ? "🙂 Saldo pribadi" : "🏪 Saldo usaha"}</p>
                <p className={`mt-0.5 truncate text-lg font-bold ${fin.balances[w] < 0 ? "text-danger" : "text-heading"}`}>{rupiah(fin.balances[w])}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="font-bold text-heading">Rencana aksi hari ini</h3>
            <Link href="/today" className="text-xs font-semibold text-brand">
              Laporan harian ›
            </Link>
          </div>
          {open.length ? (
            <ul className="mt-1 divide-y divide-line">
              {open.map((a) => (
                <li key={a.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <span className="min-w-0 flex-1 truncate text-ink">{a.title}</span>
                  {workName(a.work_id) && <span className="max-w-[40%] shrink-0 truncate text-xs text-muted">{workName(a.work_id)}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted">{stats.today.total ? "Semua rencana hari ini sudah dilaporkan ✓" : "Belum ada rencana. Tulis 1 sampai 3 hal terpenting hari ini."}</p>
          )}
          {stats.overdue.length > 0 && (
            <Link href="/today" className="mt-3 block rounded-xl bg-gold-soft/60 px-3 py-2 text-xs font-semibold text-heading">
              ⏳ {stats.overdue.length} rencana tertunda dari hari sebelumnya ›
            </Link>
          )}
          {stats.week.topDream && (
            <p className="mt-3 text-xs text-muted">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-gold" /> Minggu ini paling maju: <b className="text-heading">{stats.week.topDream.title}</b>
            </p>
          )}
        </div>
        <div className="lg:col-span-2">
          <AssistantPanel stats={stats} streak={streak} />
        </div>
      </section>
    </div>
  );
}
