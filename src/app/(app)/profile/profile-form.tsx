"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { SEGMENTS, type Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="card space-y-5 p-5 lg:p-7">
      <div>
        <label className="label" htmlFor="full_name">Nama lengkap</label>
        <input id="full_name" name="full_name" className="input" defaultValue={profile.full_name ?? ""} maxLength={80} />
      </div>
      <div>
        <span className="label">Saat ini saya seorang…</span>
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="segment" value={s} defaultChecked={profile.segment === s} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div id="sukses" className="scroll-mt-24">
        <label className="label" htmlFor="success_definition">Bagi saya, sukses adalah…</label>
        <textarea
          id="success_definition"
          name="success_definition"
          rows={4}
          className="input resize-none"
          defaultValue={profile.success_definition ?? ""}
          placeholder="Tidak ada jawaban benar atau salah. Tuliskan dengan kata-kata Anda sendiri."
          maxLength={1000}
        />
        <p className="mt-1.5 text-xs text-muted">Setiap orang punya definisi sukses masing-masing. Ini titik awal perjalanan Anda.</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Simpan profil</SubmitButton>
    </form>
  );
}
