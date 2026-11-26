import Link from "next/link";
import { CheckCircle2, Flame, Gem, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { WeekBars } from "@/components/week-bars";
import { DiscSummary } from "@/components/disc-summary";
import { getDiscResult } from "@/lib/disc/server";
import { getProgressStats } from "@/lib/data";
import { DreamProgress } from "@/components/links/dream-progress";

export const metadata = { title: "My Progress" };

export default async function ProgressPage() {
  const [stats, disc] = await Promise.all([getProgressStats(), getDiscResult()]);
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
        <section className="space-y-4">
          <DreamProgress />
          <DiscSummary result={disc?.result ?? null} />
          <Link href="/assessment/8-wheel-entrepreneur" className="card block p-6 transition hover:shadow-lift">
            <p className="eyebrow">8 Wheel Entrepreneur</p>
            <p className="mt-1 font-semibold text-heading">Lihat perkembangan kompetensi entrepreneur Anda</p>
          </Link>
          <Link href="/sertifikat" className="card block p-6 transition hover:shadow-lift">
            <p className="eyebrow">Sertifikat SEF</p>
            <p className="mt-1 font-semibold text-heading">Lihat tahap SEF yang sudah Anda tuntaskan</p>
          </Link>
        </section>
      </div>
      <p className="mt-5 text-center text-xs text-muted">{stats.dreamActionsDone} langkah aksi mimpi sudah Anda selesaikan sejauh ini.</p>
    </>
  );
}
