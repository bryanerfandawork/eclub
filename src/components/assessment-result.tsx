import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RadarChart } from "./wheel-chart";
import { levelText, type Assessment } from "@/lib/assessments/types";

export function AssessmentResultView({
  assessment,
  scores,
  previous,
}: {
  assessment: Assessment;
  scores: Record<string, number>;
  previous?: Record<string, number> | null;
}) {
  const dims = assessment.dimensions;
  const sorted = [...dims].sort((a, b) => scores[b.key] - scores[a.key]);
  const avg = Math.round((dims.reduce((s, d) => s + (scores[d.key] ?? 0), 0) / dims.length) * 10) / 10;
  return (
    <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <section className="card flex flex-col items-center p-5 lg:col-span-3 lg:p-7">
        <p className="eyebrow self-start">Hasil Anda</p>
        <RadarChart axes={dims} scores={scores} previous={previous} size={360} />
        {previous && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-block h-0 w-5 border-t-2 border-dashed border-gold" /> hasil sebelumnya
          </p>
        )}
      </section>
      <aside className="space-y-5 lg:col-span-2">
        <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
          <p className="eyebrow">Skor keseluruhan</p>
          <p className="mt-2 text-4xl font-bold">
            {avg}
            <span className="text-lg font-medium text-white/60"> / 10</span>
          </p>
          <p className="mt-2 text-sm text-white/75">
            Terkuat: <b className="text-white">{sorted[0]?.label}</b>
            <br />
            Perlu dikembangkan: <b className="text-white">{sorted[sorted.length - 1]?.label}</b>
          </p>
        </section>
        <section className="card p-5">
          <h2 className="font-bold text-heading">Rincian per dimensi</h2>
          <ul className="mt-3 space-y-3">
            {sorted.map((d) => {
              const v = scores[d.key] ?? 0;
              const t = levelText(d, v);
              return (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{d.label}</span>
                    <span className="font-bold text-heading">{v}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(v * 10, 2)}%` }} />
                  </div>
                  {t && <p className="mt-1 text-xs leading-relaxed text-muted">{t}</p>}
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-2xl border border-gold/40 bg-gold-soft p-5">
          <p className="text-sm font-bold text-heading">Langkah berikutnya</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            Hasil ini adalah Personal Mapping Anda, langkah pertama fase Survive. Lanjutkan dengan kelas berjenjang untuk menguatkan <b>{sorted[sorted.length - 1]?.label}</b>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/learn" className="btn-primary">
              Mulai kelas <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/paket" className="btn-ghost">Lihat EClub Plus</Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
