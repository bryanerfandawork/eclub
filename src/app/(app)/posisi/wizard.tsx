"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Loader2 } from "lucide-react";
import { submitPlacement } from "@/app/actions/placement";
import { PLACEMENT_QUESTIONS, SCALE } from "@/lib/placement";

export function PlacementWizard() {
  const qs = PLACEMENT_QUESTIONS;
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!started) {
    return (
      <div className="card mx-auto max-w-2xl animate-rise p-6 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand text-gold">
          <Compass className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-5">{qs.length} pertanyaan · sekitar 3 menit</p>
        <h2 className="mt-2 text-2xl font-bold text-heading">Di mana posisi Anda sekarang?</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          Jawab dengan jujur sesuai kondisi saat ini. Di akhir, Anda akan melihat posisi Anda di peta Sustainable Entrepreneur Framework dan langkah yang paling tepat untuk dimulai.
        </p>
        <button onClick={() => setStarted(true)} className="btn-primary mt-7 px-8 py-3">
          Mulai
        </button>
      </div>
    );
  }

  const q = qs[i];
  const choose = (v: string | number) => {
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    setError(null);
    if (i < qs.length - 1) return void setTimeout(() => setI(i + 1), 160);
    startTransition(async () => {
      const res = await submitPlacement(next);
      if ("error" in res && res.error) setError(res.error);
      else router.push("/posisi?hasil=1");
    });
  };

  const opts = q.type === "scale" ? SCALE.map((label, k) => ({ label, value: k + 1 as string | number })) : q.options;
  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex items-center gap-1 disabled:opacity-0">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <span>
          {i + 1} / {qs.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((i + 1) / qs.length) * 100}%` }} />
      </div>
      <div key={q.id} className="card mt-5 animate-rise p-6 sm:p-8">
        <h2 className="text-xl leading-snug font-bold text-heading">{q.text}</h2>
        <div className="mt-6 space-y-2">
          {opts.map((o) => (
            <button
              key={String(o.value)}
              disabled={pending}
              onClick={() => choose(o.value)}
              className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                answers[q.id] === o.value ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40 hover:bg-paper"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {pending && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Menghitung posisi Anda…
          </p>
        )}
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
