"use client";

import { useActionState } from "react";
import { adminSaveAssistant } from "@/app/actions/admin";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";
import type { Highlight } from "@/lib/assistant-config";
import { PROVIDERS } from "@/lib/pockets";

export function AssistantForm({ teaser, workIdeas, habitIdeas, highlights }: { teaser: string[]; workIdeas: string[]; habitIdeas: [string, string][]; highlights: Highlight[] }) {
  const [state, action] = useActionState<FormState, FormData>(adminSaveAssistant, {});
  return (
    <form action={action} className="card mb-6 space-y-5 p-5 lg:p-6">
      <div>
        <h2 className="font-bold text-heading">Asisten harian, keuangan & halaman depan</h2>
        <p className="mt-0.5 text-sm text-muted">Batas paket (rencana aksi per hari, jumlah kantong) diatur di tabel fitur di bawah.</p>
      </div>
      <div>
        <p className="label">Kantong contoh yang tampil terkunci untuk member gratis</p>
        <p className="mb-2 text-xs text-muted">Dipencet → muncul ajakan upgrade ke Plus.</p>
        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input type="checkbox" name="pocket_teaser" value={p.key} defaultChecked={teaser.includes(p.key)} className="sr-only" />
              <PocketBadge type={p.type} provider={p.key} size={24} /> {p.label}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="label">Contoh pekerjaan (satu per baris)</span>
          <textarea name="work_ideas" rows={8} defaultValue={workIdeas.join("\n")} className="input mt-1 font-mono text-sm" />
        </label>
        <label className="block">
          <span className="label">Ide kebiasaan (emoji spasi nama, satu per baris)</span>
          <textarea name="habit_ideas" rows={8} defaultValue={habitIdeas.map(([e, n]) => `${e} ${n}`).join("\n")} className="input mt-1 font-mono text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="label">Sorotan fitur di halaman depan (emoji | judul | deskripsi, satu per baris)</span>
        <textarea name="landing_highlights" rows={6} defaultValue={highlights.map((h) => `${h.emoji} | ${h.title} | ${h.desc}`).join("\n")} className="input mt-1 text-sm" />
      </label>
      <SubmitButton className="btn-primary">Simpan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
