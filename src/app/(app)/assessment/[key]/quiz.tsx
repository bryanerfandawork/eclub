"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { submitAssessment } from "@/app/actions/assessment";
import { AssessmentResultView } from "@/components/assessment-result";
import { LIKERT, type Assessment } from "@/lib/assessments/types";

export function Quiz({ assessment, previous }: { assessment: Assessment; previous?: Record<string, number> | null }) {
  const qs = assessment.questions;
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ scores: Record<string, number>; demo?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (result) {
    return (
      <div className="animate-rise space-y-5">
        {result.demo && (
          <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-heading">Mode demo: hasil ditampilkan tetapi tidak disimpan.</p>
        )}
        <AssessmentResultView assessment={assessment} scores={result.scores} previous={previous} />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card mx-auto max-w-2xl animate-rise p-6 text-center sm:p-10">
        <p className="eyebrow">{qs.length} pernyataan · sekitar {Math.max(2, Math.round(qs.length / 5))} menit</p>
        <h2 className="mt-3 text-2xl font-bold text-heading">{assessment.subtitle}</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{assessment.intro}</p>
        <button onClick={() => setStarted(true)} className="btn-primary mt-7 px-8 py-3">
          Mulai
        </button>
      </div>
    );
  }

  const q = qs[i];
  const dim = assessment.dimensions.find((d) => d.key === q.dimension);
  const answeredAll = qs.every((x) => answers[x.id]);

  const choose = (v: number) => {
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    setError(null);
    if (i < qs.length - 1) {
      setTimeout(() => setI(i + 1), 180);
    } else {
      startTransition(async () => {
        const r = await submitAssessment(assessment.key, next);
        if ("error" in r && r.error) setError(r.error);
        else if ("scores" in r && r.scores) setResult({ scores: r.scores, demo: "demo" in r ? r.demo : false });
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0 || pending}
          className="rounded-lg p-2 text-muted hover:bg-white disabled:opacity-30"
          aria-label="Sebelumnya"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${((i + (answers[q.id] ? 1 : 0)) / qs.length) * 100}%` }} />
        </div>
        <span className="w-14 text-right text-xs font-semibold text-muted">
          {i + 1}/{qs.length}
        </span>
      </div>

      <div key={q.id} className="card animate-rise p-6 sm:p-10">
        {dim && <p className="eyebrow">{dim.label}</p>}
        <h2 className="mt-3 text-xl leading-snug font-semibold text-heading sm:text-2xl">{q.text}</h2>
        <div className="mt-7 grid gap-2.5">
          {LIKERT.map((l) => {
            const on = answers[q.id] === l.value;
            return (
              <button
                key={l.value}
                onClick={() => choose(l.value)}
                disabled={pending}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] font-medium transition ${
                  on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40 hover:bg-paper"
                }`}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${on ? "bg-white/20" : "bg-paper text-brand"}`}>{l.value}</span>
                {l.label}
              </button>
            );
          })}
        </div>
        {pending && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Menghitung hasil…
          </p>
        )}
        {error && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger">
            <span>{error}</span>
            {answeredAll && (
              <button onClick={() => choose(answers[q.id])} className="flex items-center gap-1 font-semibold">
                <RotateCcw className="h-4 w-4" /> Coba lagi
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
