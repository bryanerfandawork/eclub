"use client";

import { useActionState, useState } from "react";
import { saveGratitude } from "@/app/actions/habits";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

const MOODS = ["😞", "😕", "😐", "🙂", "😄"];

export function GratitudeForm({ items, mood }: { items: string[]; mood: number | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveGratitude, {});
  const [m, setM] = useState(mood ?? 0);
  return (
    <form id="syukur" action={action} className="scroll-mt-24 space-y-3">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Bagaimana perasaan Anda hari ini?</p>
        <input type="hidden" name="mood" value={m || ""} />
        <div className="flex gap-2">
          {MOODS.map((e, i) => (
            <button key={e} type="button" onClick={() => setM(i + 1)} className={`grid h-11 w-11 place-items-center rounded-full text-2xl transition ${m === i + 1 ? "scale-110 bg-gold-soft ring-2 ring-gold" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm font-medium text-ink">Hari ini saya bersyukur atas…</p>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-bold text-gold">{i}.</span>
          <input name={`item${i}`} defaultValue={items[i - 1] ?? ""} maxLength={200} className="input" placeholder={i === 1 ? "Misal: ada pelanggan baru yang puas" : i === 2 ? "Misal: keluarga sehat" : "Hal kecil pun berarti"} />
        </div>
      ))}
      <SubmitButton className="btn-primary w-full">{items.length ? "Perbarui jurnal hari ini" : "Simpan jurnal"}</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
