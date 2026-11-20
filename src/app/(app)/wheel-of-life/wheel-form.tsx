"use client";

import { useActionState, useState } from "react";
import { saveWheel } from "@/app/actions/growth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { WheelChart } from "@/components/wheel-chart";
import { WHEEL_AREAS, type WheelScores } from "@/lib/types";

const HINT: Record<string, string> = {
  karier: "Apakah pekerjaan/usaha Anda memberi makna dan perkembangan?",
  keuangan: "Pendapatan, tabungan, dan rasa aman finansial.",
  kesehatan: "Energi, pola makan, olahraga, dan tidur.",
  keluarga: "Kualitas hubungan dan waktu bersama keluarga.",
  relasi: "Pertemanan, jejaring, dan dukungan sosial.",
  diri: "Belajar hal baru dan bertumbuh sebagai pribadi.",
  spiritual: "Kedamaian batin, ibadah, dan nilai hidup.",
  rekreasi: "Waktu istirahat, hobi, dan lingkungan tempat tinggal.",
};

export function WheelForm({ initial }: { initial?: WheelScores | null }) {
  const [state, action] = useActionState(saveWheel, undefined);
  const [scores, setScores] = useState<WheelScores>(
    () => initial ?? (Object.fromEntries(WHEEL_AREAS.map((a) => [a.key, 5])) as WheelScores),
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-5">
      <div className="card space-y-5 p-5 lg:col-span-3 lg:p-7">
        <p className="text-sm leading-relaxed text-muted">
          Beri nilai <b className="text-heading">1–10</b> seberapa puas Anda dengan setiap area hidup saat ini. Jawab jujur, ini hanya untuk Anda.
        </p>
        {WHEEL_AREAS.map((a) => (
          <div key={a.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={a.key} className="text-[15px] font-semibold text-heading">
                {a.label}
              </label>
              <span className="grid h-8 w-10 shrink-0 place-items-center rounded-lg bg-gold-soft text-sm font-bold text-brand">{scores[a.key]}</span>
            </div>
            <p className="mb-2 text-xs text-muted">{HINT[a.key]}</p>
            <input
              id={a.key}
              name={a.key}
              type="range"
              min={1}
              max={10}
              step={1}
              value={scores[a.key]}
              onChange={(e) => setScores((s) => ({ ...s, [a.key]: Number(e.target.value) }))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-paper accent-brand"
            />
          </div>
        ))}
        <div>
          <label className="label" htmlFor="note">Catatan refleksi <span className="font-normal text-muted">(opsional)</span></label>
          <textarea id="note" name="note" rows={3} className="input resize-none" placeholder="Area mana yang ingin Anda tingkatkan bulan ini, dan mengapa?" />
        </div>
        <FormMessage state={state} />
        <SubmitButton className="btn-primary w-full sm:w-auto">Simpan penilaian</SubmitButton>
      </div>
      <aside className="lg:col-span-2">
        <div className="card flex flex-col items-center p-5 lg:sticky lg:top-10">
          <p className="eyebrow self-start">Pratinjau</p>
          <WheelChart scores={scores} size={300} />
        </div>
      </aside>
    </form>
  );
}
