"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { addDaily } from "@/app/actions/growth";
import { SubmitButton } from "../submit-button";

/**
 * Satu tombol: jadikan sesuatu (langkah mimpi, materi kelas) rencana aksi harian.
 * Menghubungkan Mimpi / Kelas → Laporan Harian tanpa perlu mengetik ulang.
 */
export function QuickPlan({ title, date, dreamId, label, compact }: { title: string; date: string; dreamId?: string | null; label: string; compact?: boolean }) {
  const [state, action] = useActionState(addDaily, undefined);
  if (state?.message)
    return (
      <Link href="/today" className={`inline-flex items-center gap-1.5 font-semibold text-success hover:underline ${compact ? "text-xs" : "text-sm"}`}>
        <CheckCircle2 className="h-4 w-4" /> Masuk ke rencana aksi · Lihat
      </Link>
    );
  return (
    <form action={action} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="title" value={title.slice(0, 160)} />
      <input type="hidden" name="date" value={date} />
      {dreamId && <input type="hidden" name="dream_id" value={dreamId} />}
      <SubmitButton
        className={compact ? "inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-gold-soft" : "btn-ghost"}
        pendingText="…"
      >
        <CalendarPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> {label}
      </SubmitButton>
      {state?.error && (
        <span className="max-w-xs text-xs text-danger">
          {state.error}{" "}
          {state.error.includes("Plus") && (
            <Link href="/paket" className="font-semibold text-brand underline">
              Lihat Plus
            </Link>
          )}
        </span>
      )}
    </form>
  );
}
