"use client";

import { useActionState, useState } from "react";
import { saveReview } from "@/app/actions/review";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { notifySaved } from "@/components/step-bar";

const MOODS = ["😞", "😕", "😐", "🙂", "🤩"];

export function ReviewForm({ done }: { done: boolean }) {
  const [state, action] = useActionState(async (p: Parameters<typeof saveReview>[0], fd: FormData) => {
    const r = await saveReview(p, fd);
    if (r?.message) notifySaved();
    return r;
  }, undefined);
  const [mood, setMood] = useState(0);
  return (
    <form action={action} className="card space-y-4 p-5 lg:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-bold text-heading">Evaluasi minggu ini</h2>
        {done && <span className="text-xs font-semibold text-success">✓ Sudah diisi minggu ini</span>}
      </div>
      <div>
        <p className="label">Bagaimana minggu Anda secara keseluruhan?</p>
        <input type="hidden" name="mood" value={mood || 3} />
        <div className="flex gap-2">
          {MOODS.map((e, i) => (
            <button key={e} type="button" onClick={() => setMood(i + 1)} className={`grid h-11 w-11 place-items-center rounded-full text-2xl transition ${mood === i + 1 ? "scale-110 bg-gold-soft ring-2 ring-gold" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="win">1. Apa yang berhasil minggu ini? (sekecil apa pun)</label>
        <textarea id="win" name="win" rows={2} maxLength={500} className="input resize-y" placeholder="Misal: 5 hari berturut-turut mencatat pengeluaran" />
      </div>
      <div>
        <label className="label" htmlFor="fix">2. Apa yang ingin diperbaiki?</label>
        <textarea id="fix" name="fix" rows={2} maxLength={500} className="input resize-y" placeholder="Misal: masih sering menunda menawarkan produk" />
      </div>
      <div>
        <label className="label" htmlFor="focus">3. Satu fokus utama untuk minggu depan</label>
        <input id="focus" name="focus" maxLength={500} className="input" placeholder="Misal: tawarkan katering ke 10 orang" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3">Simpan evaluasi</SubmitButton>
    </form>
  );
}
