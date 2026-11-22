"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { addDaily } from "@/app/actions/growth";
import { SubmitButton } from "./submit-button";
import { FormMessage } from "./ui";

type Opt = { id: string; title: string };

/** Form tambah rencana aksi: pilih pekerjaan (mimpi ikut otomatis) atau mimpi langsung. */
export function AddPlanForm({ date, works, dreams, left }: { date: string; works: Opt[]; dreams: Opt[]; left: number | null }) {
  const [state, action] = useActionState(addDaily, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="mt-4 space-y-2 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="date" value={date} />
      <div className="flex gap-2">
        <input name="title" className="input" placeholder="Tambah rencana aksi…" maxLength={160} required />
        <SubmitButton className="btn-primary shrink-0 px-3" pendingText="">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Tambah</span>
        </SubmitButton>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {works.length > 0 ? (
          <select name="work_id" className="input text-sm" defaultValue={works[0].id}>
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                Bagian dari: {w.title}
              </option>
            ))}
            <option value="">Lainnya (tanpa pekerjaan)</option>
          </select>
        ) : (
          <Link href="/rutinitas" className="input flex items-center text-sm text-muted">
            + Buat daftar pekerjaan dulu
          </Link>
        )}
        {dreams.length > 0 && (
          <select name="dream_id" className="input text-sm text-muted" defaultValue="">
            <option value="">Mimpi: ikut pekerjaan</option>
            {dreams.map((d) => (
              <option key={d.id} value={d.id}>
                Mimpi: {d.title}
              </option>
            ))}
          </select>
        )}
      </div>
      {left !== null && (
        <p className="text-xs text-muted">
          {left > 0 ? `Paket gratis: sisa ${left} rencana baru hari ini. ` : "Jatah rencana baru hari ini sudah habis. "}
          <Link href="/paket" className="font-semibold text-brand">
            Plus tanpa batas ›
          </Link>
        </p>
      )}
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}
