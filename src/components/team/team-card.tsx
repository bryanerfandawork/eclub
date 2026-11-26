import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { getAccount, isAdmin } from "@/lib/plans";
import { getManagedAlerts, getMyTeamTasks, getMyWorkspaces, getTeamState } from "@/lib/team";
import { todayJakarta } from "@/lib/format";

/**
 * Pintu masuk Ruang Kerja Tim di Home & Rutinitas. Tampil ringkas, hanya bila relevan:
 * punya/diundang ke ruang kerja (ringkasan tugas + yang terlambat), atau member Plus (ajakan membuat).
 */
export async function TeamCard({ variant = "home" }: { variant?: "home" | "compact" }) {
  const [state, acc] = await Promise.all([getTeamState(), getAccount()]);
  if (!state.ready) return null;
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const has = state.workspaces + state.invites > 0;
  if (!has) {
    if (!plus) return null;
    return (
      <Link href="/tim" className="flex items-center gap-4 rounded-2xl border border-dashed border-line bg-white p-4 transition hover:border-gold">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <FolderKanban className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-sm">
          <b className="block text-heading">Kerja bareng tim?</b>
          <span className="text-muted">Buat ruang kerja untuk usaha atau project Anda, bagi tugas per bagian, pantau progresnya.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
      </Link>
    );
  }
  const today = todayJakarta();
  const [list, tasks, alerts] = await Promise.all([getMyWorkspaces(), getMyTeamTasks(today, todayJakarta(1)), getManagedAlerts(today)]);
  const now = tasks.filter((t) => t.plan_date <= today);
  const left = now.filter((t) => t.status === "open").length;
  const live = list.filter((w) => !w.archived);
  return (
    <section className={`card p-4 lg:p-5 ${alerts.length ? "border-danger/40" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <FolderKanban className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-sm">
          <b className="block text-heading">Ruang Kerja Tim</b>
          <span className="text-muted">
            {now.length ? (left ? `${left} dari ${now.length} tugas Anda hari ini belum selesai` : `Semua ${now.length} tugas Anda hari ini selesai ✓`) : "Tidak ada tugas tim untuk Anda hari ini"}
            {state.invites ? ` · ${state.invites} undangan baru` : ""}
          </span>
        </span>
        <Link href="/tim" className="shrink-0 text-sm font-semibold text-brand">
          Buka ›
        </Link>
      </div>
      {alerts.length > 0 && (
        <Link href={alerts.length && new Set(alerts.map((a) => a.workspace_id)).size === 1 ? `/tim/${alerts[0].workspace_id}?tab=progres` : "/today#tim-tindakan"} className="mt-3 flex items-center justify-between rounded-xl bg-danger/5 px-3 py-2 text-sm font-semibold text-danger">
          ⚠️ {alerts.length} tugas tim terlambat, perlu tindakan <span>›</span>
        </Link>
      )}
      {variant === "home" && live.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {live.slice(0, 6).map((w) => (
            <Link key={w.id} href={`/tim/${w.id}`} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-heading hover:border-gold">
              {w.kind === "project" ? "🎯" : "🏢"} {w.name}
              {w.late > 0 && w.role !== "member" ? <span className="ml-1 text-danger">• {w.late}</span> : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
