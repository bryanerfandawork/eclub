"use client";

import { useActionState } from "react";
import { testWhatsapp } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export function WaStatus({ env }: { env: { label: string; ok: boolean }[] }) {
  const [state, action] = useActionState(testWhatsapp, undefined);
  const allOk = env.every((e) => e.ok);
  return (
    <section className="card mb-5 p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-heading">Koneksi WhatsApp (Fonnte)</h2>
          <p className="mt-1 text-xs text-muted">{allOk ? "Semua kunci sudah terpasang." : "Ada kunci yang belum diisi di Vercel > Settings > Environment Variables."}</p>
        </div>
        <form action={action}>
          <SubmitButton className="btn-ghost" pendingText="Mengirim…">
            Kirim pesan uji
          </SubmitButton>
        </form>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {env.map((e) => (
          <li key={e.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${e.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
            {e.ok ? "✓" : "✗"} {e.label}
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <FormMessage state={state} />
      </div>
    </section>
  );
}
