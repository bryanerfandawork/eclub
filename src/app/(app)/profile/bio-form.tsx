"use client";

import { useActionState, useState } from "react";
import { updateBio } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PROVINCES, REGENCIES } from "@/lib/regions";

export type Bio = { birth_date: string | null; province: string | null; regency: string | null };

export function BioForm({ bio }: { bio: Bio }) {
  const [state, action] = useActionState(updateBio, undefined);
  const [prov, setProv] = useState(bio.province ?? "");
  const [reg, setReg] = useState(bio.regency ?? "");
  const regs = REGENCIES.filter((r) => r[1] === prov);
  return (
    <form action={action} id="data-diri" className="card mt-5 scroll-mt-24 space-y-4 p-5 lg:p-7">
      <div>
        <h2 className="font-bold text-heading">Data diri</h2>
        <p className="mt-0.5 text-xs text-muted">Untuk ucapan & hadiah ulang tahun, serta kabar event EClub di kota Anda.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="birth_date">Tanggal lahir</label>
          <input id="birth_date" type="date" name="birth_date" defaultValue={bio.birth_date ?? ""} max={new Date().toISOString().slice(0, 10)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="province">Provinsi</label>
          <select
            id="province"
            name="province"
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
          <select id="regency" name="regency" value={reg} onChange={(e) => setReg(e.target.value)} disabled={!prov} className="input disabled:opacity-50">
            <option value="">{prov ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
            {regs.map(([c, , n]) => (
              <option key={c} value={c}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Simpan data diri</SubmitButton>
    </form>
  );
}
