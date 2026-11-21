"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(t);
  }, [active, router]);
  return null;
}

export function CopyButton({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-heading hover:bg-paper"
    >
      {ok ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} {ok ? "Tersalin" : "Salin"}
    </button>
  );
}

export function SaveWaForm({ orderId, action }: { orderId: string; action: (s: { error?: string; message?: string } | undefined, f: FormData) => Promise<{ error?: string; message?: string } | undefined> }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  if (state?.message) return <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{state.message}</p>;
  return (
    <form action={formAction} className="rounded-xl border border-line p-4">
      <p className="text-sm font-semibold text-heading">Dapatkan info pembayaran lewat WhatsApp</p>
      <p className="mt-0.5 text-xs text-muted">Supaya Anda tidak kehilangan jejak: instruksi bayar, konfirmasi lunas, dan pengingat.</p>
      <input type="hidden" name="order_id" value={orderId} />
      <div className="mt-3 flex gap-2">
        <input name="whatsapp" inputMode="tel" placeholder="081234567890" className="input flex-1" required />
        <button disabled={pending} className="btn-primary shrink-0">{pending ? "…" : "Simpan"}</button>
      </div>
      {state?.error && <p className="mt-2 text-xs text-danger">{state.error}</p>}
    </form>
  );
}

export function CouponForm({ orderId, action, suggested }: { orderId: string; action: (s: { error?: string; message?: string } | undefined, fd: FormData) => Promise<{ error?: string; message?: string } | undefined>; suggested?: string }) {
  const [state, run] = useActionState(action, undefined);
  const [open, setOpen] = useState(!!suggested);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-brand/80 hover:text-brand">
        🎟️ Punya kode kupon?
      </button>
    );
  return (
    <form action={run} className="rounded-xl bg-gold-soft/60 p-3.5">
      <input type="hidden" name="order" value={orderId} />
      <p className="mb-2 text-xs font-semibold text-heading">{suggested ? "🎟️ Kode kupon dari teman Anda sudah terisi" : "🎟️ Kode kupon member Plus"}</p>
      <div className="flex gap-2">
        <input name="code" defaultValue={suggested} className="input flex-1 uppercase" placeholder="Misal: BUDIEC123" />
        <button className="btn-primary shrink-0">Pakai</button>
      </div>
      {state?.error && <p className="mt-2 text-xs text-danger">{state.error}</p>}
    </form>
  );
}
