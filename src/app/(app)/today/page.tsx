import Link from "next/link";
import { ArrowRight, CalendarCheck2, Wallet as WalletIcon, CheckCircle2, Circle, Clock, Heart, Repeat, Settings2, Trophy, X } from "lucide-react";
import { closeDaily, followupDaily, toggleDaily } from "@/app/actions/growth";
import { toggleHabit } from "@/app/actions/habits";
import { markNoTx } from "@/app/actions/finance";
import { CatatButton, QuickAdd } from "@/components/finance/quick-add";
import { getFinance, getFinToday } from "@/lib/finance-server";
import { getAccount, getLimit, getSettings, isAdmin } from "@/lib/plans";
import { assistantConfig } from "@/lib/assistant-config";
import { rupiah } from "@/lib/format";
import { PendingButton } from "@/components/pending-button";
import { AssistantPanel } from "@/components/assistant-panel";
import { AddPlanForm } from "@/components/plan-form";
import { PageHeader, ProgressBar } from "@/components/ui";
import { daysBetween, getAssistantStats, getHabitsToday, getWorks, originOf, statusOf } from "@/lib/assistant";
import { getDailyRange, getDreams, getProgressStats } from "@/lib/data";
import { demoDaily } from "@/lib/demo";
import { tanggalPanjang, todayJakarta } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";
import type { DailyAction } from "@/lib/types";
import { getManagedAlerts, getMyTeamTasks, getTeamState } from "@/lib/team";
import { NeedsAction } from "@/components/team/needs-action";
import { TaskRow } from "@/components/team/task-row";
import { FolderKanban } from "lucide-react";
import { DreamProgress } from "@/components/links/dream-progress";

export const metadata = { title: "Laporan Harian" };

const jktDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) : "");

export default async function TodayPage() {
  const today = todayJakarta();
  const tomorrow = todayJakarta(1);
  const [items, works, allDreams, { habits, logs }, stats, progress, limit] = await Promise.all([
    isDemoMode ? Promise.resolve(demoDaily) : getDailyRange(todayJakarta(-29), tomorrow),
    getWorks(),
    getDreams(),
    getHabitsToday(),
    getAssistantStats(),
    getProgressStats(),
    getLimit("daily_action"),
  ]);
  const [fin, finToday, acc, teamTasks, team] = await Promise.all([getFinance(today.slice(0, 7)), getFinToday(), getAccount(), getMyTeamTasks(today, tomorrow), getTeamState(), ]);
  const alerts = await getManagedAlerts(today);
  const simple = team.simple;
  const teamNow = teamTasks.filter((t) => t.plan_date <= today);
  const teamTomorrow = teamTasks.filter((t) => t.plan_date > today && t.status === "open");
  const teamDone = teamNow.filter((t) => t.status === "done").length;
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const dreams = allDreams.filter((d) => d.status === "active");
  const dreamTitle = (id?: string | null) => allDreams.find((d) => d.id === id)?.title;
  const workOf = (id?: string | null) => works.find((w) => w.id === id);
  const dreamOf = (a: DailyAction) => dreamTitle(a.dream_id) ?? dreamTitle(workOf(a.work_id)?.dream_id);

  const todays = items.filter((a) => a.action_date === today && statusOf(a) !== "closed");
  const overdue = items.filter((a) => a.action_date < today && statusOf(a) === "open");
  const later = items.filter((a) => a.action_date === tomorrow && statusOf(a) === "open");
  const done = todays.filter((a) => statusOf(a) === "done").length;
  const pct = todays.length ? Math.round((done / todays.length) * 100) : 0;
  const createdToday = items.filter((a) => jktDate(a.created_at) === today).length;
  const left = limit === null ? null : Math.max(0, limit - createdToday);
  const doneHabit = new Set(logs.filter((l) => l.log_date === today).map((l) => l.habit_id));

  // Kelompokkan rencana hari ini per pekerjaan.
  const groups = [...works.map((w) => ({ key: w.id, name: w.name, dream: dreamTitle(w.dream_id) })), { key: "", name: "Lainnya", dream: undefined }]
    .map((g) => ({ ...g, items: todays.filter((a) => (a.work_id && workOf(a.work_id) ? a.work_id : "") === g.key) }))
    .filter((g) => g.items.length);

  const Row = ({ a, mode }: { a: DailyAction; mode: "today" | "overdue" | "later" }) => {
    const st = statusOf(a);
    const age = daysBetween(originOf(a), today);
    const meta = [mode !== "today" && workOf(a.work_id)?.name, dreamOf(a) && `✨ ${dreamOf(a)}`, (a.followups ?? 0) > 0 && `dilanjutkan ${a.followups}x`, age > 0 && st === "open" && `${age} hari berjalan`].filter(Boolean);
    return (
      <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
        {mode === "today" ? (
          <form action={toggleDaily} className="shrink-0">
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="done" value={String(st === "done")} />
            <PendingButton className="grid h-9 w-9 place-items-center rounded-full" aria-label={st === "done" ? "Tandai belum" : "Tandai selesai"}>
              {st === "done" ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-line" strokeWidth={2.2} />}
            </PendingButton>
          </form>
        ) : (
          <Clock className={`ml-2 h-5 w-5 shrink-0 ${mode === "overdue" ? "text-gold" : "text-muted"}`} />
        )}
        <span className="min-w-0 flex-1">
          <span className={`block text-[15px] ${st === "done" ? "text-muted line-through" : "text-ink"}`}>{a.title}</span>
          {meta.length > 0 && <span className="block text-xs text-muted">{meta.join(" · ")}</span>}
        </span>
        {st === "open" && mode !== "later" && (
          <span className="flex w-full justify-end gap-1.5 sm:w-auto">
            <form action={followupDaily}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="to" value={mode === "overdue" ? "today" : "tomorrow"} />
              <PendingButton className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-heading hover:border-gold">
                {mode === "overdue" ? "Kerjakan hari ini" : "Lanjut besok"}
              </PendingButton>
            </form>
            <form action={closeDaily}>
              <input type="hidden" name="id" value={a.id} />
              <PendingButton className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger" title="Tutup: tidak dilanjutkan">
                <X className="h-3.5 w-3.5" /> Tutup
              </PendingButton>
            </form>
          </span>
        )}
      </li>
    );
  };

  // Pekerjaan Tim: tugas dari ruang kerja, terpisah dari rencana pribadi dan tidak dihitung di batas paket gratis.
  const teamSection = (teamTasks.length > 0 || simple || team.workspaces > 0) && (
    <section className="card p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-heading">
          <FolderKanban className="h-5 w-5 text-brand" /> Pekerjaan Tim
        </h2>
        <span className="text-xs font-medium text-muted">
          {teamDone}/{teamNow.length} selesai
        </span>
      </div>
      {teamNow.length > 0 && (
        <div className="mt-3">
          <ProgressBar value={teamNow.length ? Math.round((teamDone / teamNow.length) * 100) : 0} tone="brand" />
        </div>
      )}
      {teamNow.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Belum ada tugas tim untuk hari ini.</p>
      ) : (
        <ul className="mt-1 divide-y divide-line">
          {teamNow.map((t) => (
            <TaskRow key={t.id} t={t} today={today} canAct label={t.ws_name} comments={t.comments} />
          ))}
        </ul>
      )}
      {teamTomorrow.length > 0 && <p className="mt-2 text-xs text-muted">Besok: {teamTomorrow.length} tugas tim menunggu.</p>}
      <Link href="/tim" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
        Buka ruang kerja <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );

  return (
    <>
      <PageHeader
        eyebrow="Laporan harian"
        title="Hari ini"
        desc={simple ? `${tanggalPanjang(today)}. Tandai tugas yang selesai, atau lanjutkan besok.` : `${tanggalPanjang(today)}. Centang kebiasaan, laporkan rencana aksi: selesai, lanjut besok, atau tutup.`}
        action={
          simple ? undefined : (
            <Link href="/rutinitas" className="btn-ghost text-sm">
              <Settings2 className="h-4 w-4" /> Atur pekerjaan & kebiasaan
            </Link>
          )
        }
      />
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-5 lg:col-span-3">
          {simple && teamSection}
          {!simple && (
          <section className="card p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <Repeat className="h-5 w-5 text-gold" /> Kebiasaan hari ini
              </h2>
              {habits.length > 0 && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${doneHabit.size >= habits.length ? "bg-success/10 text-success" : "bg-paper text-muted"}`}>
                  {habits.filter((h) => doneHabit.has(h.id)).length}/{habits.length}
                </span>
              )}
            </div>
            {habits.length === 0 ? (
              <Link href="/rutinitas" className="mt-3 block rounded-xl border border-dashed border-line py-3 text-center text-sm font-semibold text-muted hover:border-gold">
                + Tentukan kebiasaan harian
              </Link>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {habits.map((h) => {
                  const on = doneHabit.has(h.id);
                  return (
                    <form key={h.id} action={toggleHabit}>
                      <input type="hidden" name="id" value={h.id} />
                      <input type="hidden" name="date" value={today} />
                      <input type="hidden" name="done" value={on ? "1" : "0"} />
                      <PendingButton className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition active:scale-[.98] ${on ? "border-success/30 bg-success/5" : "border-line hover:border-gold"}`}>
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${on ? "bg-success text-white" : "bg-paper"}`}>{on ? "✓" : h.emoji}</span>
                        <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${on ? "text-success" : "text-heading"}`}>{h.name}</span>
                      </PendingButton>
                    </form>
                  );
                })}
              </div>
            )}
          </section>

          )}

          {!simple && (
          <section id="keuangan" className={`card scroll-mt-24 p-5 lg:p-6 ${finToday.reported ? "" : "border-gold/50"}`}>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <WalletIcon className="h-5 w-5 text-success" /> Laporan keuangan hari ini
              </h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${finToday.reported ? "bg-success/10 text-success" : "bg-gold-soft text-brand"}`}>{finToday.reported ? "✓ Sudah lapor" : "Belum lapor"}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["personal", "business"] as const).map((w) => (
                <Link key={w} href={`/keuangan?w=${w}`} className="rounded-xl bg-paper p-3 hover:bg-gold-soft/50">
                  <p className="text-xs text-muted">{w === "personal" ? "🙂 Saldo pribadi" : "🏪 Saldo usaha"}</p>
                  <p className={`mt-0.5 font-bold ${fin.balances[w] < 0 ? "text-danger" : "text-heading"}`}>{rupiah(fin.balances[w])}</p>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">
              {finToday.count > 0
                ? `Hari ini: ${finToday.count} catatan · masuk ${rupiah(finToday.in)} · keluar ${rupiah(finToday.out)}.`
                : finToday.noTx
                  ? "Anda menandai hari ini tanpa transaksi."
                  : "Catat setiap uang masuk dan keluar hari ini, dari kantong mana. Tidak ada transaksi? Tandai saja."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CatatButton className="btn-primary flex-1 py-2.5">+ Catat transaksi</CatatButton>
              {finToday.count === 0 && (
                <form action={markNoTx} className="flex-1">
                  {finToday.noTx && <input type="hidden" name="undo" value="1" />}
                  <PendingButton className="btn-ghost w-full py-2.5">{finToday.noTx ? "Batalkan tanda" : "Tidak ada transaksi"}</PendingButton>
                </form>
              )}
            </div>
          </section>
          )}

          <section className="card p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <CalendarCheck2 className="h-5 w-5 text-brand" /> Rencana aksi hari ini
              </h2>
              <span className="text-xs font-medium text-muted">
                {done}/{todays.length} selesai
              </span>
            </div>
            {todays.length > 0 && (
              <div className="mt-3">
                <ProgressBar value={pct} tone="brand" />
              </div>
            )}
            {groups.length === 0 && <p className="mt-3 text-sm text-muted">Belum ada rencana untuk hari ini. Tulis 1 sampai 3 hal terpenting dulu.</p>}
            {groups.map((g) => (
              <div key={g.key || "lain"} className="mt-4">
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs font-bold tracking-wide text-heading uppercase">
                  {g.name} {g.dream && <span className="font-medium tracking-normal text-muted normal-case">✨ {g.dream}</span>}
                </p>
                <ul className="divide-y divide-line">
                  {g.items.map((a) => (
                    <Row key={a.id} a={a} mode="today" />
                  ))}
                </ul>
              </div>
            ))}
            <AddPlanForm date={today} works={works.map((w) => ({ id: w.id, title: w.name }))} dreams={dreams.map((d) => ({ id: d.id, title: d.title }))} left={left} />
          </section>

          {!simple && teamSection}

          {alerts.length > 0 && (
            <div id="tim-tindakan" className="scroll-mt-24">
              <NeedsAction items={alerts} today={today} tomorrow={tomorrow} showWs title="Tugas tim yang perlu tindakan" />
            </div>
          )}

          {overdue.length > 0 && (
            <section className="card border-gold/40 p-5 lg:p-6">
              <h2 className="font-bold text-heading">Tertunda dari hari sebelumnya ({overdue.length})</h2>
              <p className="mt-0.5 text-xs text-muted">Kerjakan hari ini, atau tutup kalau memang sudah tidak perlu. Menutup bukan gagal.</p>
              <ul className="mt-1 divide-y divide-line">
                {overdue.map((a) => (
                  <Row key={a.id} a={a} mode="overdue" />
                ))}
              </ul>
            </section>
          )}

          {later.length > 0 && (
            <section className="card p-5">
              <h2 className="font-bold text-heading">Rencana besok ({later.length})</h2>
              <ul className="mt-1 divide-y divide-line">
                {later.map((a) => (
                  <Row key={a.id} a={a} mode="later" />
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:col-span-2">
          <AssistantPanel stats={stats} streak={progress.streak} />
          {!simple && <DreamProgress title="Mimpi yang sedang dikejar" links />}
          {simple ? (
            <Link href="/journey" className="block rounded-2xl border border-gold/50 bg-gold-soft p-5 text-sm hover:brightness-95">
              <b className="block text-heading">🌱 Di sini juga bisa bantu Anda menyusun masa depan lho</b>
              <span className="mt-1 block text-muted">Selain tugas kerja, EClub membantu Anda menulis mimpi, merapikan keuangan, dan membuat rencana harian menuju mimpi itu. Pelan-pelan saja, 5 langkah.</span>
              <span className="mt-2 inline-flex items-center gap-1 font-semibold text-brand">
                Lihat 5 langkahnya <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
          <section className="card p-5">
            <h2 className="font-bold text-heading">Tutup hari dengan baik</h2>
            <div className="mt-3 space-y-2">
              <Link href="/kebiasaan" className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold text-heading hover:border-gold">
                <Heart className="h-5 w-5 text-brand" /> Tulis 3 hal yang disyukuri <ArrowRight className="ml-auto h-4 w-4 text-muted" />
              </Link>
              <Link href="/evaluasi#mingguan" className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold text-heading hover:border-gold">
                <Trophy className="h-5 w-5 text-gold" /> Evaluasi mingguan (2 menit) <ArrowRight className="ml-auto h-4 w-4 text-muted" />
              </Link>
            </div>
          </section>
          )}
        </aside>
      </div>
      <QuickAdd defaultWallet="personal" pockets={fin.pockets} plus={plus} teaser={assistantConfig(await getSettings()).teaser} fab={false} dreams={dreams.map((d) => ({ id: d.id, title: d.title }))} />
    </>
  );
}
