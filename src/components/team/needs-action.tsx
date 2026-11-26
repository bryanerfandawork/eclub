import Link from "next/link";
import { AlertTriangle, CheckCircle2, CalendarClock, X } from "lucide-react";
import { rescheduleTask, setTaskStatus } from "@/app/actions/team";
import { PendingButton } from "@/components/pending-button";
import { daysBetween } from "@/lib/assistant";
import { tanggalPendek } from "@/lib/format";
import type { TeamTask } from "@/lib/team";

type Item = TeamTask & { who: string; ws_name?: string };

/** Daftar merah untuk pemilik/admin: tugas terlambat yang perlu diputuskan (selesai, jadwal ulang, atau batal). */
export function NeedsAction({ items, today, tomorrow, showWs = false, title = "Perlu tindakan" }: { items: Item[]; today: string; tomorrow: string; showWs?: boolean; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="card border-danger/40 p-5 lg:p-6">
      <h2 className="flex items-center gap-2 font-bold text-danger">
        <AlertTriangle className="h-5 w-5" /> {title} ({items.length})
      </h2>
      <p className="mt-0.5 text-xs text-muted">Jadwal atau tenggatnya sudah lewat tapi belum selesai. Putuskan: sudah selesai, dijadwal ulang, atau dibatalkan.</p>
      <ul className="mt-2 divide-y divide-line">
        {items.map((t) => {
          const late = daysBetween(t.due_date && t.due_date < t.plan_date ? t.due_date : t.plan_date, today);
          return (
            <li key={t.id} className="py-3">
              <Link href={`/tim/${t.workspace_id}/tugas/${t.id}`} className="block">
                <span className="block text-[15px] font-medium text-ink">{t.title}</span>
                <span className="block text-xs text-danger">
                  {[showWs && t.ws_name && `🏢 ${t.ws_name}`, `👤 ${t.who}`, t.due_date ? `tenggat ${tanggalPendek(t.due_date)}` : `jadwal ${tanggalPendek(t.plan_date)}`, late > 0 && `terlambat ${late} hari`].filter(Boolean).join(" · ")}
                </span>
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <form action={setTaskStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="to" value="done" />
                  <PendingButton className="flex items-center gap-1 rounded-lg border border-success/40 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success/5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                  </PendingButton>
                </form>
                <form action={rescheduleTask} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="date" name="date" defaultValue={tomorrow} min={today} required className="h-8 rounded-lg border border-line bg-white px-2 text-xs" aria-label="Tanggal baru" />
                  <PendingButton className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">
                    <CalendarClock className="h-3.5 w-3.5" /> Jadwal ulang
                  </PendingButton>
                </form>
                <form action={setTaskStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="to" value="closed" />
                  <PendingButton className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger">
                    <X className="h-3.5 w-3.5" /> Batal
                  </PendingButton>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
