"use client";

import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { requestPayout } from "@/app/actions/affiliate";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

export function ShareLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Aku lagi pakai EClub buat menata mimpi, keuangan pribadi & usaha, dan belajar bisnis step by step. Coba gratis lewat link ini ya: ${link}`;
  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl bg-white/10 p-1.5 pl-3.5">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{link.replace(/^https?:\/\//, "")}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(link).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="btn-gold shrink-0 px-3 py-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="btn mt-3 w-full bg-[#25D366] py-3 text-white hover:brightness-105">
        Bagikan ke WhatsApp
      </a>
    </div>
  );
}

export function PayoutForm({ available }: { available: number }) {
  const max = Math.floor(available / 100_000);
  const [state, action] = useActionState<FormState, FormData>(requestPayout, {});
  if (max < 1)
    return (
      <p className="rounded-xl bg-paper p-3.5 text-sm text-muted">
        Pencairan bisa diajukan setiap saldo siap cair mencapai kelipatan <b className="text-heading">Rp100.000</b>. Kurang {"Rp" + (100_000 - available).toLocaleString("id-ID")} lagi.
      </p>
    );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label">Jumlah dicairkan</label>
        <select name="amount" className="input" defaultValue={max * 100_000}>
          {Array.from({ length: Math.min(max, 50) }, (_, i) => (i + 1) * 100_000).map((v) => (
            <option key={v} value={v}>
              {"Rp" + v.toLocaleString("id-ID")}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="bank" required className="input" placeholder="Bank / e-wallet" />
        <input name="account" required inputMode="numeric" className="input" placeholder="No. rekening" />
        <input name="holder" required className="input" placeholder="Atas nama" />
      </div>
      <SubmitButton className="btn-primary w-full">Ajukan pencairan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
