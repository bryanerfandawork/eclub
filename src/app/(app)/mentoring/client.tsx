"use client";

import { useActionState, useState } from "react";
import { bookMentoring, registerEvent } from "@/app/actions/schedule";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

type SlotLite = { id: string; time: string; price: number; topic: string; duration: number };

export function SlotPicker({ days, plus }: { days: { day: string; label: string; slots: SlotLite[] }[]; plus: boolean }) {
  const [day, setDay] = useState(days[0]?.day);
  const [slot, setSlot] = useState<SlotLite | null>(null);
  const [state, action] = useActionState<FormState, FormData>(bookMentoring, {});
  const current = days.find((d) => d.day === day);
  const rp = (n: number) => (n > 0 ? "Rp" + n.toLocaleString("id-ID") : "Gratis");
  if (state?.message) return <p className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">{state.message} Detailnya ada di “Sesi saya” di atas.</p>;
  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => {
              setDay(d.day);
              setSlot(null);
            }}
            className={`shrink-0 rounded-2xl border px-4 py-2.5 text-center text-sm transition ${day === d.day ? "border-brand bg-brand text-white" : "border-line bg-white hover:bg-paper"}`}
          >
            <span className="block font-semibold capitalize">{d.label}</span>
            <span className={`text-xs ${day === d.day ? "text-white/70" : "text-muted"}`}>{d.slots.length} slot</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {current?.slots.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSlot(s)}
            className={`rounded-xl border px-2 py-3 text-center transition ${slot?.id === s.id ? "border-brand bg-brand/5 ring-2 ring-brand/20" : "border-line hover:bg-paper"}`}
          >
            <span className="block font-bold text-heading">{s.time}</span>
            <span className="text-[11px] text-muted">{s.duration} menit</span>
          </button>
        ))}
      </div>
      {slot && (
        <form action={action} className="mt-5 space-y-3 rounded-2xl bg-paper p-4">
          <input type="hidden" name="slot" value={slot.id} />
          <p className="text-sm">
            <b className="text-heading">{slot.topic}</b> · {slot.time} WIB · <b className="text-brand">{rp(slot.price)}</b>
            {plus && <span className="ml-1 text-xs text-muted">(harga member Plus)</span>}
          </p>
          <div>
            <label className="label">Apa yang ingin Anda bahas?</label>
            <textarea name="goal" required rows={3} className="input" placeholder="Misal: penjualan turun 3 bulan terakhir, ingin strategi promosi yang pas untuk usaha kue saya." />
          </div>
          <SubmitButton className="btn-primary w-full py-3" pendingText="Memesan…">
            {slot.price > 0 ? `Pesan & bayar ${rp(slot.price)}` : "Konfirmasi jadwal"}
          </SubmitButton>
          <FormMessage state={state} />
        </form>
      )}
    </div>
  );
}

export function RegisterButton({ id, label, className }: { id: string; label: string; className?: string }) {
  const [state, action] = useActionState<FormState, FormData>(registerEvent, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="event" value={id} />
      <SubmitButton className={className ?? "btn-primary w-full"} pendingText="Mendaftar…">
        {label}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
