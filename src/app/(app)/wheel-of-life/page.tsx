import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { WheelChart, wheelAverage } from "@/components/wheel-chart";
import { getWheelHistory } from "@/lib/data";
import { WHEEL_AREAS } from "@/lib/types";
import { WheelForm } from "./wheel-form";

export const metadata = { title: "Wheel of Life" };

export default async function WheelPage({ searchParams }: { searchParams: Promise<{ tersimpan?: string; isi?: string }> }) {
  const [{ tersimpan, isi }, history] = await Promise.all([searchParams, getWheelHistory()]);
  const latest = history[0];
  const prev = history[1];
  const showForm = !latest || isi === "1";

  return (
    <>
      <PageHeader
        eyebrow="Define · Wheel of Life"
        title="Keseimbangan hidup Anda"
        desc="Potret singkat delapan area kehidupan. Ulangi setiap bulan untuk melihat perkembangannya."
        action={
          !showForm ? (
            <a href="/wheel-of-life?isi=1" className="btn-primary self-start">
              Nilai ulang
            </a>
          ) : null
        }
      />
      {tersimpan && (
        <p className="mb-5 flex animate-rise items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" /> Penilaian tersimpan. Lihat hasilnya di bawah.
        </p>
      )}
      {showForm ? (
        <WheelForm initial={latest?.scores} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="card flex flex-col items-center p-5 lg:col-span-3 lg:p-7">
            <div className="flex w-full items-center justify-between">
              <p className="eyebrow">Hasil terakhir</p>
              <p className="text-xs text-muted">
                {new Date(latest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <WheelChart scores={latest.scores} previous={prev?.scores} size={340} />
            {prev && (
              <p className="flex items-center gap-2 text-xs text-muted">
                <span className="inline-block h-0 w-5 border-t-2 border-dashed border-gold" /> penilaian sebelumnya
              </p>
            )}
          </section>
          <aside className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
              <p className="eyebrow">Skor rata-rata</p>
              <p className="mt-2 text-4xl font-bold">
                {wheelAverage(latest.scores)}
                <span className="text-lg font-medium text-white/60"> / 10</span>
              </p>
              {prev && (
                <p className="mt-1 text-sm text-white/70">
                  {wheelAverage(latest.scores) >= wheelAverage(prev.scores) ? "Naik" : "Turun"} dari {wheelAverage(prev.scores)} sebelumnya
                </p>
              )}
              {latest.note && <p className="mt-4 border-t border-white/15 pt-4 text-sm leading-relaxed text-white/85">“{latest.note}”</p>}
            </section>
            <section className="card p-5">
              <h2 className="font-bold text-heading">Rincian per area</h2>
              <ul className="mt-3 space-y-2.5">
                {[...WHEEL_AREAS]
                  .sort((a, b) => latest.scores[a.key] - latest.scores[b.key])
                  .map((a, i) => {
                    const v = latest.scores[a.key];
                    const d = prev ? v - prev.scores[a.key] : 0;
                    return (
                      <li key={a.key} className="flex items-center gap-3 text-sm">
                        <span className="flex-1 text-ink">
                          {a.label}
                          {i < 2 && <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold text-brand">Fokus</span>}
                        </span>
                        {d !== 0 && <span className={`text-xs font-semibold ${d > 0 ? "text-success" : "text-danger"}`}>{d > 0 ? `+${d}` : d}</span>}
                        <span className="w-6 text-right font-bold text-heading">{v}</span>
                      </li>
                    );
                  })}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
