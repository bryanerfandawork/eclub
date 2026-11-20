"use client";

import { useActionState } from "react";
import { saveTestimonial } from "@/app/actions/testimonials";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { Testimonial } from "@/lib/testimonials";

export function TestimonialForm({ t }: { t?: Testimonial }) {
  const [state, action] = useActionState(saveTestimonial, undefined);
  return (
    <form action={action} className="space-y-3">
      {t && <input type="hidden" name="id" value={t.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px]">
        <div>
          <label className="label">Nama</label>
          <input name="name" defaultValue={t?.name} className="input" required />
        </div>
        <div>
          <label className="label">Peran / profesi</label>
          <input name="role" defaultValue={t?.role ?? ""} className="input" placeholder="Pemilik usaha kuliner" />
        </div>
        <div>
          <label className="label">Urutan</label>
          <input name="sort" type="number" defaultValue={t?.sort ?? 0} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Isi testimoni (kata-kata asli member)</label>
        <textarea name="quote" defaultValue={t?.quote} rows={3} maxLength={600} className="input resize-y" required />
      </div>
      <div>
        <label className="label">Link foto <span className="font-normal text-muted">(opsional, https://…)</span></label>
        <input name="photo_url" defaultValue={t?.photo_url ?? ""} className="input" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-heading">
          <input type="checkbox" name="published" defaultChecked={t?.published ?? false} className="h-4 w-4 accent-[#8b2220]" />
          Tampilkan di halaman depan
        </label>
        <SubmitButton>{t ? "Simpan" : "Tambah testimoni"}</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
