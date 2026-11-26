import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronLeft, Circle, Trash2 } from "lucide-react";
import { deleteAction, deleteDream, setDreamStatus, toggleAction } from "@/app/actions/dreams";
import { ProgressBar } from "@/components/ui";
import { getDream } from "@/lib/data";
import { dreamProgress, monthsUntil, rupiah, tanggal, todayJakarta } from "@/lib/format";
import { AddActionForm, AddSavingForm, SetTargetForm } from "./client";
import { MoreDreams } from "@/components/more-dreams";
import { getLimit } from "@/lib/plans";
import { getPockets } from "@/lib/finance-server";
import { DreamLinks } from "@/components/links/dream-links";
import { QuickPlan } from "@/components/links/quick-plan";

export default async function DreamDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pertama?: string }> }) {
  const { id } = await params;
  const first = (await searchParams).pertama === "1";
  const limit = first ? await getLimit("dreams") : null;
  const result = await getDream(id);
  if (!result) notFound();
  const { dream: d, actions } = result;

  const p = dreamProgress(d.target_amount, d.saved_amount);
  const months = monthsUntil(d.target_date);
  const remaining = Math.max(0, (d.target_amount ?? 0) - d.saved_amount);
  const perMonth = d.target_amount && months ? Math.ceil(remaining / months) : null;
  const doneCount = actions.filter((a) => a.done).length;
  const kept = (await getPockets()).flatMap((pk) => (pk.earmarks ?? []).filter((e) => e.dream_id === d.id).map((e) => ({ name: pk.name, amount: e.amount })));

  return (
    <>
      <Link href="/goals" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-heading">
        <ChevronLeft className="h-4 w-4" /> Mimpi saya
      </Link>

      {first && <MoreDreams canAdd={limit == null || limit > 1} nextHref={d.target_amount && d.target_date ? "/my-life" : "#target"} nextLabel={d.target_amount && d.target_date ? "Lanjut: Definisi sukses & nilai hidup" : "Lanjut: beri angka & tanggal"} />}
      <section className="relative animate-rise overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-lift lg:p-8">
        <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-gold">{d.category}</span>
        <h1 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight lg:text-3xl">{d.title}</h1>
        {d.why && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">“{d.why}”</p>}
        {d.target_amount ? (
          <div className="mt-6 max-w-xl">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-x-3">
              <span className="text-2xl font-bold">{rupiah(d.saved_amount)}</span>
              <span className="text-sm whitespace-nowrap text-white/60">dari {rupiah(d.target_amount)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(p, 2)}%` }} />
            </div>
          </div>
        ) : null}
        {kept.length > 0 && (
          <p className="mt-3 text-sm text-white/80">
            🐷 Disimpan di: {kept.map((k) => `${k.name} ${rupiah(k.amount)}`).join(" · ")}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {d.target_date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold" /> {tanggal(d.target_date)}
            </span>
          )}
          {perMonth != null && (
            <span>
              Sisihkan <b className="text-white">{rupiah(perMonth)}</b>/bulan (≈ {rupiah(Math.ceil(perMonth / 30))}/hari)
            </span>
          )}
          {d.target_amount && d.target_date ? (
            <Link href="/target" className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-brand-deep hover:brightness-105">
              🎯 Ubah jadi target jualan harian
            </Link>
          ) : null}
        </div>
      </section>

      {(!d.target_amount || !d.target_date) && (
        <div className="mt-6">
          <SetTargetForm dreamId={d.id} amount={d.target_amount} date={d.target_date} />
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-5 lg:gap-6">
        <section className="card p-5 lg:col-span-3 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-heading">Langkah aksi</h2>
            <span className="text-xs font-medium text-muted">
              {doneCount}/{actions.length} selesai
            </span>
          </div>
          {actions.length > 0 && (
            <div className="mt-3">
              <ProgressBar value={actions.length ? (doneCount / actions.length) * 100 : 0} tone="brand" />
            </div>
          )}
          <ul className="mt-4 divide-y divide-line">
            {actions.map((a) => (
              <li key={a.id} className="group flex items-center gap-3 py-2.5">
                <form action={toggleAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="done" value={String(a.done)} />
                  <button className="grid place-items-center" aria-label={a.done ? "Tandai belum" : "Tandai selesai"}>
                    {a.done ? (
                      <CheckCircle2 className="h-[22px] w-[22px] text-success" />
                    ) : (
                      <Circle className="h-[22px] w-[22px] text-line hover:text-heading/40" strokeWidth={2.2} />
                    )}
                  </button>
                </form>
                <span className={`flex-1 text-[15px] ${a.done ? "text-muted line-through" : "text-ink"}`}>{a.title}</span>
                {!a.done && d.status === "active" && <QuickPlan compact title={a.title} date={todayJakarta()} dreamId={d.id} label="Kerjakan hari ini" />}
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="rounded-lg p-1.5 text-muted opacity-60 hover:bg-paper hover:text-danger lg:opacity-0 lg:group-hover:opacity-100" aria-label="Hapus langkah">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {actions.length === 0 && <p className="mt-2 text-sm text-muted">Pecah mimpi ini menjadi langkah kecil yang bisa dikerjakan minggu ini.</p>}
          <AddActionForm dreamId={d.id} />
          {actions.some((a) => !a.done) && <p className="mt-2 text-xs text-muted">Tekan “Kerjakan hari ini” supaya langkah masuk ke Laporan Harian dan diingatkan malam hari.</p>}
        </section>

        <aside className="space-y-5 lg:col-span-2">
          {d.target_amount ? (
            <section className="card p-5 lg:p-6">
              <h2 className="font-bold text-heading">Catat tabungan</h2>
              <p className="mt-1 text-sm text-muted">Sisa {rupiah(remaining)} lagi.</p>
              <AddSavingForm dreamId={d.id} />
            </section>
          ) : null}
          <section className="card p-5 lg:p-6">
            <h2 className="font-bold text-heading">Status</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["active", "Aktif"],
                  ["achieved", "Tercapai"],
                  ["paused", "Ditunda"],
                ] as const
              ).map(([value, label]) => (
                <form key={value} action={setDreamStatus}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="status" value={value} />
                  <button
                    className={`w-full rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                      d.status === value ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-paper"
                    }`}
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
            <form action={deleteDream} className="mt-5 border-t border-line pt-4">
              <input type="hidden" name="id" value={d.id} />
              <button className="flex items-center gap-2 text-sm font-medium text-danger/80 hover:text-danger">
                <Trash2 className="h-4 w-4" /> Hapus mimpi ini
              </button>
            </form>
          </section>
        </aside>
      </div>

      {d.status !== "achieved" && <DreamLinks dreamId={d.id} hasTarget={!!(d.target_amount && d.target_date)} hasSavings={kept.length > 0} />}
    </>
  );
}
