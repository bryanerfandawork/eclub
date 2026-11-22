"use client";

import { useActionState, useState } from "react";
import { adminDeleteUser, setUserPlan, setUserRole } from "@/app/actions/admin";
import { PlanBadge } from "@/components/plan-badge";
import { SubmitButton } from "@/components/submit-button";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  segment: string | null;
  role: string;
  plan: string;
  plan_expires_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  last_active?: string | null;
  whatsapp?: string | null;
  regency?: string | null;
  dreams_count: number;
};

/** "2 jam lalu", "5 hari lalu", dst. */
export function ago(iso: string | null | undefined) {
  if (!iso) return "belum pernah";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m <= 1 ? "baru saja" : `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo} bulan lalu` : `${Math.floor(mo / 12)} tahun lalu`;
}

const ROLES = [
  ["member", "Member"],
  ["mentor", "Mentor"],
  ["admin", "Admin"],
  ["super_admin", "Super Admin"],
] as const;

const d = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "–");

export function UserRow({ u, canSetRole }: { u: AdminUser; canSetRole: boolean }) {
  const [open, setOpen] = useState(false);
  const [planState, planAction] = useActionState(setUserPlan, undefined);
  const [roleState, roleAction] = useActionState(setUserRole, undefined);
  const [delState, delAction] = useActionState(adminDeleteUser, undefined);
  const days = u.last_active ? (Date.now() - new Date(u.last_active).getTime()) / 864e5 : Infinity;
  const dot = days < 3 ? "bg-success" : days < 14 ? "bg-gold" : "bg-line";
  const activePlus = u.plan === "plus" && (!u.plan_expires_at || new Date(u.plan_expires_at) > new Date());
  const msg = planState ?? roleState;

  return (
    <li className="py-3.5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 text-left">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-bold text-brand">
          {(u.full_name || u.email).slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-heading">{u.full_name || "(tanpa nama)"}</p>
          <p className="truncate text-xs text-muted">{u.email}</p>
        </div>
        <div className="hidden text-right text-xs text-muted sm:block">
          <p className="flex items-center justify-end gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} /> Aktif {ago(u.last_active)}
          </p>
          <p>Daftar {d(u.created_at)}</p>
        </div>
        {u.role !== "member" && <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">{ROLES.find((r) => r[0] === u.role)?.[1]}</span>}
        <PlanBadge plan={activePlus ? "plus" : "free"} />
      </button>

      {open && (
        <div className="mt-3 grid gap-3 rounded-xl bg-paper p-4 sm:grid-cols-2">
          <form action={planAction} className="space-y-2">
            <input type="hidden" name="id" value={u.id} />
            <p className="text-xs font-semibold text-muted uppercase">Paket</p>
            <div className="flex flex-wrap gap-2">
              <select name="plan" defaultValue={activePlus ? "plus" : "free"} className="input w-auto py-2 text-sm">
                <option value="free">Gratis</option>
                <option value="plus">Plus</option>
              </select>
              <select name="months" defaultValue="1" className="input w-auto py-2 text-sm">
                <option value="1">1 bulan</option>
                <option value="3">3 bulan</option>
                <option value="6">6 bulan</option>
                <option value="12">12 bulan</option>
                <option value="0">Tanpa batas waktu</option>
              </select>
              <SubmitButton className="btn-primary py-2" pendingText="…">Simpan</SubmitButton>
            </div>
            {activePlus && <p className="text-xs text-muted">Plus aktif {u.plan_expires_at ? `sampai ${d(u.plan_expires_at)}` : "tanpa batas waktu"}</p>}
          </form>
          {canSetRole && (
            <form action={roleAction} className="space-y-2">
              <input type="hidden" name="id" value={u.id} />
              <p className="text-xs font-semibold text-muted uppercase">Peran</p>
              <div className="flex flex-wrap gap-2">
                <select name="role" defaultValue={u.role} className="input w-auto py-2 text-sm">
                  {ROLES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <SubmitButton className="btn-ghost py-2" pendingText="…">Ubah peran</SubmitButton>
              </div>
            </form>
          )}
          {msg && (
            <p className={`text-xs font-medium sm:col-span-2 ${msg.error ? "text-danger" : "text-success"}`}>{msg.error ?? msg.message}</p>
          )}
          <p className="text-xs text-muted sm:col-span-2">
            Terakhir aktif: {ago(u.last_active)} · Daftar {d(u.created_at)} · {u.dreams_count} mimpi{u.whatsapp ? ` · WA ${u.whatsapp}` : ""}
          </p>
          {canSetRole && u.role !== "super_admin" && !delState?.message && (
            <details className="sm:col-span-2">
              <summary className="cursor-pointer text-xs font-semibold text-danger">Hapus akun ini</summary>
              <form action={delAction} className="mt-2 space-y-2 rounded-xl border border-danger/30 bg-white p-3">
                <input type="hidden" name="id" value={u.id} />
                <p className="text-xs leading-relaxed text-ink">
                  Akun dan <b>semua datanya</b> (profil, hasil tes, impian, keuangan, pesanan, dll.) dihapus permanen dan tidak bisa dikembalikan. Ketik <b>{u.email}</b> untuk konfirmasi.
                </p>
                <div className="flex flex-wrap gap-2">
                  <input name="confirm" autoComplete="off" placeholder={u.email} className="input flex-1 py-2 text-sm" />
                  <SubmitButton className="btn bg-danger py-2 text-white hover:brightness-95" pendingText="Menghapus…">Hapus permanen</SubmitButton>
                </div>
                {delState?.error && <p className="text-xs text-danger">{delState.error}</p>}
              </form>
            </details>
          )}
          {delState?.message && <p className="text-xs font-semibold text-success sm:col-span-2">{delState.message}</p>}
        </div>
      )}
    </li>
  );
}
