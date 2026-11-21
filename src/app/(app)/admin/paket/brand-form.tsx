"use client";

import { useActionState } from "react";
import { uploadBrandAsset } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

const SLOTS = [
  { kind: "light", title: "Logo untuk latar terang", hint: "Dipakai di menu aplikasi, halaman depan, halaman masuk/daftar. PNG/SVG transparan, warna marun.", bg: "bg-white" },
  { kind: "dark", title: "Logo untuk latar marun/gelap", hint: "Dipakai di panel marun halaman masuk dan header email. PNG/SVG transparan, warna putih.", bg: "bg-brand" },
  { kind: "icon", title: "Ikon aplikasi (persegi)", hint: "Ikon di layar HP, tab browser, dan notifikasi. PNG persegi 512×512 px.", bg: "bg-paper" },
] as const;

function Slot({ kind, title, hint, bg, current }: (typeof SLOTS)[number] & { current: string }) {
  const [state, action] = useActionState(uploadBrandAsset, undefined);
  return (
    <form action={action} className="rounded-2xl border border-line p-4">
      <input type="hidden" name="kind" value={kind} />
      <div className={`grid h-24 place-items-center rounded-xl ${bg} border border-line`}>
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className={kind === "icon" ? "h-16 w-16 rounded-xl object-contain" : "h-12 max-w-[80%] object-contain"} />
        ) : (
          <span className={`text-xs ${kind === "dark" ? "text-white/70" : "text-muted"}`}>Memakai logo bawaan</span>
        )}
      </div>
      <p className="mt-3 text-sm font-bold text-heading">{title}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
      <input type="file" name="file" accept={kind === "icon" ? "image/png,image/jpeg,image/webp" : "image/png,image/jpeg,image/webp,image/svg+xml"} className="mt-2 block w-full text-xs" />
      <FormMessage state={state} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SubmitButton className="btn-primary py-2 text-sm" pendingText="Mengunggah…">Unggah</SubmitButton>
        {current && (
          <button name="reset" value="1" className="text-xs font-medium text-muted hover:text-danger">
            Pakai bawaan
          </button>
        )}
      </div>
    </form>
  );
}

export function BrandForm({ logo, logoDark, icon }: { logo: string; logoDark: string; icon: string }) {
  const cur = { light: logo, dark: logoDark, icon };
  return (
    <section className="card mt-5 p-5 lg:p-6">
      <h2 className="font-bold text-heading">Logo EClub</h2>
      <p className="mt-1 text-sm text-muted">Logo yang diunggah langsung dipakai di semua halaman. Ikon di HP yang sudah memasang EClub akan berganti setelah aplikasi dibuka ulang (bisa beberapa hari di sebagian HP).</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {SLOTS.map((s) => (
          <Slot key={s.kind} {...s} current={cur[s.kind]} />
        ))}
      </div>
    </section>
  );
}
