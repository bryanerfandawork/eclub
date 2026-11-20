import Link from "next/link";
import { notFound } from "next/navigation";
import { Hourglass } from "lucide-react";
import { AssessmentResultView } from "@/components/assessment-result";
import { PageHeader } from "@/components/ui";
import { getAssessment } from "@/lib/assessments";
import { getAssessmentResults } from "@/lib/data";
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
  const results = await getAssessmentResults(key, 2);
  const latest = results[0];

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={a.title}
        desc={a.subtitle}
        action={
          latest && !ulang ? (
            <Link href={`/assessment/${key}?ulang=1`} className="btn-primary self-start">
              Ulangi tes
            </Link>
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
      ) : latest && !ulang ? (
        <>
          <p className="mb-4 text-sm text-muted">
            Hasil terakhir: {new Date(latest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <AssessmentResultView assessment={a} scores={latest.scores} previous={results[1]?.scores} />
        </>
      ) : (
        <Quiz assessment={a} previous={latest?.scores} />
      )}
    </>
  );
}
