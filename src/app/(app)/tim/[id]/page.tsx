import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Link2, LogOut, Settings2, UserMinus } from "lucide-react";
import { archiveWorkspace, removeMember, resetInviteLink, setMemberRole } from "@/app/actions/team";
import { ProgressBar } from "@/components/ui";
import { PendingButton } from "@/components/pending-button";
import { ShareRef } from "@/components/share-ref";
import { TaskRow } from "@/components/team/task-row";
import { AddTaskForm, InviteForm, WorkspaceSettingsForm } from "@/components/team/forms";
import { KIND_LABEL, ROLE_LABEL, canManage, getWorkspace, personName } from "@/lib/team";
import { SITE } from "@/lib/share";
import { tanggalPendek, todayJakarta } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Ruang Kerja" };

const TABS = [
  ["tugas", "Tugas"],
  ["anggota", "Anggota"],
  ["pengaturan", "Pengaturan"],
] as const;

export default async function WorkspacePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; lihat?: string; baru?: string; gabung?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const data = await getWorkspace(id);
  if (!data) notFound();
  const { ws, people, role, me, tasks, comments } = data;
  const today = todayJakarta();
  const manage = canManage(role);
  const tab = TABS.some(([k]) => k === sp.tab) && (sp.tab !== "pengaturan" || role === "owner") ? sp.tab! : "tugas";
  const mineOnly = sp.lihat === "saya";
  const active = people.filter((p) => p.status === "active");
  const invited = people.filter((p) => p.status === "invited");
  const nameOf = (uid: string | null) => (uid ? personName(people.find((p) => p.user_id === uid)) : "Belum ditentukan");

  const view = mineOnly ? tasks.filter((t) => t.assignee_id === me) : tasks;
  const now = view.filter((t) => t.status === "open" && t.plan_date <= today);
  const soon = view.filter((t) => t.status === "open" && t.plan_date > today);
  const done = view
    .filter((t) => t.status !== "open")
    .sort((a, b) => (b.done_at ?? b.updated_at).localeCompare(a.done_at ?? a.updated_at))
    .slice(0, 20);
  const doneToday = view.filter((t) => t.status === "done" && t.done_at && new Date(t.done_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) === today).length;
  const pct = now.length + doneToday ? Math.round((doneToday / (now.length + doneToday)) * 100) : 0;

  let cap = 0;
  if (tab === "anggota") {
    const supabase = await createClient();
    const { data: c } = await supabase.rpc("ws_member_cap", { p_ws: id });
    cap = Number(c ?? 0);
  }
  const inviteUrl = `${SITE}/gabung/${ws.invite_code}`;

  const Section = ({ title, items, empty }: { title: string; items: typeof tasks; empty?: string }) => (
    <section className="card p-5 lg:p-6">
      <h2 className="font-bold text-heading">
        {title} <span className="font-medium text-muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        empty && <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-1 divide-y divide-line">
          {items.map((t) => (
            <TaskRow key={t.id} t={t} today={today} canAct={manage || t.assignee_id === me} who={nameOf(t.assignee_id)} comments={comments[t.id] ?? 0} />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <>
      <Link href="/tim" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> Semua ruang kerja
      </Link>
      <div className="mb-5">
        <p className="eyebrow">
          {ws.kind === "project" ? "🎯" : "🏢"} {KIND_LABEL[ws.kind]} · {ROLE_LABEL[role]}
          {ws.kind === "project" && ws.end_date ? ` · selesai ${tanggalPendek(ws.end_date)}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading lg:text-3xl">{ws.name}</h1>
        {ws.description && <p className="mt-1 max-w-2xl text-sm text-muted">{ws.description}</p>}
        {ws.archived && <p className="mt-2 inline-block rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">Diarsipkan</p>}
      </div>

      {sp.baru === "1" && (
        <p className="mb-5 rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm text-heading">
          🎉 Ruang kerja dibuat. Langkah berikutnya: <Link href={`/tim/${id}?tab=anggota`} className="font-semibold text-brand">undang anggota tim</Link>, lalu bagi tugas.
        </p>
      )}
      {sp.gabung === "1" && (
        <p className="mb-5 rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm text-heading">
          🎉 Anda sudah bergabung. Tugas untuk Anda akan muncul otomatis di <Link href="/today" className="font-semibold text-brand">Laporan Harian</Link>.
        </p>
      )}

      <nav className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-soft">
        {TABS.filter(([k]) => k !== "pengaturan" || role === "owner").map(([k, label]) => (
          <Link key={k} href={`/tim/${id}${k === "tugas" ? "" : `?tab=${k}`}`} className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold whitespace-nowrap ${tab === k ? "bg-brand text-white" : "text-muted hover:text-heading"}`}>
            {label}
            {k === "anggota" ? ` (${active.length})` : ""}
          </Link>
        ))}
      </nav>

      {tab === "tugas" && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex gap-2 text-sm">
              <Link href={`/tim/${id}`} className={`rounded-full px-3 py-1.5 font-semibold ${!mineOnly ? "bg-heading text-white" : "border border-line text-muted"}`}>
                Semua tugas
              </Link>
              <Link href={`/tim/${id}?lihat=saya`} className={`rounded-full px-3 py-1.5 font-semibold ${mineOnly ? "bg-heading text-white" : "border border-line text-muted"}`}>
                Tugas saya
              </Link>
            </div>
            <section className="card p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-heading">Hari ini & tertunda</h2>
                <span className="text-xs font-medium text-muted">{doneToday} selesai hari ini</span>
              </div>
              {now.length + doneToday > 0 && (
                <div className="mt-3">
                  <ProgressBar value={pct} tone="brand" />
                </div>
              )}
              {now.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{manage ? "Tidak ada tugas berjalan. Tambahkan tugas di bawah." : "Tidak ada tugas untuk dikerjakan sekarang."}</p>
              ) : (
                <ul className="mt-1 divide-y divide-line">
                  {now.map((t) => (
                    <TaskRow key={t.id} t={t} today={today} canAct={manage || t.assignee_id === me} who={nameOf(t.assignee_id)} comments={comments[t.id] ?? 0} />
                  ))}
                </ul>
              )}
              {manage && !ws.archived && (
                <div className="mt-4">
                  <AddTaskForm ws={id} me={me} today={today} people={active.map((p) => ({ id: p.user_id, name: personName(p) }))} />
                </div>
              )}
            </section>
            {soon.length > 0 && <Section title="Akan datang" items={soon} />}
            {done.length > 0 && <Section title="Selesai & ditutup" items={done} />}
          </div>
          <aside className="space-y-5 lg:col-span-2">
            <section className="card p-5">
              <h2 className="font-bold text-heading">Status tim hari ini</h2>
              <ul className="mt-2 space-y-2">
                {active.map((p) => {
                  const mine = tasks.filter((t) => t.assignee_id === p.user_id);
                  const open = mine.filter((t) => t.status === "open" && t.plan_date <= today).length;
                  const late = mine.filter((t) => t.status === "open" && t.due_date && t.due_date < today).length;
                  const ok = mine.filter((t) => t.status === "done" && t.done_at && new Date(t.done_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) === today).length;
                  return (
                    <li key={p.user_id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate text-heading">{personName(p)}</span>
                      <span className="shrink-0 text-xs text-muted">
                        <b className="text-success">{ok} selesai</b> · {open} berjalan{late ? <b className="text-danger"> · {late} lewat tenggat</b> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
              <b className="text-heading">Cara kerjanya:</b> tugas muncul di Laporan Harian orang yang mengerjakan mulai tanggal yang dipilih. Ia menandai selesai atau &quot;lanjut besok&quot;, dan pemberi tugas langsung dapat notifikasi. Klik tugas untuk berdiskusi di kolom komentar.
            </section>
          </aside>
        </div>
      )}

      {tab === "anggota" && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="card p-5 lg:col-span-3 lg:p-6">
            <h2 className="font-bold text-heading">Anggota ({active.length})</h2>
            <ul className="mt-2 divide-y divide-line">
              {[...active, ...invited].map((p) => (
                <li key={p.user_id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft text-xs font-bold text-heading">{(p.full_name || p.username || "?").slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    <b className="block truncate text-heading">
                      {personName(p)} {p.user_id === me && <span className="font-normal text-muted">(saya)</span>}
                    </b>
                    <span className="text-xs text-muted">
                      {p.username ? `@${p.username} · ` : ""}
                      {p.status === "invited" ? "Menunggu diterima" : ROLE_LABEL[p.role]}
                    </span>
                  </span>
                  {role === "owner" && p.role !== "owner" && p.status === "active" && (
                    <form action={setMemberRole}>
                      <input type="hidden" name="ws" value={id} />
                      <input type="hidden" name="user" value={p.user_id} />
                      <input type="hidden" name="role" value={p.role === "admin" ? "member" : "admin"} />
                      <PendingButton className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">{p.role === "admin" ? "Jadikan anggota" : "Jadikan admin"}</PendingButton>
                    </form>
                  )}
                  {p.role !== "owner" && p.user_id !== me && (role === "owner" || (role === "admin" && p.role === "member")) && (
                    <form action={removeMember}>
                      <input type="hidden" name="ws" value={id} />
                      <input type="hidden" name="user" value={p.user_id} />
                      <PendingButton className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger" title={p.status === "invited" ? "Batalkan undangan" : "Keluarkan dari tim"}>
                        <UserMinus className="h-3.5 w-3.5" /> {p.status === "invited" ? "Batalkan" : "Keluarkan"}
                      </PendingButton>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              <b>Pemilik</b> mengatur semuanya. <b>Admin</b> boleh membuat & membagi tugas serta mengundang. <b>Anggota</b> mengerjakan tugas dan berkomentar.
            </p>
            {role !== "owner" && (
              <form action={removeMember} className="mt-4">
                <input type="hidden" name="ws" value={id} />
                <input type="hidden" name="user" value={me} />
                <PendingButton className="btn-ghost text-sm text-danger">
                  <LogOut className="h-4 w-4" /> Keluar dari ruang kerja ini
                </PendingButton>
              </form>
            )}
          </section>
          {manage && !ws.archived && (
            <aside className="space-y-5 lg:col-span-2">
              <section className="card p-5">
                <h2 className="font-bold text-heading">Undang lewat username</h2>
                <p className="mt-0.5 mb-3 text-xs text-muted">Untuk yang sudah punya akun EClub. Mereka perlu menerima undangan dulu.</p>
                <InviteForm ws={id} />
                <p className="mt-3 text-xs text-muted">
                  Terpakai {people.filter((p) => p.role !== "owner").length} dari {cap} anggota.{" "}
                  {cap < 15 && (
                    <Link href="/paket" className="font-semibold text-brand">
                      Plus tahunan: sampai 15 ›
                    </Link>
                  )}
                </p>
              </section>
              <section className="card p-5">
                <h2 className="flex items-center gap-2 font-bold text-heading">
                  <Link2 className="h-5 w-5 text-brand" /> Link undangan
                </h2>
                <p className="mt-0.5 text-xs text-muted">Kirim lewat WhatsApp. Yang belum punya akun bisa daftar gratis lalu langsung masuk tim.</p>
                <p className="mt-2 truncate rounded-xl bg-paper px-3 py-2 font-mono text-xs text-heading">{inviteUrl}</p>
                <ShareRef url={inviteUrl} text={`Halo! Yuk gabung ke tim *${ws.name}* di EClub. Tugas kita nanti muncul langsung di HP masing-masing. Klik link ini:`} />
                {role === "owner" && (
                  <form action={resetInviteLink} className="mt-3">
                    <input type="hidden" name="id" value={id} />
                    <PendingButton className="text-xs font-semibold text-muted hover:text-danger">Buat link baru (link lama tidak berlaku)</PendingButton>
                  </form>
                )}
              </section>
            </aside>
          )}
        </div>
      )}

      {tab === "pengaturan" && role === "owner" && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="card p-5 lg:col-span-3 lg:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-heading">
              <Settings2 className="h-5 w-5 text-brand" /> Pengaturan ruang kerja
            </h2>
            <WorkspaceSettingsForm id={id} name={ws.name} kind={ws.kind} end={ws.end_date} description={ws.description} />
          </section>
          <section className="card h-fit p-5 lg:col-span-2">
            <h2 className="font-bold text-heading">{ws.archived ? "Aktifkan lagi" : "Arsipkan"}</h2>
            <p className="mt-1 text-sm text-muted">
              {ws.archived ? "Ruang kerja kembali aktif dan tugasnya muncul lagi di Laporan Harian anggota." : "Untuk project yang sudah selesai. Tugas tidak lagi muncul di Laporan Harian anggota, tapi riwayatnya tetap tersimpan."}
            </p>
            <form action={archiveWorkspace} className="mt-3">
              <input type="hidden" name="id" value={id} />
              {ws.archived && <input type="hidden" name="restore" value="1" />}
              <PendingButton className="btn-ghost">{ws.archived ? "Aktifkan lagi" : "Arsipkan ruang kerja"}</PendingButton>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
