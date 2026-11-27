"use client";

import { useActionState, useState } from "react";
import { addPocket, updatePocket } from "@/app/actions/finance";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";
import { PROVIDERS, TYPE_INFO, type Pocket, type PocketType } from "@/lib/pockets";

function Fields({ init }: { init?: Pick<Pocket, "name" | "type" | "provider"> }) {
  const [type, setType] = useState<PocketType>(init?.type ?? "cash");
  const [provider, setProvider] = useState(init?.provider ?? "");
  const [name, setName] = useState(init?.name ?? "");
  const list = PROVIDERS.filter((p) => p.type === type);
  return (
    <>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="provider" value={type === "bank" || type === "ewallet" ? provider : ""} />
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1">
        {(Object.keys(TYPE_INFO) as PocketType[]).map((t) => (
          <button key={t} type="button" onClick={() => { setType(t); setProvider(""); }} className={`rounded-xl px-1 py-2 text-[11px] font-semibold transition ${type === t ? "bg-brand text-white" : "text-muted hover:bg-paper"}`}>
            <span className="block text-base">{TYPE_INFO[t].emoji}</span>
            {TYPE_INFO[t].label}
          </button>
        ))}
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setProvider(p.key);
                if (!name || PROVIDERS.some((x) => x.label === name)) setName(p.label);
              }}
              className={`flex items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-1 text-xs font-semibold ${provider === p.key ? "border-brand bg-brand/5" : "border-line bg-white"}`}
            >
              <PocketBadge type={p.type} provider={p.key} size={22} /> {p.label}
            </button>
          ))}
        </div>
      )}
      <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={40} placeholder={type === "cash" ? "Misal: Dompet, Kas toko" : type === "bank" ? "Misal: BCA tabungan" : "Nama kantong"} />
    </>
  );
}

export function AddPocketForm({ wallet, bookId, locked }: { wallet: "personal" | "business"; bookId?: string; locked: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(addPocket, {});
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-muted hover:border-gold hover:text-heading">
        + Tambah kantong
      </button>
    );
  if (locked)
    return (
      <div className="mt-3 rounded-xl bg-gold-soft/60 p-3 text-sm text-heading">
        {locked}{" "}
        <a href="/paket" className="font-semibold text-brand">
          Lihat Plus ›
        </a>
      </div>
    );
  return (
    <form
      key={n}
      action={async (fd) => {
        await action(fd);
        setN((x) => x + 1);
      }}
      className="mt-3 space-y-3 rounded-2xl bg-paper p-3.5"
    >
      <input type="hidden" name="wallet" value={wallet} />
      {bookId && <input type="hidden" name="book_id" value={bookId} />}
      <Fields />
      <SubmitButton className="btn-primary w-full">Simpan kantong</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function EditPocket({ p }: { p: Pocket }) {
  const [state, action] = useActionState<FormState, FormData>(updatePocket, {});
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-paper">
        Ubah
      </button>
    );
  return (
    <form action={action} className="mt-2 w-full space-y-3 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="id" value={p.id} />
      <Fields init={p} />
      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">Simpan</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Batal
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
