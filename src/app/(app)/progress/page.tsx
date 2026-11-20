import Link from "next/link";
import { CheckCircle2, Flame, Gem, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { WeekBars } from "@/components/week-bars";
import { WheelChart, wheelAverage } from "@/components/wheel-chart";
import { getProgressStats, getWheelHistory } from "@/lib/data";

export const metadata = { title: "My Progress" };

export default async function ProgressPage() {
  const [stats, wheel] = await Promise.all([getProgressStats(), getWheelHistory(2)]);
  const tiles = [
    { icon: Flame, value: `${stats.streak} hari`, label: "Rangkaian konsisten" },
    { icon: CheckCircle2, value: stats.dailyDone30, label: "Aksi harian selesai (30 hari)" },
    { icon: Gem, value: stats.dreamsActive, label: "Mimpi aktif" },
    { icon: Trophy, value: stats.dreamsAchieved, label: "Mimpi tercapai" },
  ];
  const rate = stats.dailyTotal30 ? Math.round((stats.dailyDone30 / stats.dailyTotal30) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="My Progress" title="Perkembangan saya" desc="Lihat seberapa jauh Anda sudah melangkah." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {tiles.map(({ icon: Icon, value, label }, i) => (
          <div key={label} className="card animate-rise p-5" style={{ animationDelay: `${i * 50}ms` }}>
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-3 text-2xl font-bold text-heading">{value}</p>
            <p className="mt-0.5 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-2 lg:gap-6">
        <section className="card p-5 lg:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-bold text-heading">Aksi 7 hari terakhir</h2>
            <span className="text-xs text-muted">Tingkat selesai 30 hari: <b className="text-heading">{rate}%</b></span>
          </div>
          <WeekBars days={stats.last7} />
          <Link href="/today" className="btn-ghost mt-5 w-full">Buka aksi hari ini</Link>
        </section>
        <section className="card flex flex-col items-center p-5 lg:p-6">
          <div className="flex w-full items-baseline justify-between">
            <h2 className="font-bold text-heading">Wheel of Life</h2>
            {wheel[0] && <span className="text-xs text-muted">Rata-rata <b className="text-heading">{wheelAverage(wheel[0].scores)}</b></span>}
          </div>
          {wheel[0] ? (
            <>
              <WheelChart scores={wheel[0].scores} previous={wheel[1]?.scores} size={280} />
              <Link href="/wheel-of-life" className="btn-ghost w-full">Lihat detail</Link>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="max-w-xs text-sm text-muted">Belum ada penilaian. Mulai dengan menilai delapan area hidup Anda.</p>
              <Link href="/wheel-of-life" className="btn-primary">Isi Wheel of Life</Link>
            </div>
          )}
        </section>
      </div>
      <p className="mt-5 text-center text-xs text-muted">{stats.dreamActionsDone} langkah aksi mimpi sudah Anda selesaikan sejauh ini.</p>
    </>
  );
}
