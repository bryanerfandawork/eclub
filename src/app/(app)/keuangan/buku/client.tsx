"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createBook, inviteToBook, setBookMember, updateBook } from "@/app/actions/finance-books";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";
import type { Book, BookKind, BookRole } from "@/lib/finance";
import type { Pocket } from "@/lib/pockets";

function Access({ pockets, role, setRole, init }: { pockets: Pocket[]; role: BookRole; setRole: (r: BookRole) => void; init?: string[] | null }) {
  const [scope, setScope] = useState<"all" | "some">(init ? "some" : "all");
  return (
    <>
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="scope" value={scope} />
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1">
        {(
          [
            ["manager", "👫 Pengelola", "Lihat & catat semua"],
            ["recorder", "🧾 Pencatat", "Catat di kantong tertentu"],
          ] as const
        ).map(([r, l, d]) => (
          <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-xl px-2 py-2 text-left text-xs transition ${role === r ? "bg-brand text-white" : "text-ink hover:bg-paper"}`}>
            <b className="block text-sm">{l}</b>
            <span className={role === r ? "text-white/70" : "text-muted"}>{d}</span>
          </button>
        ))}
      </div>
      {role === "recorder" && (
        <div className="space-y-2">
          <div className="flex gap-2 text-sm">
            {(
              [
                ["all", "Semua kantong"],
                ["some", "Kantong tertentu"],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setScope(v)} className={`rounded-full border px-3 py-1 font-semibold ${scope === v ? "border-brand bg-brand/5 text-heading" : "border-line text-muted"}`}>
                {l}
              </button>
            ))}
          </div>
          {scope === "some" && (
            <div className="flex flex-wrap gap-2">
              {pockets.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white py-1 pr-3 pl-1 text-xs font-semibold has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input type="checkbox" name="pockets" value={p.id} defaultChecked={init?.includes(p.id)} className="sr-only" />
                  <PocketBadge type={p.type} provider={p.provider} size={22} /> {p.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function InviteForm({ bookId, kind, pockets }: { bookId: string; kind: BookKind; pockets: Pocket[] }) {
  const [state, action] = useActionState<FormState, FormData>(inviteToBook, {});
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<BookRole>(kind === "family" ? "manager" : "recorder");
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-brand hover:border-gold">
        + {kind === "family" ? "Ajak pasangan / anggota keluarga" : "Ajak partner atau staf keuangan"}
      </button>
    );
  return (
    <form action={action} className="mt-3 space-y-3 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="book_id" value={bookId} />
      <label className="block">
        <span className="text-xs font-medium text-muted">Username EClub-nya</span>
        <input name="username" className="input mt-1" placeholder="misal: budisantoso" autoComplete="off" />
      </label>
      <p className="text-[11px] text-muted">Belum punya akun? Minta dia daftar gratis di eclub.co.id, lalu lihat username-nya di menu Profil.</p>
      <Access pockets={pockets} role={role} setRole={setRole} />
      <SubmitButton className="btn-primary w-full">Kirim undangan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function MemberAccess({ bookId, person, pockets }: { bookId: string; person: { user_id: string; role: BookRole; pocket_ids: string[] | null }; pockets: Pocket[] }) {
  const [state, action] = useActionState<FormState, FormData>(setBookMember, {});
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<BookRole>(person.role === "owner" ? "manager" : person.role);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1 text-xs font-semibold text-brand">
        Ubah akses
      </button>
    );
  return (
    <form action={action} className="mt-2 space-y-3 rounded-2xl bg-paper p-3">
      <input type="hidden" name="book_id" value={bookId} />
      <input type="hidden" name="user_id" value={person.user_id} />
      <Access pockets={pockets} role={role} setRole={setRole} init={person.pocket_ids} />
      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">Simpan</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Tutup
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function BookSettings({ book, workspaces }: { book: Book; workspaces: { id: string; name: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(updateBook, {});
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 text-xs font-semibold text-muted hover:text-heading">
        ⚙️ Ganti nama{book.kind === "business" ? " / hubungkan ke Ruang Kerja" : ""}
      </button>
    );
  return (
    <form action={action} className="mt-3 space-y-3 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="id" value={book.id} />
      <input name="name" defaultValue={book.name} maxLength={40} className="input" />
      {book.kind === "business" && (
        <label className="block">
          <span className="text-xs font-medium text-muted">Ruang Kerja perusahaan (opsional)</span>
          <select name="workspace_id" defaultValue={book.workspace_id ?? ""} className="input mt-1">
            <option value="">Tidak dihubungkan</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {workspaces.length === 0 && (
            <span className="mt-1 block text-[11px] text-muted">
              Belum punya Ruang Kerja perusahaan. <Link href="/tim" className="font-semibold text-brand">Buat di menu Tim ›</Link>
            </span>
          )}
        </label>
      )}
      <SubmitButton className="btn-primary w-full">Simpan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function NewBookForm({ plus, ownBiz }: { plus: boolean; ownBiz: number }) {
  const [state, action] = useActionState<FormState, FormData>(createBook, {});
  const [kind, setKind] = useState<BookKind>("business");
  const locked = !plus && (kind === "family" || ownBiz >= 1);
  return (
    <section className="card p-5">
      <h2 className="font-bold text-heading">+ Tambah buku</h2>
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="kind" value={kind} />
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-paper p-1">
          {(
            [
              ["business", "🏪 Usaha lain"],
              ["family", "👨‍👩‍👧 Keluarga"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-xl py-2 text-sm font-semibold transition ${kind === k ? "bg-white text-heading shadow-soft" : "text-muted"}`}>
              {l}
            </button>
          ))}
        </div>
        {locked ? (
          <div className="rounded-xl bg-gold-soft/60 p-3 text-sm text-heading">
            {kind === "family" ? "Keuangan keluarga bersama pasangan khusus member Plus." : "Paket gratis punya 1 usaha. Dengan Plus, catat semua usaha Anda terpisah, masing-masing dengan laba ruginya."}{" "}
            <Link href="/paket" className="font-semibold text-brand">
              Lihat Plus ›
            </Link>
          </div>
        ) : (
          <>
            <input name="name" maxLength={40} className="input" placeholder={kind === "family" ? "Misal: Keluarga Santoso" : "Misal: Toko Kue Bunda"} />
            <SubmitButton className="btn-primary w-full">Buat buku</SubmitButton>
          </>
        )}
        <FormMessage state={state} />
      </form>
    </section>
  );
}
