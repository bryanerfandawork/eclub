"use client";

import { useActionState } from "react";
import { MessageCircle } from "lucide-react";
import { updateWhatsApp } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export type WaSettings = { whatsapp: string | null; wa_opt_in: boolean; wa_daily: boolean };

export function WhatsAppForm({ s }: { s: WaSettings }) {
  const [state, action] = useActionState(updateWhatsApp, undefined);
  return (
    <form action={action} className="card mt-5 space-y-4 p-5 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/10 text-success">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold text-heading">Notifikasi WhatsApp</p>
          <p className="text-xs text-muted">Pengingat aksi harian, tes ulang 3 bulan, dan konfirmasi pembayaran. Maksimal 1 pengingat per hari.</p>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="whatsapp">Nomor WhatsApp</label>
        <input id="whatsapp" name="whatsapp" inputMode="tel" className="input" defaultValue={s.whatsapp ? "0" + s.whatsapp.slice(2) : ""} placeholder="081234567890" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-heading">
        <input type="checkbox" name="wa_opt_in" defaultChecked={s.wa_opt_in} className="h-4 w-4 accent-[#8b2220]" />
        Ya, kirimi saya notifikasi lewat WhatsApp
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="wa_daily" defaultChecked={s.wa_daily} className="h-4 w-4 accent-[#8b2220]" />
        Termasuk pengingat aksi harian setiap pagi
      </label>
      <FormMessage state={state} />
      <SubmitButton>Simpan pengaturan WhatsApp</SubmitButton>
    </form>
  );
}
