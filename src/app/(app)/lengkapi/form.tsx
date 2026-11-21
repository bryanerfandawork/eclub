"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, skipOnboarding } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PROVINCES, REGENCIES } from "@/lib/regions";

type Init = { whatsapp: string; birth_date: string; province: string; regency: string };

export function OnboardingForm({ init, next }: { init: Init; next: string }) {
  const [state, action] = useActionState(completeOnboarding, undefined);
  const [prov, setProv] = useState(init.province);
  const [reg, setReg] = useState(init.regency);
  const regs = REGENCIES.filter((r) => r[1] === prov);
  return (
    <>
      <form action={action} className="card mt-6 space-y-4 p-5 lg:p-7">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="whatsapp">Nomor WhatsApp</label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" required defaultValue={init.whatsapp} placeholder="081234567890" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="birth_date">Tanggal lahir</label>
          <input id="birth_date" name="birth_date" type="date" required defaultValue={init.birth_date} min="1920-01-01" max={new Date().toISOString().slice(0, 10)} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="province">Provinsi</label>
            <select
              id="province"
              name="province"
              required
              value={prov}
              onChange={(e) => {
                setProv(e.target.value);
                setReg("");
              }}
              className="input"
            >
              <option value="">Pilih provinsi</option>
              {PROVINCES.map(([c, n]) => (
                <option key={c} value={c}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="regency">Kota / kabupaten</label>
            <select id="regency" name="regency" required value={reg} onChange={(e) => setReg(e.target.value)} disabled={!prov} className="input disabled:opacity-50">
              <option value="">{prov ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
              {regs.map(([c, , n]) => (
                <option key={c} value={c}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink">
          <input type="checkbox" name="wa_opt_in" defaultChecked className="mt-0.5 h-4 w-4 accent-[#8b2220]" />
          <span>Kirimi saya penyemangat pagi dan pengingat lewat WhatsApp. Bisa dimatikan kapan saja di Profil.</span>
        </label>
        <FormMessage state={state} />
        <SubmitButton className="btn-primary w-full py-3">{next === "/posisi" ? "Simpan & lanjut cek posisi" : "Simpan"}</SubmitButton>
      </form>
      <form action={skipOnboarding} className="mt-3 text-center">
        <input type="hidden" name="next" value={next} />
        <button className="text-sm font-medium text-muted hover:text-brand">Lewati dulu</button>
      </form>
    </>
  );
}
