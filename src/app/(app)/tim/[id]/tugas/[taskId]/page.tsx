import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle, Trash2 } from "lucide-react";
import { archiveTask, deleteComment, deleteTask, rescheduleTask, setTaskStatus } from "@/app/actions/team";
import { getDreams } from "@/lib/data";
import { getPockets } from "@/lib/finance-server";
import { rupiah } from "@/lib/format";
import { Sparkles } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { CommentForm, EditTaskForm, ResultForm } from "@/components/team/forms";
import { canManage, getTask, isLate, personName } from "@/lib/team";
import { tanggalPendek, todayJakarta } from "@/lib/format";

export const metadata = { title: "Tugas tim" };

const STATUS = { open: "Berjalan", done: "Selesai", closed: "Dibatalkan" } as const;
const waktu = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function TaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const data = await getTask(id, taskId);
  if (!data) notFound();
  const { ws, task: t, people, role, me, list, sections, goals } = data;
  const today = todayJakarta();
  const owner = role === "owner";
  const askResult = owner && t.status === "done" && !t.result_state;
  const [dreams, pockets] = askResult ? await Promise.all([getDreams(), getPockets()]) : [[], []];
  const section = sections?.find((x) => x.id === t.section_id)?.name;
  const goal = goals.find((g) => g.id === t.goal_id)?.title;
  const late = isLate(t, today);
  const manage = canManage(role);
  const mine = t.assignee_id === me;
  const canAct = manage || mine;
  const person = (uid: string | null) => people.find((p) => p.user_id === uid);

  const Btn = ({ to, children, tone = "ghost" }: { to: string; children: React.ReactNode; tone?: "ghost" | "primary" }) => (
    <form action={setTaskStatus}>
      <input type="hidden" name="id" value={t.id} />
      <input type="hidden" name="to" value={to} />
      <PendingButton className={tone === "primary" ? "btn-primary px-4 py-2 text-sm" : "btn-ghost px-4 py-2 text-sm"}>{children}</PendingButton>
    </form>
  );

  return (
    <>
      <Link href={`/tim/${id}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> {ws.name}
      </Link>
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-5 lg:col-span-3">
          <section className="card p-5 lg:p-6">
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${late ? "bg-danger/10 text-danger" : t.status === "done" ? "bg-success/10 text-success" : t.status === "closed" ? "bg-paper text-muted" : "bg-gold-soft text-brand"}`}>{late ? "Terlambat" : STATUS[t.status]}</span>
              {t.important && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">Penting</span>}
              {section && <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-heading">📂 {section}</span>}
              {goal && <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-heading">🎯 {goal}</span>}
              {t.archived && <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-muted">Diarsipkan</span>}
            </div>
            <h1 className={`mt-3 text-xl font-bold text-heading lg:text-2xl ${t.status !== "open" ? "line-through decoration-2 opacity-70" : ""}`}>{t.title}</h1>
            {t.description && <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-ink">{t.description}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted">Dikerjakan oleh</dt>
                <dd className="font-semibold text-heading">{t.assignee_id ? personName(person(t.assignee_id)) : "Belum ditentukan"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Diberikan oleh</dt>
                <dd className="font-semibold text-heading">{personName(person(t.created_by))}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Di Laporan Harian</dt>
                <dd className="font-semibold text-heading">{t.plan_date === today ? "Hari ini" : tanggalPendek(t.plan_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Tenggat</dt>
                <dd className={`font-semibold ${t.status === "open" && t.due_date && t.due_date < today ? "text-danger" : "text-heading"}`}>{t.due_date ? tanggalPendek(t.due_date) : "–"}</dd>
              </div>
            </dl>
            {t.followups > 0 && <p className="mt-3 text-xs text-muted">Sudah dilanjutkan {t.followups}x.</p>}
            {canAct && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {t.status === "open" ? (
                  <>
                    <Btn to="done" tone="primary">
                      <CheckCircle2 className="h-4 w-4" /> Tandai selesai
                    </Btn>
                    {t.plan_date <= today ? <Btn to="tomorrow">Lanjut besok</Btn> : <Btn to="today">Kerjakan hari ini</Btn>}
                    {manage && <Btn to="closed">Batalkan</Btn>}
                  </>
                ) : (
                  <Btn to="open">Buka lagi</Btn>
                )}
              </div>
            )}
            {manage && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={rescheduleTask} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="date" name="date" defaultValue={todayJakarta(1)} min={today} required className="h-9 rounded-lg border border-line bg-white px-2 text-sm" aria-label="Tanggal baru" />
                  <PendingButton className="btn-ghost px-3 py-2 text-sm">Jadwal ulang</PendingButton>
                </form>
                {t.status !== "open" && (
                  <form action={archiveTask}>
                    <input type="hidden" name="ws" value={id} />
                    <input type="hidden" name="id" value={t.id} />
                    {t.archived && <input type="hidden" name="restore" value="1" />}
                    <PendingButton className="btn-ghost px-3 py-2 text-sm">{t.archived ? "Kembalikan dari arsip" : "Arsipkan"}</PendingButton>
                  </form>
                )}
              </div>
            )}
          </section>

          {owner && t.status === "done" && (
            <section id="hasil" className="scroll-mt-24 rounded-2xl border border-gold/50 bg-gold-soft p-5 lg:p-6">
              <h2 className="flex items-center gap-2 font-bold text-heading">
                <Sparkles className="h-5 w-5 text-gold" /> Hasil pekerjaan ini menambah tabungan mimpi?
              </h2>
              {t.result_state === "saved" ? (
                <p className="mt-1 text-sm text-ink">✓ {rupiah(Number(t.result_amount ?? 0))} sudah ditabung untuk mimpi Anda.</p>
              ) : t.result_state === "skipped" ? (
                <p className="mt-1 text-sm text-muted">Dicatat tanpa tabungan.</p>
              ) : (
                <>
                  <p className="mt-1 mb-3 text-sm text-ink">Misalnya hasil penjualan atau bonus dari pekerjaan ini. Opsional, dan hanya Anda yang melihat.</p>
                  <ResultForm ws={id} task={t.id} dreamId={ws.dream_id ?? null} pockets={pockets.map((p) => ({ id: p.id, name: p.name, wallet: p.wallet }))} dreams={dreams.filter((d) => d.status === "active").map((d) => ({ id: d.id, name: d.title }))} />
                </>
              )}
            </section>
          )}

          <section className="card p-5 lg:p-6">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <MessageCircle className="h-5 w-5 text-brand" /> Komentar ({list.length})
            </h2>
            <ul className="mt-3 space-y-3">
              {list.map((c) => {
                const own = c.user_id === me;
                return (
                  <li key={c.id} className={`flex ${own ? "justify-end" : ""}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${own ? "bg-brand text-white" : "bg-paper text-ink"}`}>
                      <p className={`text-[11px] font-semibold ${own ? "text-gold" : "text-muted"}`}>
                        {own ? "Saya" : personName(person(c.user_id))} · {waktu(c.created_at)}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line">{c.body}</p>
                      {(own || manage) && (
                        <form action={deleteComment} className="mt-1 text-right">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="ws" value={id} />
                          <input type="hidden" name="task" value={t.id} />
                          <PendingButton className={`text-[11px] ${own ? "text-white/70" : "text-muted"} hover:underline`}>Hapus</PendingButton>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
              {list.length === 0 && <li className="text-sm text-muted">Belum ada komentar. Tanyakan hal yang belum jelas, atau kabarkan progres di sini.</li>}
            </ul>
            <div className="mt-4">
              <CommentForm ws={id} task={t.id} />
            </div>
          </section>
        </div>

        {manage && (
          <aside className="space-y-5 lg:col-span-2">
            <section className="card p-5">
              <h2 className="mb-3 font-bold text-heading">Ubah tugas</h2>
              <EditTaskForm
                ws={id}
                task={t}
                people={people.map((p) => ({ id: p.user_id, name: p.user_id === me ? `${personName(p)} (saya)` : personName(p), pending: p.status === "invited" }))}
                sections={sections?.map((x) => ({ id: x.id, name: x.name })) ?? null}
                goals={goals.filter((g) => g.status === "active").map((g) => ({ id: g.id, name: g.title }))}
              />
            </section>
            <form action={deleteTask}>
              <input type="hidden" name="ws" value={id} />
              <input type="hidden" name="id" value={t.id} />
              <PendingButton className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger">
                <Trash2 className="h-4 w-4" /> Hapus tugas ini
              </PendingButton>
            </form>
          </aside>
        )}
      </div>
    </>
  );
}
