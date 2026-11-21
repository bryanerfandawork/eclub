"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { submitDisc } from "@/app/actions/disc";

export function DiscQuiz({ questions }: { questions: string[][] }) {
  const n = questions.length;
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [most, setMost] = useState<number[]>(Array(n).fill(-1));
  const [least, setLeast] = useState<number[]>(Array(n).fill(-1));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!started) {
    return (
      <div className="card mx-auto max-w-2xl animate-rise p-6 sm:p-10">
        <p className="eyebrow">24 nomor · sekitar 10 menit</p>
        <h2 className="mt-2 text-2xl font-bold text-heading">Cara mengisi</h2>
        <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink">
          <li>• Setiap nomor berisi 4 pernyataan.</li>
          <li>
            • Tekan <b className="text-success">👍 Paling sesuai</b> untuk satu pernyataan yang <b>paling menggambarkan</b> diri Anda.
          </li>
          <li>
            • Tekan <b className="text-danger">👎 Paling tidak sesuai</b> untuk satu pernyataan yang <b>paling tidak menggambarkan</b> diri Anda.
          </li>
          <li>• Jawab spontan sesuai diri Anda sehari-hari, bukan yang Anda harapkan. Tidak ada jawaban benar atau salah.</li>
        </ul>
        <button onClick={() => setStarted(true)} className="btn-primary mt-7 w-full py-3 sm:w-auto sm:px-10">
          Mulai tes
        </button>
      </div>
    );
  }

  const finish = (m: number[], l: number[]) =>
    start(async () => {
      const res = await submitDisc({ most: m, least: l });
      if ("error" in res && res.error) setError(res.error);
      else router.push("/disc?hasil=1");
    });

  const pick = (kind: "m" | "l", idx: number) => {
    const m = [...most], l = [...least];
    if (kind === "m") {
      m[i] = idx;
      if (l[i] === idx) l[i] = -1;
    } else {
      l[i] = idx;
      if (m[i] === idx) m[i] = -1;
    }
    setMost(m);
    setLeast(l);
    setError(null);
    if (m[i] >= 0 && l[i] >= 0) {
      if (i < n - 1) setTimeout(() => setI(i + 1), 250);
      else finish(m, l);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex items-center gap-1 disabled:opacity-0">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <span>
          Nomor {i + 1} dari {n}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((i + 1) / n) * 100}%` }} />
      </div>
      <div key={i} className="card mt-5 animate-rise p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted">Pilih satu yang paling sesuai dan satu yang paling tidak sesuai.</p>
        <div className="space-y-2.5">
          {questions[i].map((text, idx) => {
            const isM = most[i] === idx, isL = least[i] === idx;
            return (
              <div key={idx} className={`rounded-xl border p-3 transition ${isM ? "border-success bg-success/5" : isL ? "border-danger bg-danger/5" : "border-line bg-white"}`}>
                <p className="text-[15px] font-medium text-heading">{text}</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => pick("m", idx)}
                    disabled={pending}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${isM ? "bg-success text-white" : "bg-paper text-muted hover:text-success"}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Paling sesuai
                  </button>
                  <button
                    onClick={() => pick("l", idx)}
                    disabled={pending}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${isL ? "bg-danger text-white" : "bg-paper text-muted hover:text-danger"}`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Paling tidak sesuai
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {pending && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Menghitung profil DISC Anda…
          </p>
        )}
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        {i === n - 1 && most[i] >= 0 && least[i] >= 0 && !pending && (
          <button onClick={() => finish(most, least)} className="btn-primary mt-5 w-full">
            Lihat hasil
          </button>
        )}
      </div>
    </div>
  );
}
