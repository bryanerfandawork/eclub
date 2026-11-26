import Link from "next/link";
import { CheckCircle2, Circle, MessageCircle } from "lucide-react";
import { setTaskStatus } from "@/app/actions/team";
import { PendingButton } from "@/components/pending-button";
import { daysBetween } from "@/lib/assistant";
import { tanggalPendek as tanggal } from "@/lib/format";
import type { TeamTask } from "@/lib/team";

/** Satu baris tugas tim: centang selesai, lanjut besok, dan buka detail (komentar). */
export function TaskRow({
  t,
  today,
  canAct,
  label,
  who,
  comments = 0,
}: {
  t: TeamTask;
  today: string;
  /** Boleh mencentang (penanggung jawab atau pemilik/admin). */
  canAct: boolean;
  /** Label kecil, mis. nama ruang kerja. */
  label?: string;
  /** Nama penanggung jawab (tampilan ruang kerja). */
  who?: string;
  comments?: number;
}) {
  const done = t.status === "done";
  const late = t.status === "open" && t.plan_date < today ? daysBetween(t.plan_date, today) : 0;
  const dueLate = t.status === "open" && t.due_date && t.due_date < today;
  const meta = [
    label && `🏢 ${label}`,
    who && `👤 ${who}`,
    t.plan_date > today && t.status === "open" && `mulai ${tanggal(t.plan_date)}`,
    t.due_date && `tenggat ${tanggal(t.due_date)}`,
    late > 0 && `tertunda ${late} hari`,
    t.followups > 0 && `dilanjutkan ${t.followups}x`,
  ].filter(Boolean);
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      {canAct && t.status !== "closed" ? (
        <form action={setTaskStatus} className="shrink-0">
          <input type="hidden" name="id" value={t.id} />
          <input type="hidden" name="to" value={done ? "open" : "done"} />
          <PendingButton className="grid h-9 w-9 place-items-center rounded-full" aria-label={done ? "Tandai belum" : "Tandai selesai"}>
            {done ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-line" strokeWidth={2.2} />}
          </PendingButton>
        </form>
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center">
          {done ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-line" strokeWidth={2.2} />}
        </span>
      )}
      <Link href={`/tim/${t.workspace_id}/tugas/${t.id}`} className="min-w-0 flex-1">
        <span className={`block text-[15px] ${done || t.status === "closed" ? "text-muted line-through" : "text-ink"}`}>{t.title}</span>
        {meta.length > 0 && <span className={`block text-xs ${dueLate ? "text-danger" : "text-muted"}`}>{meta.join(" · ")}</span>}
      </Link>
      {comments > 0 && (
        <Link href={`/tim/${t.workspace_id}/tugas/${t.id}`} className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand">
          <MessageCircle className="h-4 w-4" /> {comments}
        </Link>
      )}
      {canAct && t.status === "open" && t.plan_date <= today && (
        <form action={setTaskStatus}>
          <input type="hidden" name="id" value={t.id} />
          <input type="hidden" name="to" value="tomorrow" />
          <PendingButton className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">Lanjut besok</PendingButton>
        </form>
      )}
    </li>
  );
}
