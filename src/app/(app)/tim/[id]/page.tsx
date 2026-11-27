import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, CheckCircle2, Circle, Link2, LogOut, Settings2, Sparkles, Target, Trash2, UserMinus } from "lucide-react";
import { archiveFinished, archiveTask, archiveWorkspace, deleteSection, removeMember, renameSection, resetInviteLink, setMemberRole, updateGoal } from "@/app/actions/team";
import { ProgressBar } from "@/components/ui";
import { PendingButton } from "@/components/pending-button";
import { ShareRef } from "@/components/share-ref";
import { TaskRow } from "@/components/team/task-row";
import { NeedsAction } from "@/components/team/needs-action";
import { AddTaskForm, GoalForm, InviteForm, SectionForm, WorkspaceSettingsForm } from "@/components/team/forms";
import { getMessages, levelName, boardCol } from "@/lib/team";
import { MessageForm } from "@/components/team/forms";
import { deleteMessage, setTaskStatus } from "@/app/actions/team";
import { KIND_LABEL, ROLE_LABEL, byPriority, canManage, getWorkspace, isLate, jktDay, personName, type TeamTask } from "@/lib/team";
import { getDreams } from "@/lib/data";
import { SITE } from "@/lib/share";
import { rupiah, tanggalPendek, todayJakarta } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Ruang Kerja" };

const TABS = [
  ["anggota", "Anggota"],
  ["tugas", "Tugas"],
  ["diskusi", "Diskusi"],
  ["progres", "Progres"],
  ["pengaturan", "Pengaturan"],
] as const;
type Tab = (typeof TABS)[number][0];

/** Senin minggu ini & tanggal 1 bulan ini (WIB). */
function periodStart(today: string, p: string) {
  if (p === "bulan") return today.slice(0, 8) + "01";
  if (p === "semua") return "0000-01-01";
  const d = new Date(today + "T00:00:00Z");
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * 86_400_000).toISOString().slice(0, 10);
}

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; lihat?: string; baru?: string; gabung?: string; p?: string; v?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const data = await getWorkspace(id);
  if (!data) notFound();
  const { ws, people, role, me, tasks, comments, sections, goals, items } = data;
  const L = levelName(ws.kind);
  const board = sp.v === "papan";
  const today = todayJakarta();
  const tomorrow = todayJakarta(1);
  const manage = canManage(role);
  const owner = role === "owner";
  const others = people.filter((p) => p.user_id !== me);
  const allowed = TABS.filter(([k]) => k !== "pengaturan" || owner).map(([k]) => k as Tab);
  const tab: Tab = allowed.includes(sp.tab as Tab) ? (sp.tab as Tab) : manage && others.length === 0 ? "anggota" : "tugas";
  const view = sp.lihat === "saya" ? "saya" : sp.lihat === "arsip" ? "arsip" : "semua";
  const active = people.filter((p) => p.status === "active");
  const invited = people.filter((p) => p.status === "invited");
  const nameOf = (uid: string | null) => (uid ? personName(people.find((p) => p.user_id === uid)) : "Belum ditentukan");
  const secName = (sid?: string | null) => sections?.find((s) => s.id === sid)?.name;
  const live = tasks.filter((t) => !t.archived);
  const late = live.filter((t) => isLate(t, today)).sort(byPriority);
  const ownerDreams = owner ? (await getDreams()).filter((d) => d.status === "active") : [];
  const dreamTitle = ws.dream_id ? ownerDreams.find((d) => d.id === ws.dream_id)?.title : undefined;

  // Langkah awal untuk pemilik: undang anggota → buat poin → isi pekerjaan.
  const setup = [
    { done: others.length > 0, label: "Undang anggota tim", href: `/tim/${id}?tab=anggota` },
    { done: (sections?.length ?? 0) > 0, label: ws.kind === "project" ? "Buat tahapan (milestone)" : "Buat area kerja", href: `/tim/${id}?tab=tugas#tahapan`, hide: sections === null },
    { done: tasks.length > 0, label: "Isi tugas + deadline", href: `/tim/${id}?tab=tugas` },
  ].filter((s) => !s.hide);
  const setupLeft = manage && setup.some((s) => !s.done);

  let cap = 0;
  if (tab === "anggota") {
    const supabase = await createClient();
    const { data: c } = await supabase.rpc("ws_member_cap", { p_ws: id });
    cap = Number(c ?? 0);
  }
  const inviteUrl = `${SITE}/gabung/${ws.invite_code}`;
  const pickPeople = people.map((p) => ({ id: p.user_id, name: personName(p), pending: p.status === "invited" }));
  const sectionOpts = sections?.map((s) => ({ id: s.id, name: s.name })) ?? null;
  const goalOpts = goals.filter((g) => g.status === "active").map((g) => ({ id: g.id, name: g.title }));
  const row = (t: TeamTask, withSection = false) => (
    <TaskRow key={t.id} t={t} today={today} canAct={manage || t.assignee_id === me} who={nameOf(t.assignee_id)} comments={comments[t.id] ?? 0} section={withSection ? secName(t.section_id) : undefined} items={items[t.id]} />
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
        {owner && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-heading">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {dreamTitle ? `Mendukung mimpi: ${dreamTitle}` : <Link href={`/tim/${id}?tab=pengaturan`}>Kaitkan ke mimpi Anda (opsional) ›</Link>}
          </p>
        )}
        {ws.archived && <p className="mt-2 ml-2 inline-block rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">Diarsipkan</p>}
      </div>

      {sp.gabung === "1" && (
        <p className="mb-5 rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm text-heading">
          🎉 Anda sudah bergabung. Tugas untuk Anda akan muncul otomatis di <Link href="/today" className="font-semibold text-brand">Laporan Harian</Link>.
        </p>
      )}

      {setupLeft && (
        <section className="mb-5 rounded-2xl border border-gold/50 bg-gold-soft/60 p-4">
          <p className="text-sm font-bold text-heading">{sp.baru === "1" ? "🎉 Ruang kerja dibuat. Siapkan dalam 3 langkah:" : "Langkah awal ruang kerja"}</p>
          <ol className="mt-2 grid gap-1.5 sm:grid-cols-3">
            {setup.map((s, i) => (
              <li key={s.label}>
                <Link href={s.href} className={`flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ${s.done ? "text-muted line-through" : "font-semibold text-heading hover:text-brand"}`}>
                  {s.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <Circle className="h-4 w-4 shrink-0 text-line" />}
                  {i + 1}. {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-soft">
        {allowed.map((k) => (
          <Link key={k} href={`/tim/${id}?tab=${k}`} className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold whitespace-nowrap ${tab === k ? "bg-brand text-white" : "text-muted hover:text-heading"}`}>
            {TABS.find(([x]) => x === k)?.[1]}
            {k === "anggota" ? ` (${people.length})` : ""}
            {k === "progres" && manage && late.length > 0 ? <span className={`ml-1 rounded-full px-1.5 text-[11px] ${tab === k ? "bg-white text-danger" : "bg-danger text-white"}`}>{late.length}</span> : null}
          </Link>
        ))}
      </nav>

      {tab === "anggota" && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="card p-5 lg:col-span-3 lg:p-6">
            <h2 className="font-bold text-heading">
              Anggota ({active.length}
              {invited.length ? ` + ${invited.length} menunggu` : ""})
            </h2>
            <ul className="mt-2 divide-y divide-line">
              {[...active, ...invited].map((p) => (
                <li key={p.user_id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${p.status === "invited" ? "border border-dashed border-line text-muted" : "bg-gold-soft text-heading"}`}>{(p.full_name || p.username || "?").slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    <b className="block truncate text-heading">
                      {personName(p)} {p.user_id === me && <span className="font-normal text-muted">(saya)</span>}
                    </b>
                    <span className="text-xs text-muted">
                      {p.username ? `@${p.username} · ` : ""}
                      {p.status === "invited" ? (
                        <span className="text-gold">Menunggu diterima · sudah bisa diberi tugas</span>
                      ) : p.role === "admin" && p.plus === false ? (
                        <span className="text-gold">Editor · Plus habis, sementara seperti anggota</span>
                      ) : (
                        ROLE_LABEL[p.role]
                      )}
                    </span>
                  </span>
                  {owner && p.role === "member" && p.status === "active" && p.plus === false && <span className="text-[11px] text-muted">Bisa jadi Editor bila akunnya Plus</span>}
                  {owner && p.role !== "owner" && p.status === "active" && (p.role === "admin" || p.plus !== false) && (
                    <form action={setMemberRole}>
                      <input type="hidden" name="ws" value={id} />
                      <input type="hidden" name="user" value={p.user_id} />
                      <input type="hidden" name="role" value={p.role === "admin" ? "member" : "admin"} />
                      <PendingButton className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">{p.role === "admin" ? "Jadikan anggota" : "Jadikan Editor"}</PendingButton>
                    </form>
                  )}
                  {p.role !== "owner" && p.user_id !== me && (owner || (role === "admin" && p.role === "member")) && (
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
              <b>Pemilik</b> mengatur semuanya. <b>Editor</b> (harus akun Plus, diangkat pemilik) boleh mengelola tugas, tahapan, target, dan mengundang. <b>Anggota</b> mengerjakan tugas dan berkomentar.
            </p>
            {manage && others.length > 0 && (
              <Link href={`/tim/${id}?tab=tugas`} className="btn-primary mt-4">
                Lanjut bagi tugas ›
              </Link>
            )}
            {!owner && (
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
                <p className="mt-0.5 mb-3 text-xs text-muted">Untuk yang sudah punya akun EClub (username ada di menu Profile). Namanya langsung muncul di daftar dan sudah bisa diberi tugas sambil menunggu ia menerima.</p>
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
                {owner && (
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

      {tab === "tugas" && sections !== null && (
        <div className="mb-4 inline-flex rounded-xl bg-white p-1 text-sm shadow-soft">
          <Link href={`/tim/${id}?tab=tugas`} className={`rounded-lg px-3 py-1.5 font-semibold ${!board ? "bg-heading text-white" : "text-muted"}`}>
            ☰ Daftar per {L.toLowerCase()}
          </Link>
          <Link href={`/tim/${id}?tab=tugas&v=papan`} className={`rounded-lg px-3 py-1.5 font-semibold ${board ? "bg-heading text-white" : "text-muted"}`}>
            ▦ Papan
          </Link>
        </div>
      )}

      {tab === "tugas" && board && sections !== null && <Board />}

      {tab === "diskusi" && <Discussion />}

      {tab === "tugas" && !(board && sections !== null) && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {(
                [
                  ["semua", "Semua"],
                  ["saya", "Tugas saya"],
                  ["arsip", "Arsip"],
                ] as const
              ).map(([k, l]) => (
                <Link key={k} href={`/tim/${id}?tab=tugas${k === "semua" ? "" : `&lihat=${k}`}`} className={`rounded-full px-3 py-1.5 font-semibold ${view === k ? "bg-heading text-white" : "border border-line bg-white text-muted"}`}>
                  {l}
                </Link>
              ))}
            </div>

            {manage && !ws.archived && view !== "arsip" && sections === null && (
              <section className="card p-5 lg:p-6">
                <h2 className="mb-1 font-bold text-heading">Bagi tugas</h2>
                <AddTaskForm ws={id} me={me} today={today} people={pickPeople} sections={null} goals={goalOpts} />
              </section>
            )}

            {view === "arsip" ? (
              <section className="card p-5 lg:p-6">
                <h2 className="font-bold text-heading">Arsip ({tasks.filter((t) => t.archived).length})</h2>
                <p className="mt-0.5 text-xs text-muted">Status tugas tetap tersimpan dan tetap dihitung di Progres.</p>
                <div className="mt-1 divide-y divide-line">
                  {tasks
                    .filter((t) => t.archived)
                    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <ul className="min-w-0 flex-1">{row(t, true)}</ul>
                        {manage && (
                          <form action={archiveTask}>
                            <input type="hidden" name="ws" value={id} />
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="restore" value="1" />
                            <PendingButton className="text-xs font-semibold text-brand">Kembalikan</PendingButton>
                          </form>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            ) : (
              <>
                {sections !== null && sections.length === 0 && (
                  <section className="rounded-2xl border border-dashed border-gold/60 bg-gold-soft/40 p-5 text-sm text-heading">
                    <b className="block">Mulai dari {L.toLowerCase()}</b>
                    <span className="mt-1 block text-muted">
                      Susunannya: <b>{ws.name}</b> → {L.toLowerCase()} (mis. {ws.kind === "project" ? "Melengkapi dokumen" : "Pengerjaan orderan"}) → tugas (mis. {ws.kind === "project" ? "Mendaftarkan NIB" : "Press pin orderan 50 pcs"}) lengkap dengan siapa yang mengerjakan dan deadline-nya.
                    </span>
                  </section>
                )}
                {[...(sections ?? []), { id: "", name: sections === null ? "Semua tugas" : `Tanpa ${L.toLowerCase()}`, sort: 999 }].map((sec) => {
                  const inSec = live.filter((t) => (t.section_id && secName(t.section_id) ? t.section_id : "") === sec.id && (view !== "saya" || t.assignee_id === me));
                  if (!inSec.length && (sec.id === "" ? sections !== null : view === "saya")) return null;
                  const open = inSec.filter((t) => t.status === "open").sort(byPriority);
                  const fin = inSec.filter((t) => t.status !== "open").sort((a, b) => (b.done_at ?? b.updated_at).localeCompare(a.done_at ?? a.updated_at));
                  const doneN = inSec.filter((t) => t.status === "done").length;
                  const countable = inSec.filter((t) => t.status !== "closed").length;
                  return (
                    <section key={sec.id || "umum"} className="card p-5 lg:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-bold text-heading">
                          {sec.id ? "📌 " : ""}
                          {sec.name}
                        </h2>
                        <span className="shrink-0 text-xs font-medium text-muted">
                          {doneN}/{countable} selesai
                        </span>
                      </div>
                      {countable > 0 && (
                        <div className="mt-2">
                          <ProgressBar value={Math.round((doneN / countable) * 100)} tone="brand" />
                        </div>
                      )}
                      {inSec.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">Belum ada tugas di sini.</p>
                      ) : (
                        <ul className="mt-1 divide-y divide-line">
                          {open.map((t) => row(t))}
                          {fin.slice(0, 10).map((t) => row(t))}
                        </ul>
                      )}
                      {fin.length > 10 && <p className="mt-2 text-xs text-muted">+{fin.length - 10} tugas selesai lainnya. Arsipkan supaya daftar rapi.</p>}
                      {manage && !ws.archived && sec.id && view !== "saya" && (
                        <>
                          <AddTaskForm ws={id} me={me} today={today} people={pickPeople} sections={sectionOpts} goals={goalOpts} section={sec.id} collapsed level={L} />
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-muted hover:text-heading">Ubah / hapus {L.toLowerCase()}</summary>
                            <div className="mt-2 flex items-center gap-1.5">
                              <form action={renameSection} className="flex flex-1 gap-1.5">
                                <input type="hidden" name="ws" value={id} />
                                <input type="hidden" name="id" value={sec.id} />
                                <input name="name" defaultValue={sec.name} maxLength={40} className="input h-9 py-1 text-sm" aria-label="Nama" />
                                <PendingButton className="rounded-lg border border-line px-2 text-xs font-semibold text-muted hover:text-heading">Simpan</PendingButton>
                              </form>
                              <form action={deleteSection}>
                                <input type="hidden" name="ws" value={id} />
                                <input type="hidden" name="id" value={sec.id} />
                                <PendingButton className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-danger" title="Hapus (tugasnya tetap ada)">
                                  <Trash2 className="h-4 w-4" />
                                </PendingButton>
                              </form>
                            </div>
                          </details>
                        </>
                      )}
                    </section>
                  );
                })}
                {manage && !ws.archived && sections !== null && view !== "saya" && (
                  <section id="tahapan" className="card scroll-mt-24 border-dashed p-5">
                    <h2 className="font-bold text-heading">
                      + {L} {sections.length ? "baru" : "pertama"}
                    </h2>
                    <p className="mt-0.5 mb-3 text-xs text-muted">
                      {ws.kind === "project"
                        ? "Tahapan = langkah besar (milestone) project ini. Di dalam setiap tahapan, isi tugas: siapa yang mengerjakan dan deadline-nya."
                        : "Area kerja = jenis pekerjaan yang terus berjalan di perusahaan, mis. pengerjaan orderan atau promosi. Di dalamnya isi tugas, termasuk tugas rutin yang berulang."}
                    </p>
                    <SectionForm ws={id} existing={sections.map((x) => x.name)} kind={ws.kind} />
                  </section>
                )}
                {manage && live.some((t) => t.status !== "open") && (
                  <form action={archiveFinished}>
                    <input type="hidden" name="ws" value={id} />
                    <PendingButton className="btn-ghost text-sm">
                      <Archive className="h-4 w-4" /> Arsipkan semua yang selesai & batal ({live.filter((t) => t.status !== "open").length})
                    </PendingButton>
                  </form>
                )}
              </>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-2">
            {manage && late.length > 0 && (
              <Link href={`/tim/${id}?tab=progres`} className="flex items-center justify-between rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
                ⚠️ {late.length} tugas terlambat perlu tindakan <span>›</span>
              </Link>
            )}
            <section className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
              <b className="text-heading">Cara kerjanya:</b> {ws.kind === "project" ? "Project" : "Perusahaan"} → {L.toLowerCase()} → tugas → checklist. Tugas muncul di Laporan Harian orang yang mengerjakan mulai tanggal yang dipilih. Ia menandai selesai atau &quot;lanjut besok&quot;, dan pemberi tugas langsung dapat notifikasi. Yang terlambat ditandai merah. Klik tugas untuk berdiskusi.
            </section>
          </aside>
        </div>
      )}

      {tab === "progres" && <Progress />}

      {tab === "pengaturan" && owner && (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <section className="card p-5 lg:col-span-3 lg:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-heading">
              <Settings2 className="h-5 w-5 text-brand" /> Pengaturan ruang kerja
            </h2>
            <WorkspaceSettingsForm id={id} name={ws.name} kind={ws.kind} end={ws.end_date} description={ws.description} dreams={ownerDreams.map((d) => ({ id: d.id, name: d.title }))} dreamId={ws.dream_id ?? null} />
          </section>
          <section className="card h-fit p-5 lg:col-span-2">
            <h2 className="font-bold text-heading">{ws.archived ? "Aktifkan lagi" : "Arsipkan"}</h2>
            <p className="mt-1 text-sm text-muted">
              {ws.archived ? "Ruang kerja kembali aktif dan tugasnya muncul lagi di Laporan Harian anggota." : "Untuk project yang sudah selesai. Tugas tidak lagi muncul di Laporan Harian anggota, tapi riwayat dan statusnya tetap tersimpan."}
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

  /** Papan: Belum mulai → Dikerjakan → Selesai. Pindah kolom lewat tombol (nyaman di HP). */
  function Board() {
    const mineOnly = view === "saya";
    const list = live.filter((t) => t.status !== "closed" && (!mineOnly || t.assignee_id === me));
    const cols = [
      { k: "todo", title: "Belum mulai", tone: "border-line" },
      { k: "doing", title: "Dikerjakan", tone: "border-gold/60" },
      { k: "done", title: "Selesai", tone: "border-success/40" },
    ] as const;
    return (
      <>
        <div className="mb-3 flex gap-2 text-sm">
          <Link href={`/tim/${id}?tab=tugas&v=papan`} className={`rounded-full px-3 py-1.5 font-semibold ${!mineOnly ? "bg-heading text-white" : "border border-line bg-white text-muted"}`}>
            Semua
          </Link>
          <Link href={`/tim/${id}?tab=tugas&v=papan&lihat=saya`} className={`rounded-full px-3 py-1.5 font-semibold ${mineOnly ? "bg-heading text-white" : "border border-line bg-white text-muted"}`}>
            Tugas saya
          </Link>
        </div>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {cols.map((c) => {
            const inCol = list
              .filter((t) => boardCol(t) === c.k)
              .sort(c.k === "done" ? (a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? "") : byPriority)
              .slice(0, c.k === "done" ? 15 : 200);
            return (
              <section key={c.k} className={`w-[82%] shrink-0 snap-start rounded-2xl border-2 bg-paper p-3 lg:w-auto ${c.tone}`}>
                <h2 className="mb-2 flex items-center justify-between px-1 text-sm font-bold text-heading">
                  {c.title} <span className="rounded-full bg-white px-2 text-xs text-muted">{list.filter((t) => boardCol(t) === c.k).length}</span>
                </h2>
                <div className="space-y-2">
                  {inCol.map((t) => {
                    const it = items[t.id];
                    const act = manage || t.assignee_id === me;
                    return (
                      <div key={t.id} className={`rounded-xl border bg-white p-3 shadow-soft ${isLate(t, today) ? "border-danger/50" : "border-line"}`}>
                        <Link href={`/tim/${id}/tugas/${t.id}`} className="block">
                          {secName(t.section_id) && <span className="mb-1 inline-block rounded bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-muted">📌 {secName(t.section_id)}</span>}
                          <span className={`block text-sm font-semibold ${t.status === "done" ? "text-muted line-through" : "text-heading"}`}>
                            {t.important && t.status !== "done" && <span className="mr-1 text-danger">●</span>}
                            {t.title}
                          </span>
                          <span className={`mt-1 block text-[11px] ${isLate(t, today) ? "font-semibold text-danger" : "text-muted"}`}>
                            {[`👤 ${nameOf(t.assignee_id)}`, t.due_date && `⏰ ${tanggalPendek(t.due_date)}`, t.repeat && "🔁", it?.total ? `☑ ${it.done}/${it.total}` : null, comments[t.id] ? `💬 ${comments[t.id]}` : null].filter(Boolean).join(" · ")}
                          </span>
                        </Link>
                        {act && c.k !== "done" && (
                          <form action={setTaskStatus} className="mt-2">
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="to" value={c.k === "todo" ? "start" : "done"} />
                            <PendingButton className={`w-full rounded-lg py-1.5 text-xs font-semibold ${c.k === "todo" ? "border border-line text-heading hover:border-gold" : "bg-success/10 text-success hover:bg-success/20"}`}>
                              {c.k === "todo" ? "▶ Mulai kerjakan" : "✓ Selesai"}
                            </PendingButton>
                          </form>
                        )}
                      </div>
                    );
                  })}
                  {inCol.length === 0 && <p className="px-1 py-3 text-center text-xs text-muted">Kosong</p>}
                </div>
              </section>
            );
          })}
        </div>
        {manage && <p className="mt-2 text-xs text-muted">Tambah tugas baru lewat tampilan Daftar, di dalam {L.toLowerCase()}-nya.</p>}
      </>
    );
  }

  /** Diskusi tim: obrolan satu ruang kerja (selain komentar per tugas). */
  async function Discussion() {
    const msgs = await getMessages(id);
    if (msgs === null) return <p className="card p-5 text-sm text-muted">Diskusi tim aktif setelah SQL 026 dijalankan.</p>;
    const waktu = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
    return (
      <section className="card mx-auto max-w-3xl p-5 lg:p-6">
        <h2 className="font-bold text-heading">Diskusi tim</h2>
        <p className="mt-0.5 text-xs text-muted">Untuk kabar dan koordinasi umum. Bahas tugas tertentu di kolom komentar tugasnya, supaya mudah dicari.</p>
        <ul className="mt-4 space-y-3">
          {msgs.map((m) => {
            const own = m.user_id === me;
            return (
              <li key={m.id} className={`flex ${own ? "justify-end" : ""}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${own ? "bg-brand text-white" : "bg-paper text-ink"}`}>
                  <p className={`text-[11px] font-semibold ${own ? "text-gold" : "text-muted"}`}>
                    {own ? "Saya" : nameOf(m.user_id)} · {waktu(m.created_at)}
                  </p>
                  <p className="mt-0.5 whitespace-pre-line">{m.body}</p>
                  {(own || manage) && (
                    <form action={deleteMessage} className="mt-1 text-right">
                      <input type="hidden" name="ws" value={id} />
                      <input type="hidden" name="id" value={m.id} />
                      <PendingButton className={`text-[11px] ${own ? "text-white/70" : "text-muted"} hover:underline`}>Hapus</PendingButton>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
          {msgs.length === 0 && <li className="text-sm text-muted">Belum ada pesan. Sapa tim Anda di sini 👋</li>}
        </ul>
        <div className="mt-4">
          <MessageForm ws={id} />
        </div>
      </section>
    );
  }

  /** Tab Progres: rapor periode (minggu/bulan/semua), perlu tindakan, per tahapan, per orang, target tim, hasil untuk mimpi. */
  function Progress() {
    const p = ["bulan", "semua"].includes(sp.p ?? "") ? sp.p! : "minggu";
    const from = periodStart(today, p);
    const dayOf = (t: TeamTask) => (t.status === "done" ? jktDay(t.done_at) : t.status === "closed" ? jktDay(t.updated_at) : (t.due_date ?? t.plan_date));
    const inPeriod = tasks.filter((t) => {
      const d = dayOf(t);
      return (d >= from && d <= (p === "semua" ? "9999" : today)) || (t.status === "open" && t.plan_date <= today);
    });
    const done = inPeriod.filter((t) => t.status === "done").length;
    const closed = inPeriod.filter((t) => t.status === "closed").length;
    const open = inPeriod.filter((t) => t.status === "open").length;
    const lateN = inPeriod.filter((t) => isLate(t, today)).length;
    const base = done + open;
    const pct = base ? Math.round((done / base) * 100) : 0;
    const groups = [...(sections ?? []).map((s) => ({ id: s.id, name: s.name })), { id: "", name: `Tanpa ${L.toLowerCase()}` }]
      .map((g) => {
        const list = inPeriod.filter((t) => (t.section_id && secName(t.section_id) ? t.section_id : "") === g.id && t.status !== "closed");
        return { ...g, total: list.length, done: list.filter((t) => t.status === "done").length, late: list.filter((t) => isLate(t, today)).length };
      })
      .filter((g) => g.total);
    const results = owner ? tasks.filter((t) => t.status === "done" && !t.result_state).slice(0, 5) : [];
    const savedSum = tasks.reduce((n, t) => n + (t.result_state === "saved" ? Number(t.result_amount ?? 0) : 0), 0);
    return (
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-5 lg:col-span-3">
          <div className="flex flex-wrap gap-2 text-sm">
            {(
              [
                ["minggu", "Minggu ini"],
                ["bulan", "Bulan ini"],
                ["semua", "Semua"],
              ] as const
            ).map(([k, l]) => (
              <Link key={k} href={`/tim/${id}?tab=progres${k === "minggu" ? "" : `&p=${k}`}`} className={`rounded-full px-3 py-1.5 font-semibold ${p === k ? "bg-heading text-white" : "border border-line bg-white text-muted"}`}>
                {l}
              </Link>
            ))}
          </div>
          <section className="card p-5 lg:p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Rapor {p === "minggu" ? "minggu ini" : p === "bulan" ? "bulan ini" : "keseluruhan"}</p>
                <p className="mt-1 text-3xl font-bold text-heading">{pct}%</p>
                <p className="text-xs text-muted">tugas selesai (yang dibatalkan tidak dihitung)</p>
              </div>
              <span className="text-4xl">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "🌱"}</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} tone="brand" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["Selesai", done, "text-success"],
                ["Berjalan", open, "text-heading"],
                ["Terlambat", lateN, "text-danger"],
                ["Batal", closed, "text-muted"],
              ].map(([l, n, c]) => (
                <div key={String(l)} className="rounded-xl bg-paper p-2.5">
                  <p className={`text-xl font-bold ${c}`}>{n}</p>
                  <p className="text-[11px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </section>

          {manage && <NeedsAction items={late.map((t) => ({ ...t, who: nameOf(t.assignee_id) }))} today={today} tomorrow={tomorrow} />}

          {groups.length > 0 && (
            <section className="card p-5 lg:p-6">
              <h2 className="font-bold text-heading">Per {L.toLowerCase()}</h2>
              <ul className="mt-3 space-y-3">
                {groups.map((g) => (
                  <li key={g.id || "umum"}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-heading">{g.name}</span>
                      <span className="text-xs text-muted">
                        {g.done}/{g.total}
                        {g.late ? <b className="text-danger"> · {g.late} terlambat</b> : null}
                      </span>
                    </div>
                    <ProgressBar value={Math.round((g.done / g.total) * 100)} tone="brand" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5 lg:p-6">
            <h2 className="font-bold text-heading">Per orang</h2>
            <ul className="mt-2 divide-y divide-line">
              {people.map((pp) => {
                const mine = inPeriod.filter((t) => t.assignee_id === pp.user_id && t.status !== "closed");
                const d = mine.filter((t) => t.status === "done").length;
                const l = mine.filter((t) => isLate(t, today)).length;
                return (
                  <li key={pp.user_id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate text-heading">
                      {personName(pp)}
                      {pp.status === "invited" && <span className="text-xs text-muted"> (menunggu)</span>}
                    </span>
                    <span className="w-24 shrink-0">
                      <ProgressBar value={mine.length ? Math.round((d / mine.length) * 100) : 0} tone="brand" />
                    </span>
                    <span className="w-28 shrink-0 text-right text-xs text-muted">
                      <b className="text-success">{d}</b>/{mine.length}
                      {l ? <b className="text-danger"> · {l} telat</b> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <Target className="h-5 w-5 text-brand" /> Target tim
            </h2>
            <p className="mt-0.5 text-xs text-muted">Target besar yang dikejar. Kaitkan tugas ke target saat membuat tugas.</p>
            <ul className="mt-3 space-y-4">
              {goals.map((g) => {
                const linked = tasks.filter((t) => t.goal_id === g.id && t.status !== "closed");
                const ld = linked.filter((t) => t.status === "done").length;
                const pctG = g.target_value ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : linked.length ? Math.round((ld / linked.length) * 100) : 0;
                const money = /^rp$/i.test(g.unit ?? "");
                const fmt = (n: number) => (money ? rupiah(n) : `${n.toLocaleString("id-ID")}${g.unit ? ` ${g.unit}` : ""}`);
                return (
                  <li key={g.id} className={g.status === "achieved" ? "opacity-70" : ""}>
                    <div className="flex items-start justify-between gap-2">
                      <b className="text-sm text-heading">
                        {g.status === "achieved" ? "🏆 " : "🎯 "}
                        {g.title}
                      </b>
                      <span className="shrink-0 text-sm font-bold text-heading">{pctG}%</span>
                    </div>
                    <p className="mb-1 text-xs text-muted">
                      {g.target_value ? `${fmt(g.current_value)} dari ${fmt(g.target_value)}` : `${ld}/${linked.length} tugas terkait selesai`}
                      {g.due_date ? ` · sampai ${tanggalPendek(g.due_date)}` : ""}
                    </p>
                    <ProgressBar value={pctG} />
                    {manage && g.status === "active" && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {g.target_value !== null && (
                          <form action={updateGoal} className="flex items-center gap-1.5">
                            <input type="hidden" name="ws" value={id} />
                            <input type="hidden" name="id" value={g.id} />
                            <input name="current" inputMode="decimal" defaultValue={String(g.current_value)} className="h-8 w-28 rounded-lg border border-line px-2 text-xs" aria-label="Capaian sekarang" />
                            <PendingButton className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">Perbarui</PendingButton>
                          </form>
                        )}
                        <form action={updateGoal}>
                          <input type="hidden" name="ws" value={id} />
                          <input type="hidden" name="id" value={g.id} />
                          <input type="hidden" name="status" value="achieved" />
                          <PendingButton className="rounded-lg px-2 py-1.5 text-xs font-semibold text-success">Tercapai ✓</PendingButton>
                        </form>
                        <form action={updateGoal}>
                          <input type="hidden" name="ws" value={id} />
                          <input type="hidden" name="id" value={g.id} />
                          <input type="hidden" name="status" value="dropped" />
                          <PendingButton className="rounded-lg px-2 py-1.5 text-xs text-muted hover:text-danger">Hapus</PendingButton>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
              {goals.length === 0 && <li className="text-sm text-muted">Belum ada target.</li>}
            </ul>
            {manage && !ws.archived && (
              <div className="mt-4">
                <GoalForm ws={id} />
              </div>
            )}
          </section>

          {owner && (
            <section className="rounded-2xl border border-gold/50 bg-gold-soft p-5">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <Sparkles className="h-5 w-5 text-gold" /> Hasil kerja untuk mimpi
              </h2>
              <p className="mt-1 text-sm text-ink">
                {savedSum > 0 ? (
                  <>
                    Sudah <b>{rupiah(savedSum)}</b> dari hasil pekerjaan tim ini ditabung untuk mimpi Anda.
                  </>
                ) : (
                  "Setiap tugas selesai bisa Anda catat: apakah hasilnya menambah tabungan mimpi? (Opsional, hanya Anda yang melihat.)"
                )}
              </p>
              {results.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {results.map((t) => (
                    <li key={t.id}>
                      <Link href={`/tim/${id}/tugas/${t.id}#hasil`} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm hover:text-brand">
                        <span className="truncate">✅ {t.title}</span>
                        <span className="shrink-0 text-xs font-semibold text-brand">Catat hasil ›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </aside>
      </div>
    );
  }
}
