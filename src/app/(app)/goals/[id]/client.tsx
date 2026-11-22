"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { addAction, setDreamTarget, updateSaved } from "@/app/actions/dreams";
import { MoneyInput } from "@/components/money-input";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export function AddActionForm({ dreamId }: { dreamId: string }) {
  const [state, action] = useActionState(addAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="mt-4 space-y-2">
      <input type="hidden" name="dream_id" value={dreamId} />
      <div className="flex gap-2">
        <input name="title" className="input" placeholder="Tambah langkah aksi…" maxLength={160} required />
        <SubmitButton className="btn-primary shrink-0 px-3" pendingText="">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Tambah</span>
        </SubmitButton>
      </div>
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}

export function AddSavingForm({ dreamId }: { dreamId: string }) {
  const [state, action] = useActionState(updateSaved, undefined);
  return (
    <form action={action} className="mt-4 space-y-2" key={state?.message}>
      <input type="hidden" name="id" value={dreamId} />
      <div className="flex gap-2">
        <div className="flex-1">
          <MoneyInput name="amount" placeholder="Tambah tabungan" />
        </div>
        <SubmitButton className="btn-gold shrink-0" pendingText="">
          Catat
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function SetTargetForm({ dreamId, amount, date }: { dreamId: string; amount: number | null; date: string | null }) {
  const [state, action] = useActionState(setDreamTarget, undefined);
  return (
    <form id="target" action={action} className="card scroll-mt-20 space-y-3 p-5">
      <p className="font-bold text-heading">Beri angka & tanggal pada mimpi ini</p>
      <p className="text-sm text-muted">Dengan angka dan tanggal, EClub bisa menghitung berapa yang perlu disisihkan per bulan dan per hari. Taksiran saja sudah cukup.</p>
      <input type="hidden" name="id" value={dreamId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Perkiraan dana</label>
          <MoneyInput name="target_amount" defaultValue={amount ?? 0} placeholder="60.000.000" />
        </div>
        <div>
          <label className="label">Target tercapai</label>
          <input type="date" name="target_date" defaultValue={date ?? ""} className="input" />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full">Simpan target</SubmitButton>
    </form>
  );
}
