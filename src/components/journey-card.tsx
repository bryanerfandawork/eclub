import Link from "next/link";
import { ArrowRight, Check, Route } from "lucide-react";
import type { Journey } from "@/lib/steps-server";

/** Kartu utama Home: 5 langkah, progres, dan satu tombol "Langkah berikutnya". */
export function JourneyCard({ j }: { j: Journey }) {
  const cur = j.steps[j.current - 1];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand p-5 text-white shadow-lift lg:p-7">
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-1.5">
          <Route className="h-3.5 w-3.5" /> Perjalanan 5 Langkah
        </p>
        <Link href="/journey" className="text-xs font-semibold text-white/80 hover:text-white">
          Lihat semua ›
        </Link>
      </div>
      <div className="relative mt-4 grid grid-cols-5 gap-1.5 lg:gap-2.5">
        {j.steps.map((s) => {
          const on = s.no === j.current;
          return (
            <Link key={s.no} href={`/journey#langkah-${s.no}`} className={`rounded-2xl p-2 text-center transition lg:p-3 ${on ? "bg-white text-heading" : s.complete ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}>
              <span className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${on ? "bg-brand text-white" : s.complete ? "bg-gold text-heading" : "bg-white/15"}`}>
                {s.complete ? <Check className="h-4 w-4" /> : s.no}
              </span>
              <span className={`mt-1.5 block text-[10px] leading-tight font-semibold lg:text-xs ${on ? "" : "text-white/85"}`}>{s.title}</span>
              <span className={`mt-0.5 hidden text-[10px] lg:block ${on ? "text-muted" : "text-white/55"}`}>
                {s.total ? `${s.done}/${s.total}` : "Ritme"}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.max(3, j.pct)}%` }} />
      </div>
      <div className="relative mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-snug font-bold">
            Langkah {cur.no}: {cur.title}
          </p>
          <p className="mt-0.5 text-sm text-white/75">{j.current < 5 ? cur.why : "Langkah 1 sampai 4 sudah lengkap. Sekarang jaga ritmenya: laporan harian setiap hari, evaluasi tiap minggu, progres tiap bulan."}</p>
        </div>
        {j.current < 5 && j.next ? (
          <Link href={j.next.href} className="btn-gold shrink-0 py-3">
            {j.next.label} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link href="/today" className="btn-gold py-3">
              Isi laporan hari ini <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/rekap" className="text-center text-xs font-semibold text-white/80 hover:text-white">
              Lihat rekap & rekomendasi ›
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
