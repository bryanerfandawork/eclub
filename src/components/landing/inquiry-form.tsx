"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/app/actions/collab";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/app/actions/auth";

export function InquiryForm() {
  const [state, action] = useActionState<FormState, FormData>(submitInquiry, {});
  if (state?.message) return <div className="rounded-2xl bg-success/10 p-6 text-center font-semibold text-success">{state.message}</div>;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <select name="kind" className="input sm:col-span-2" defaultValue="inhouse">
        <option value="inhouse">In-house training untuk tim / karyawan</option>
        <option value="workshop">Workshop atau seminar untuk komunitas</option>
        <option value="speaker">Undang pembicara EClub</option>
        <option value="partner">Kemitraan / sponsor / kolaborasi program</option>
        <option value="lainnya">Lainnya</option>
      </select>
      <input name="name" required className="input" placeholder="Nama Anda" />
      <input name="organization" className="input" placeholder="Perusahaan / komunitas / instansi" />
      <input name="whatsapp" required inputMode="tel" className="input" placeholder="No. WhatsApp" />
      <div className="grid grid-cols-2 gap-3">
        <input name="participants" inputMode="numeric" className="input" placeholder="Jumlah peserta" />
        <input name="city" className="input" placeholder="Kota" />
      </div>
      <textarea name="message" rows={3} className="input sm:col-span-2" placeholder="Ceritakan kebutuhan atau tantangan tim Anda (opsional)" />
      {state?.error && <p className="text-sm text-danger sm:col-span-2">{state.error}</p>}
      <SubmitButton className="btn-primary py-3 sm:col-span-2" pendingText="Mengirim…">
        Kirim permintaan
      </SubmitButton>
    </form>
  );
}
