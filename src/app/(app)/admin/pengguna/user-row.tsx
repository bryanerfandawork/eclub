"use client";

import { useActionState, useState } from "react";
import { setUserPlan, setUserRole } from "@/app/actions/admin";
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
  dreams_count: number;
};

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
          <p>Daftar {d(u.created_at)}</p>
          <p>{u.dreams_count} mimpi</p>
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
            Segmen: {u.segment || "–"} · Terakhir masuk: {d(u.last_sign_in_at)}
          </p>
        </div>
      )}
    </li>
  );
}
