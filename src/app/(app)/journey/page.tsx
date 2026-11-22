import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Map, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { JourneyCard } from "@/components/journey-card";
import { getJourney } from "@/lib/steps-server";

export const metadata = { title: "Perjalanan 5 Langkah" };

export default async function JourneyPage() {
  const j = await getJourney();
  return (
    <>
      <PageHeader
        eyebrow="Perjalanan 5 Langkah"
        title="Satu jalur, dari mimpi sampai evaluasi"
        desc="Semua fitur EClub tersusun dalam 5 langkah yang saling terhubung. Ikuti berurutan: tentukan arah, kenali titik awal, kenali bekal, susun rencana, lalu evaluasi rutin."
      />
      <JourneyCard j={j} />
      <ol className="relative mt-6 space-y-4">
        <span className="absolute top-6 bottom-6 left-[23px] w-px bg-line lg:left-[27px]" aria-hidden />
        {j.steps.map((s) => (
          <li key={s.no} id={`langkah-${s.no}`} className="relative flex scroll-mt-20 gap-4 lg:gap-5">
            <div className={`z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-base font-bold shadow-soft lg:h-14 lg:w-14 ${s.complete ? "bg-gold text-heading" : s.no === j.current ? "bg-brand text-white" : "border border-line bg-white text-heading"}`}>
              {s.no}
            </div>
            <div className={`card min-w-0 flex-1 p-5 lg:p-6 ${s.no === j.current ? "ring-2 ring-brand/15" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-heading">{s.title}</h2>
                <span className="text-xs font-semibold text-muted">
                  {s.done}/{s.total} selesai{s.no === 5 ? " minggu ini" : ""}
                </span>
              </div>
              <p className="text-sm font-medium text-brand">{s.q}</p>
              <p className="mt-1 text-sm text-muted">{s.why}</p>
              <ul className="mt-3 divide-y divide-line">
                {s.items.map((i) => (
                  <li key={i.key}>
                    <Link href={i.href} className="group flex items-center gap-3 py-2.5">
                      {i.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-line" strokeWidth={2.2} />}
                      <span className={`min-w-0 flex-1 text-sm font-medium ${i.done ? "text-muted" : "text-ink"}`}>
                        {i.label} {i.optional && <span className="text-xs font-normal text-muted">(opsional)</span>}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
              {s.no === 5 && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-paper p-3 text-xs text-muted">
                  <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> Langkah ini berulang. Setiap bulan, perbarui kondisi (langkah 2) dan rencana (langkah 4) dengan angka terbaru.
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <Link href="/learn#peta" className="card mt-6 flex items-center gap-3 p-5 hover:border-gold">
        <Map className="h-6 w-6 shrink-0 text-brand" />
        <span className="flex-1 text-sm">
          <b className="block text-heading">Peta SEF & kelas berjenjang</b>
          <span className="text-muted">Survive, Sustain, Scale Up, Spread Up, beserta kelas untuk tiap tahapnya.</span>
        </span>
        <ArrowRight className="h-5 w-5 text-brand" />
      </Link>
    </>
  );
}
