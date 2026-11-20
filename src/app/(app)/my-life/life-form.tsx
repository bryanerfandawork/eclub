"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { saveLifePlan } from "@/app/actions/life";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { VALUE_OPTIONS, WHEEL_AREAS, type LifePlan } from "@/lib/types";

function Step({ no, title, desc, children }: { no: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand text-sm font-bold text-white">{no}</span>
        <h2 className="text-lg font-bold text-heading">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted">{desc}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function LifeForm({ plan, successDefinition }: { plan: LifePlan | null; successDefinition: string | null }) {
  const [state, action] = useActionState(saveLifePlan, undefined);
  const [values, setValues] = useState<string[]>(plan?.core_values ?? []);
  const [priorities, setPriorities] = useState<string[]>(plan?.priorities ?? []);

  const toggleValue = (v: string) =>
    setValues((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : cur.length < 5 ? [...cur, v] : cur));
  const togglePriority = (k: string) =>
    setPriorities((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : cur.length < 3 ? [...cur, k] : cur));
  const move = (i: number, d: number) =>
    setPriorities((cur) => {
      const n = [...cur];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const label = (k: string) => WHEEL_AREAS.find((a) => a.key === k)?.label ?? k;

  return (
    <form action={action} className="space-y-5">
      <Step no="1" title="Definisi sukses" desc="Bagi Anda, sukses itu seperti apa? Tidak ada jawaban benar atau salah.">
        <textarea
          name="success_definition"
          rows={4}
          defaultValue={successDefinition ?? ""}
          maxLength={1000}
          className="input resize-none"
          placeholder="Contoh: Sukses bagi saya adalah hidup tenang bersama keluarga, sehat, dan usaha saya memberi manfaat bagi orang lain."
        />
      </Step>

      <Step no="2" title="Nilai pribadi" desc="Pilih 5 nilai yang paling penting dan ingin Anda pegang dalam setiap keputusan.">
        <div className="flex flex-wrap gap-2">
          {VALUE_OPTIONS.map((v) => {
            const on = values.includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleValue(v)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"
                } ${!on && values.length >= 5 ? "opacity-40" : ""}`}
              >
                {v}
              </button>
            );
          })}
        </div>
        {values.map((v) => (
          <input key={v} type="hidden" name="core_values" value={v} />
        ))}
        <p className="mt-3 text-xs font-medium text-muted">{values.length}/5 dipilih</p>
      </Step>

      <Step no="3" title="Visi hidup" desc="Bayangkan diri Anda 10 tahun lagi. Anda sedang apa, bersama siapa, dan memberi dampak apa?">
        <textarea
          name="vision"
          rows={5}
          defaultValue={plan?.vision ?? ""}
          maxLength={2000}
          className="input resize-none"
          placeholder="Sepuluh tahun lagi, saya…"
        />
      </Step>

      <Step no="4" title="Prioritas hidup" desc="Pilih 3 area yang paling ingin Anda fokuskan saat ini, lalu urutkan.">
        <div className="flex flex-wrap gap-2">
          {WHEEL_AREAS.map((a) => {
            const on = priorities.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => togglePriority(a.key)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"
                } ${!on && priorities.length >= 3 ? "opacity-40" : ""}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        {priorities.length > 0 && (
          <ol className="mt-4 space-y-2">
            {priorities.map((k, i) => (
              <li key={k} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-soft text-sm font-bold text-brand">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-heading">{label(k)}</span>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-muted hover:bg-white disabled:opacity-30" aria-label="Naikkan">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" disabled={i === priorities.length - 1} onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-muted hover:bg-white disabled:opacity-30" aria-label="Turunkan">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => togglePriority(k)} className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-danger" aria-label="Hapus">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
        <input type="hidden" name="priorities" value={priorities.join(",")} />
      </Step>

      <FormMessage state={state} />
      <div>
        <SubmitButton className="btn-primary w-full py-3 sm:w-auto sm:px-8">Simpan & lihat dokumen</SubmitButton>
      </div>
    </form>
  );
}
