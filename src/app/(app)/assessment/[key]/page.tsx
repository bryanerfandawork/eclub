import Link from "next/link";
import { notFound } from "next/navigation";
import { Hourglass } from "lucide-react";
import { AssessmentResultView } from "@/components/assessment-result";
import { PageHeader } from "@/components/ui";
import { getAssessment } from "@/lib/assessments";
import { getAssessmentResults } from "@/lib/data";
import { getLimit } from "@/lib/plans";
import { Quiz } from "./quiz";

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ ulang?: string }>;
}) {
  const [{ key }, { ulang }] = await Promise.all([params, searchParams]);
  const a = getAssessment(key);
  if (!a) notFound();
  const [results, limit] = await Promise.all([getAssessmentResults(key, 50), getLimit("assessment_attempts")]);
  const latest = results[0];
  const recent = results.filter((r) => new Date(r.created_at).getTime() > Date.now() - 90 * 86_400_000).length;
  const canRetake = limit == null || recent < limit;
  const nextDate = latest && a.retakeDays ? new Date(new Date(latest.created_at).getTime() + a.retakeDays * 86_400_000) : null;
  const due = nextDate ? nextDate <= new Date() : false;
  const fmt = (d: Date | string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const avg = (sc: Record<string, number>) => Math.round((a.dimensions.reduce((t, d) => t + (sc[d.key] ?? 0), 0) / a.dimensions.length) * 10) / 10;

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={a.title}
        desc={a.subtitle}
        action={
          latest && !ulang ? (
            canRetake ? (
              <Link href={`/assessment/${key}?ulang=1`} className="btn-primary self-start">
                Ulangi tes
              </Link>
            ) : (
              <Link href="/paket" className="btn-gold self-start">
                Ulangi tes dengan Plus
              </Link>
            )
          ) : null
        }
      />
      {!a.questions.length ? (
        <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-soft text-gold">
            <Hourglass className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-heading">Materi sedang disiapkan</h2>
          <p className="max-w-sm text-sm text-muted">Pertanyaan untuk assessment ini sedang disusun oleh tim EClub. Kami akan memberi tahu saat sudah bisa diikuti.</p>
        </div>
      ) : latest && (!ulang || !canRetake) ? (
        <>
          <div className={`mb-5 flex flex-col gap-1 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${due ? "bg-gold-soft text-heading" : "bg-white text-muted"}`}>
            <span>Hasil terakhir: <b className="text-heading">{fmt(latest.created_at)}</b></span>
            {nextDate && <span>{due ? "Sudah waktunya tes ulang untuk melihat perkembangan Anda." : <>Tes ulang disarankan: <b className="text-heading">{fmt(nextDate)}</b></>}</span>}
          </div>
          <AssessmentResultView assessment={a} scores={latest.scores} previous={results[1]?.scores} />
          {results.length > 1 && (
            <section className="card mt-5 p-5">
              <h2 className="font-bold text-heading">Riwayat tes</h2>
              <ul className="mt-3 divide-y divide-line">
                {results.map((r) => (
                  <li key={r.id} className="flex justify-between py-2.5 text-sm">
                    <span className="text-ink">{fmt(r.created_at)}</span>
                    <span className="font-bold text-heading">{avg(r.scores)} / 10</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {a.disclaimer && <p className="mt-5 text-center text-xs text-muted">{a.disclaimer}</p>}
        </>
      ) : (
        <Quiz assessment={a} previous={latest?.scores} />
      )}
    </>
  );
}
