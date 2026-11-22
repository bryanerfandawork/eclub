"use client";

import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { changeRefCode, requestPayout } from "@/app/actions/affiliate";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

export function ShareLink({ link, code, discount }: { link: string; code: string; discount: number }) {
  const [copied, setCopied] = useState(false);
  const text = `Aku lagi pakai EClub buat menata mimpi, keuangan pribadi & usaha, dan belajar bisnis step by step. Coba gratis lewat link ini ya: ${link}\n\nKalau mau upgrade, pakai kode kupon *${code}* biar hemat ${discount}%.`;
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

export type ShareOption = { group: string; label: string; url: string; text: string };

/** Pilih apa yang mau dibagikan (beranda, kelas tertentu, event, artikel), lalu salin/kirim link-nya. */
export function LinkPicker({ options }: { options: ShareOption[] }) {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const o = options[i];
  if (!o) return null;
  const groups = [...new Set(options.map((x) => x.group))];
  return (
    <div>
      <select value={i} onChange={(e) => setI(Number(e.target.value))} className="input w-full min-w-0 truncate">
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {options.map((x, k) =>
              x.group === g ? (
                <option key={k} value={k}>
                  {x.label}
                </option>
              ) : null,
            )}
          </optgroup>
        ))}
      </select>
      <p className="mt-2 truncate rounded-lg bg-paper px-3 py-2 font-mono text-xs text-muted">{o.url.replace(/^https?:\/\//, "")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(o.url).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="btn-primary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Link tersalin" : "Salin link"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`${o.text}\n${o.url}`)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95">
          Kirim ke WhatsApp
        </a>
      </div>
    </div>
  );
}

export function ChangeCodeForm({ current }: { current: string }) {
  const [state, action] = useActionState<FormState, FormData>(changeRefCode, {});
  const [open, setOpen] = useState(false);
  if (state?.message) return <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success">{state?.message}</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 text-sm font-semibold text-brand hover:underline">
        ✏️ Ganti kode (1 kali)
      </button>
    );
  return (
    <form action={action} className="mt-3 space-y-2 rounded-xl bg-paper p-3">
      <p className="text-xs text-muted">Pilih kode yang mudah diingat, misal nama usaha Anda. Hanya bisa diganti satu kali dan selama kode lama belum pernah dipakai teman.</p>
      <div className="flex gap-2">
        <input name="code" className="input uppercase" placeholder={current} maxLength={15} minLength={4} pattern="[A-Za-z0-9]{4,15}" required />
        <SubmitButton className="btn-primary shrink-0" pendingText="…">
          Simpan
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
