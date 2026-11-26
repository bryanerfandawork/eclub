import Link from "next/link";
import { ArrowRight, Bell, Briefcase, Crown, FolderKanban, Users } from "lucide-react";
import { readAllNotices, respondInvite } from "@/app/actions/team";
import { PageHeader } from "@/components/ui";
import { PendingButton } from "@/components/pending-button";
import { CreateWorkspaceForm } from "@/components/team/forms";
import { getAccount, isAdmin } from "@/lib/plans";
import { KIND_LABEL, ROLE_LABEL, getMyInvites, getMyWorkspaces, getNotices, getTeamState } from "@/lib/team";
import { tanggalPendek } from "@/lib/format";
import { getDreams } from "@/lib/data";

export const metadata = { title: "Ruang Kerja Tim" };

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  if (m < 1440) return `${Math.round(m / 60)} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
};

export default async function TeamPage() {
  const [state, list, invites, notices, acc, dreams] = await Promise.all([getTeamState(), getMyWorkspaces(), getMyInvites(), getNotices(15), getAccount(), getDreams()]);
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const active = list.filter((w) => !w.archived);
  const archived = list.filter((w) => w.archived);
  const unread = notices.filter((n) => !n.read_at).length;

  return (
    <>
      <PageHeader
        eyebrow="Kerja bareng tim"
        title="Ruang Kerja Tim"
        desc="Atur usaha atau project bersama tim: perusahaan atau project → tahapan → tugas (siapa & deadline) → checklist. Tugas otomatis muncul di Laporan Harian orang yang mengerjakan."
      />
      {!state.ready && (
        <p className="mb-5 rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm text-heading">Fitur tim sedang disiapkan. Admin perlu menjalankan SQL 024 terlebih dahulu.</p>
      )}

      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-5 lg:col-span-3">
          {invites.length > 0 && (
            <section className="card border-gold/50 p-5">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <Users className="h-5 w-5 text-gold" /> Undangan untuk Anda ({invites.length})
              </h2>
              <ul className="mt-2 divide-y divide-line">
                {invites.map((i) => (
                  <li key={i.workspace_id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="min-w-0 flex-1 text-sm">
                      <b className="block text-heading">{i.name}</b>
                      <span className="text-xs text-muted">
                        {KIND_LABEL[i.kind as "company" | "project"] ?? "Tim"} · diundang oleh {i.inviter}
                      </span>
                    </span>
                    <form action={respondInvite}>
                      <input type="hidden" name="ws" value={i.workspace_id} />
                      <input type="hidden" name="accept" value="0" />
                      <PendingButton className="btn-ghost px-3 py-2 text-sm">Tolak</PendingButton>
                    </form>
                    <form action={respondInvite}>
                      <input type="hidden" name="ws" value={i.workspace_id} />
                      <input type="hidden" name="accept" value="1" />
                      <PendingButton className="btn-primary px-3 py-2 text-sm">Terima</PendingButton>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-bold text-heading">Ruang kerja saya</h2>
            {active.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 border-dashed p-8 text-center">
                <FolderKanban className="h-8 w-8 text-gold" />
                <p className="font-semibold text-heading">Belum ada ruang kerja</p>
                <p className="max-w-sm text-sm text-muted">
                  {plus ? "Buat ruang kerja untuk usaha atau project Anda, lalu undang tim." : "Kalau ada yang mengundang Anda, ruang kerjanya akan muncul di sini."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {active.map((w) => (
                  <Link key={w.id} href={`/tim/${w.id}`} className="card group flex flex-col p-5 transition hover:border-gold">
                    <span className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-gold uppercase">
                      <span>{w.kind === "project" ? "🎯 Project" : "🏢 Perusahaan"}</span>
                      <span className="rounded-full bg-paper px-2 py-0.5 tracking-normal text-muted normal-case">{ROLE_LABEL[w.role]}</span>
                    </span>
                    <b className="mt-1.5 block text-heading">{w.name}</b>
                    <span className="mt-1 text-sm text-muted">
                      {w.open} tugas berjalan{w.mine ? ` · ${w.mine} untuk saya` : ""}
                      {w.late > 0 && (w.role !== "member" ? <b className="text-danger"> · {w.late} terlambat</b> : null)}
                      {w.kind === "project" && w.end_date ? ` · selesai ${tanggalPendek(w.end_date)}` : ""}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand">
                      Buka <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {archived.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Diarsipkan:{" "}
                {archived.map((w, i) => (
                  <span key={w.id}>
                    {i > 0 && ", "}
                    <Link href={`/tim/${w.id}`} className="font-semibold hover:text-brand">
                      {w.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </section>

          <section className="card p-5 lg:p-6">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <Briefcase className="h-5 w-5 text-brand" /> Buat ruang kerja baru
            </h2>
            {plus ? (
              <div className="mt-3">
                <CreateWorkspaceForm dreams={dreams.filter((d) => d.status === "active").map((d) => ({ id: d.id, name: d.title }))} />
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted">
                <p>Membuat ruang kerja dan membagi tugas ke tim adalah fitur member Plus. Anggota yang Anda undang boleh memakai akun gratis.</p>
                <Link href="/paket" className="btn-gold mt-3">
                  <Crown className="h-4 w-4" /> Lihat paket Plus
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <p className="text-xs text-muted">Username Anda</p>
            <p className="mt-0.5 text-lg font-bold text-heading">{state.username ? `@${state.username}` : "–"}</p>
            <p className="mt-1 text-xs text-muted">
              Berikan username ini ke pemilik tim supaya bisa mengundang Anda.{" "}
              <Link href="/profile#username" className="font-semibold text-brand">
                Ubah ›
              </Link>
            </p>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <Bell className="h-5 w-5 text-gold" /> Pemberitahuan
              </h2>
              {unread > 0 && (
                <form action={readAllNotices}>
                  <PendingButton className="text-xs font-semibold text-brand">Tandai dibaca</PendingButton>
                </form>
              )}
            </div>
            {notices.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Belum ada pemberitahuan.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {notices.map((n) => (
                  <li key={n.id}>
                    <Link href={n.url || "/tim"} className="flex gap-2 py-2.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-brand"}`} />
                      <span className="min-w-0 flex-1 text-sm">
                        <b className="block text-heading">{n.title}</b>
                        {n.body && <span className="line-clamp-2 block text-muted">{n.body}</span>}
                        <span className="text-[11px] text-muted">{ago(n.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            <b className="text-heading">Privasi terjaga.</b> Pemilik tim hanya melihat tugas tim. Mimpi, keuangan, dan kebiasaan pribadi Anda tetap hanya untuk Anda.
          </section>
        </aside>
      </div>
    </>
  );
}
