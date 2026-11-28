"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, HelpCircle, Lightbulb, Plus, Sparkles, Target, Trash2, X } from "lucide-react";
import { SaveStatus, useAutoSave } from "@/components/autosave";
import { saveIncome } from "@/app/actions/income";
import { saveEmergencyFund } from "@/app/actions/dreams";
import { HELP, KIND_DESC, KIND_LABEL, KIND_SEF, NO_INCOME_ROLES, SOURCE_ROLES, STEADY_TIPS, avgMonths, safeAmount, ymDiff, ymName, ymNow, ymShift, situationOf, sourcesFilled, summarize, toRows, type DreamLite, type IncomeKind, type IncomeProfile } from "@/lib/income";

type Props = {
  initial: IncomeProfile;
  isNew: boolean;
  dreams: DreamLite[];
  hint: { out: { label: string; amount: number }[]; income: number } | null;
  mode: "kondisi" | "rencana";
  ideas: string[];
  emergency?: { id: string; target: number; saved: number } | null;
};

const rp = (n: number) => (n < 0 ? "-" : "") + "Rp" + Math.abs(Math.round(n)).toLocaleString("id-ID");
const KINDS: IncomeKind[] = ["active", "massive", "passive"];
const KIND_TONE: Record<IncomeKind, string> = { active: "bg-brand", massive: "bg-gold", passive: "bg-success" };
let uid = 0;
const withIds = <T,>(xs: T[]) => xs.map((x) => ({ ...x, _k: ++uid }));

function Help({ k }: { k: keyof typeof HELP }) {
  return (
    <Link href={`/artikel/${HELP[k].slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
      <HelpCircle className="h-3.5 w-3.5" /> {HELP[k].label}
    </Link>
  );
}

function Money({ value, onChange, placeholder }: { value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted">Rp</span>
      <input
        inputMode="numeric"
        className="input py-2 pl-9 text-right tabular-nums"
        placeholder={placeholder ?? "0"}
        value={value ? value.toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
      />
    </div>
  );
}

function Section({ id, n, title, desc, help, children }: { id: string; n: number; title: string; desc: string; help?: keyof typeof HELP; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-20 p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
        <div className="min-w-0">
          <h2 className="font-bold text-heading">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{desc}</p>
          {help && (
            <div className="mt-1.5">
              <Help k={help} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Dana darurat: saran target, lalu bisa dijadikan target tabungan (pakai mekanisme tabungan mimpi & kantong). */
function EmergencyCard({ range, irregular, fund }: { range: readonly [number, number]; irregular: boolean; fund: { id: string; target: number; saved: number } | null }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [made, setMade] = useState<{ id: string; target: number } | null>(null);
  const cur = made ? { id: made.id, target: made.target, saved: fund?.saved ?? 0 } : fund;
  const go = async (target: number) => {
    setBusy(true);
    setErr("");
    const r = await saveEmergencyFund(target);
    setBusy(false);
    if (r.ok && r.id) setMade({ id: r.id, target });
    else setErr(r.error ?? "Gagal menyimpan.");
  };
  const pct = cur && cur.target > 0 ? Math.min(100, Math.round((cur.saved / cur.target) * 100)) : 0;
  return (
    <div className="card p-5">
      <p className="font-bold text-heading">🛟 Dana darurat</p>
      <p className="mt-1 text-sm leading-relaxed text-ink">
        Disarankan <b>{rp(range[0])}</b> sampai <b>{rp(range[1])}</b> ({irregular ? "6 sampai 12 bulan pengeluaran, lebih besar karena ada penghasilan tidak tetap" : "3 sampai 6 bulan pengeluaran"}). Ini bantalan saat sakit, kehilangan pekerjaan, atau bulan sepi, supaya tabungan mimpi tidak ikut terpakai.
      </p>
      {!cur ? (
        <>
          <button type="button" disabled={busy} onClick={() => go(range[0])} className="btn-primary mt-3 w-full">
            {busy ? "Menyimpan…" : `Jadikan target tabungan (${rp(range[0])})`}
          </button>
          <p className="mt-1.5 text-[11px] text-muted">Tidak wajib. Tidak mengurangi jatah mimpi Anda.</p>
        </>
      ) : (
        <>
          <div className="mt-3 flex items-baseline justify-between text-xs">
            <span className="text-muted">Terkumpul</span>
            <span className="font-semibold text-heading tabular-nums">
              {rp(cur.saved)} / {rp(cur.target)} · {pct}%
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">Menabung lewat Catat → &quot;Tabung untuk mimpi&quot; → pilih Dana darurat, seperti tabungan mimpi lainnya.</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href={`/goals/${cur.id}`} className="text-xs font-semibold text-brand hover:underline">
              Lihat detail →
            </Link>
            {cur.target < range[0] && (
              <button type="button" disabled={busy} onClick={() => go(range[0])} className="text-xs font-semibold text-brand hover:underline">
                Naikkan target ke {rp(range[0])}
              </button>
            )}
          </div>
        </>
      )}
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
    </div>
  );
}

/** Bulan baru: minta hasil bulan yang belum diisi, supaya rata-rata tetap segar. */
function CatchUp({ at, behind, onSave }: { at: string; behind: number; onSave: (vals: number[]) => void }) {
  // vals[0] = bulan paling baru (bulan lalu dari sekarang).
  const [vals, setVals] = useState<number[]>(() => Array(behind).fill(0));
  const now = ymNow();
  return (
    <div className="mb-3 rounded-lg border border-gold/50 bg-gold-soft/50 p-2.5">
      <p className="text-xs font-semibold text-heading">📅 Bulan baru! Isi hasil {behind === 1 ? `bulan ${ymName(ymShift(now, -1))}` : `${behind} bulan terakhir`} (isi 0 kalau kosong)</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {vals.map((v, i) => (
          <div key={i}>
            <p className="mb-0.5 text-[10px] text-muted">{ymName(ymShift(now, -(i + 1)))}</p>
            <Money value={v} onChange={(n) => setVals((xs) => xs.map((y, j) => (j === i ? n : y)))} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onSave(vals)} className="btn-primary mt-2 w-full py-2 text-xs">
        Simpan & hitung ulang rata-rata
      </button>
      <p className="mt-1 text-[10px] text-muted">Terakhir diperbarui {ymName(at)}.</p>
    </div>
  );
}

export function IncomeMap({ initial, isNew, dreams, hint, mode, ideas, emergency }: Props) {
  const [sources, setSources] = useState(() => {
    const rows = toRows(initial.situation, initial.sources);
    return withIds(rows.length ? rows : [{ kind: "active" as IncomeKind, name: "", amount: 0, role: "" }]);
  });
  const [expenses, setExpenses] = useState(() => withIds(initial.expenses));
  const [plans, setPlans] = useState(() => withIds(initial.plans));

  const profile: IncomeProfile = useMemo(
    () => ({ ...initial, situation: situationOf(sources), sources: sources.map(({ _k, ...s }) => s), expenses: expenses.map(({ _k, ...e }) => e), plans: plans.map(({ _k, ...p }) => p) }),
    [initial, sources, expenses, plans],
  );
  const json = JSON.stringify(profile);
  const saveState = useAutoSave(json, () => saveIncome(JSON.parse(json), "income"));
  const s = useMemo(() => summarize(profile, dreams), [profile, dreams]);
  const need = [
    { ok: profile.sources.some((x) => x.role), label: "Pilih minimal 1 kesibukan", href: "#kondisi" },
    { ok: sourcesFilled(profile.sources), label: "Isi penghasilan dari kesibukan itu", href: "#kondisi" },
    { ok: profile.expenses.some((x) => x.amount > 0), label: "Isi pengeluaran bulanan", href: "#pengeluaran" },
  ];
  const complete = need.every((n) => n.ok);

  const topExpense = [...profile.expenses].sort((a, b) => b.amount - a.amount)[0];
  const faster = s.monthsNow && s.monthsWithPlan ? s.monthsNow - s.monthsWithPlan : 0;
  const focusIdx = KINDS.indexOf(s.focus);

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {isNew && mode === "kondisi" && (
            <div className="flex items-start gap-3 rounded-2xl bg-gold-soft/70 p-4 text-sm text-ink">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p>
                <b>Isi apa adanya, tidak perlu persis.</b> Angka taksiran sudah cukup. Isian tersimpan otomatis, dan hasilnya muncul setelah 3 bagian terisi.
              </p>
            </div>
          )}

          {mode === "kondisi" && (
            <>
          <Section id="kondisi" n={1} title="Kesibukan & penghasilan Anda" desc="Setiap kesibukan, berapa hasilnya per bulan, dan jenisnya. Punya lebih dari satu? Tambahkan saja.">
            <span id="penghasilan" />
            <div className="space-y-3">
              {sources.map((x, i) => {
                const set = (patch: Partial<typeof x>) => setSources((xs) => xs.map((y, j) => (j === i ? { ...y, ...patch } : y)));
                const months = x.months?.length ? x.months : [0, 0, 0];
                const at = x.monthsAt ?? ymNow();
                const behind = x.irregular ? Math.min(6, Math.max(0, ymDiff(ymNow(), at))) : 0;
                const setMonth = (m: number, n: number) => {
                  const next = months.map((v, k) => (k === m ? n : v));
                  set({ months: next, amount: avgMonths(next), monthsAt: at });
                };
                const setMonths = (next: number[]) => set({ months: next, amount: avgMonths(next), monthsAt: at });
                return (
                  <div key={x._k} className="rounded-xl border border-line bg-paper/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">{i + 1}</span>
                      <select
                        value={x.role ?? ""}
                        onChange={(e) => {
                          const role = e.target.value;
                          const kind = SOURCE_ROLES.find(([r]) => r === role)?.[1] ?? x.kind;
                          set({ role, kind });
                        }}
                        className="input min-w-0 flex-1 py-2"
                      >
                        <option value="">Pilih kesibukan…</option>
                        {SOURCE_ROLES.map(([r]) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                        {x.role && !SOURCE_ROLES.some(([r]) => r === x.role) && <option value={x.role}>{x.role}</option>}
                      </select>
                      <button type="button" onClick={() => setSources((xs) => xs.filter((_, j) => j !== i))} aria-label="Hapus" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      value={x.name}
                      onChange={(e) => set({ name: e.target.value })}
                      maxLength={60}
                      placeholder="Ceritakan singkat. Misal: staf admin di toko bangunan"
                      className="input mt-2 py-2"
                    />

                    <p className="mt-3 text-xs font-semibold text-heading">Penghasilan dari kesibukan ini</p>
                    <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs text-ink">
                      <input type="checkbox" checked={!!x.irregular} onChange={(e) => set({ irregular: e.target.checked, months: e.target.checked ? (x.months?.length ? x.months : [x.amount, x.amount, x.amount]) : undefined, monthsAt: e.target.checked ? (x.monthsAt ?? ymNow()) : undefined })} className="h-4 w-4 accent-[var(--color-brand)]" />
                      Tidak tetap tiap bulan
                    </label>
                    {!x.irregular ? (
                      <div className="mt-2">
                        <Money value={x.amount} onChange={(n) => set({ amount: n })} placeholder="Per bulan" />
                        {x.role && NO_INCOME_ROLES.includes(x.role) && !x.amount && <p className="mt-1 text-[11px] text-muted">Belum ada penghasilan? Boleh dikosongkan.</p>}
                      </div>
                    ) : (
                      <div className="mt-2 rounded-lg bg-white p-2.5">
                        {behind > 0 && <CatchUp key={at} at={at} behind={behind} onSave={(vals) => set({ months: [...vals, ...months].slice(0, 6), amount: avgMonths([...vals, ...months].slice(0, 6)), monthsAt: ymNow() })} />}
                        <p className="text-[11px] leading-relaxed text-muted">
                          Isi hasil beberapa bulan terakhir, termasuk bulan yang kosong (isi 0). EClub menghitung rata-ratanya. Misal jadi MC: Rp0, Rp3.000.000, Rp1.500.000 → rata-rata Rp1.500.000/bulan.
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {months.map((v, m) => (
                            <div key={m}>
                              <p className="mb-0.5 text-[10px] text-muted">{ymName(ymShift(at, -(m + 1)))}</p>
                              <Money value={v} onChange={(n) => setMonth(m, n)} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex gap-3 text-[11px] font-semibold">
                            {months.length < 6 && (
                              <button type="button" onClick={() => setMonths([...months, 0])} className="text-brand">
                                + Bulan
                              </button>
                            )}
                            {months.length > 3 && (
                              <button type="button" onClick={() => setMonths(months.slice(0, -1))} className="text-muted">
                                − Bulan
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-ink">
                            Rata-rata: <b className="tabular-nums">{rp(x.amount)}</b>/bulan
                          </p>
                        </div>
                        {months.some((v) => v > 0) && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                            Untuk tabungan mimpi, EClub memakai bulan terkecil (<b className="text-ink">{rp(safeAmount({ ...x, months }))}</b>) supaya aman. Kalau ternyata lebih, anggap bonus.
                          </p>
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-xs font-semibold text-heading">Jenisnya</p>
                    <div className="mt-1.5 flex rounded-lg border border-line bg-white p-0.5">
                      {KINDS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => set({ kind: k })}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${x.kind === k ? `${KIND_TONE[k]} ${k === "massive" ? "text-heading" : "text-white"}` : "text-muted hover:text-heading"}`}
                        >
                          {KIND_LABEL[k].replace(" income", "")}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">{KIND_DESC[x.kind]}</p>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setSources((xs) => [...xs, { _k: ++uid, name: "", kind: "active" as IncomeKind, amount: 0, role: "" }])}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line py-3 text-sm font-semibold text-brand hover:border-brand/40"
              >
                <Plus className="h-4 w-4" /> {sources.length ? "Tambah kesibukan lain" : "Tambah kesibukan"}
              </button>
              {hint && hint.income > 0 && <p className="text-xs text-muted">Catatan Keuangan Anda: pemasukan pribadi 30 hari terakhir {rp(hint.income)}.</p>}
            </div>
          </Section>

          <Section id="pengeluaran" n={2} title="Pengeluaran bulanan" desc="Taksiran rata-rata sebulan. Kosongkan yang tidak ada, tambah yang belum tercantum." help="expenses">
            {hint && hint.out.length > 0 && (
              <div className="mb-4 rounded-xl border border-gold/40 bg-gold-soft/40 p-3">
                <p className="text-xs font-semibold text-heading">💡 Dari catatan Keuangan Anda (30 hari terakhir)</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hint.out.map((h) => (
                    <button
                      key={h.label}
                      type="button"
                      onClick={() => setExpenses((xs) => [...xs, { _k: ++uid, name: h.label.replace(/^\S+\s/, ""), amount: h.amount }])}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-ink hover:text-brand"
                    >
                      {h.label} · {rp(h.amount)} <Plus className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="divide-y divide-line">
              {expenses.map((x, i) => (
                <div key={x._k} className="grid grid-cols-[minmax(0,1fr)_140px_auto] items-center gap-2 py-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                  <input
                    value={x.name}
                    onChange={(e) => setExpenses((xs) => xs.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))}
                    maxLength={60}
                    className="min-w-0 bg-transparent py-1.5 text-sm text-ink outline-none focus:text-brand"
                  />
                  <Money value={x.amount} onChange={(n) => setExpenses((xs) => xs.map((y, j) => (j === i ? { ...y, amount: n } : y)))} />
                  <button type="button" onClick={() => setExpenses((xs) => xs.filter((_, j) => j !== i))} aria-label="Hapus" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setExpenses((xs) => [...xs, { _k: ++uid, name: "", amount: 0 }])} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              <Plus className="h-4 w-4" /> Tambah pengeluaran
            </button>
          </Section>

            </>
          )}

          {mode === "rencana" && (
          <Section id="rencana" n={1} title="Rencana income berikutnya" desc="Sumber penghasilan tambahan (massive income) yang ingin Anda bangun, dan targetnya per bulan." help="plans">
            <div className="space-y-2">
              {plans.map((x, i) => (
                <div key={x._k} className="grid grid-cols-[minmax(0,1fr)_140px_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                  <input
                    value={x.name}
                    onChange={(e) => setPlans((xs) => xs.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))}
                    maxLength={80}
                    placeholder="Misal: jualan frozen food"
                    className="input min-w-0 py-2"
                  />
                  <Money value={x.target} onChange={(n) => setPlans((xs) => xs.map((y, j) => (j === i ? { ...y, target: n } : y)))} placeholder="Target/bln" />
                  <button type="button" onClick={() => setPlans((xs) => xs.filter((_, j) => j !== i))} aria-label="Hapus" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setPlans((xs) => [...xs, { _k: ++uid, name: "", target: 0 }])} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              <Plus className="h-4 w-4" /> Tambah rencana
            </button>
            {ideas.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-heading">Belum ada ide? Ketuk untuk menambahkan:</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ideas
                    .filter((n) => !plans.some((p) => p.name === n))
                    .map((n) => (
                      <button key={n} type="button" onClick={() => setPlans((xs) => [...xs, { _k: ++uid, name: n, target: 0 }])} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-brand/40">
                        <Plus className="h-3 w-3 text-brand" /> {n}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </Section>
          )}
          <SaveStatus s={saveState} />
        </div>

        {/* Ringkasan langsung */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
          {!complete && (
            <div className="card p-5">
              <p className="font-bold text-heading">Hasil muncul setelah 3 isian ini lengkap</p>
              <ul className="mt-3 space-y-2">
                {need.map((n) => (
                  <li key={n.label}>
                    <a href={n.href} className="flex items-center gap-2 text-sm">
                      {n.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <Circle className="h-4 w-4 shrink-0 text-line" strokeWidth={2.4} />}
                      <span className={n.ok ? "text-muted line-through" : "text-ink"}>{n.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {mode === "rencana" && (
                <Link href="/income" className="btn-primary mt-4 w-full">
                  Lengkapi Peta Income dulu
                </Link>
              )}
            </div>
          )}
          {complete && (
          <div className="overflow-hidden rounded-3xl bg-brand text-white shadow-lift">
            <div className="p-5">
              <p className="eyebrow">Posisi income Anda</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {KINDS.map((k, i) => (
                  <div key={k} className={`rounded-xl px-2 py-2 text-center ${i === focusIdx ? "bg-white text-heading" : i < focusIdx ? "bg-white/20" : "bg-white/5 text-white/60"}`}>
                    <p className="text-[11px] font-bold">{KIND_LABEL[k].replace(" income", "")}</p>
                    <p className={`text-[10px] ${i === focusIdx ? "text-muted" : ""}`}>{KIND_SEF[k]}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-lg leading-snug font-bold">{s.stage.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/75">{s.stage.tip}</p>
            </div>
            <div className="grid grid-cols-3 border-t border-white/10 bg-black/10 text-center">
              {[
                ["Masuk", s.income],
                ["Keluar", s.expense],
                ["Sisa", s.surplus],
              ].map(([l, v]) => (
                <div key={l as string} className="px-1 py-3">
                  <p className="text-[11px] text-white/60">{l}</p>
                  <p className={`text-sm font-bold tabular-nums ${l === "Sisa" && (v as number) < 0 ? "text-orange-200" : ""}`}>{rp(v as number)}</p>
                </div>
              ))}
            </div>
          </div>

          )}
          {complete && mode === "kondisi" && s.income > 0 && (
            <div className="card p-5">
              <p className="flex items-center gap-2 font-bold text-heading">
                <Lightbulb className="h-4 w-4 text-gold" /> Aha!
              </p>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-paper">
                {KINDS.map((k) => (s[k] > 0 ? <div key={k} className={KIND_TONE[k]} style={{ width: `${(s[k] / s.income) * 100}%` }} /> : null))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {KINDS.filter((k) => s[k] > 0)
                  .map((k) => `${KIND_LABEL[k].replace(" income", "")} ${Math.round((s[k] / s.income) * 100)}%`)
                  .join(" · ")}
              </p>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink">
                {s.surplus > 0 ? (
                  <li>
                    Setiap bulan ada <b>{rp(s.surplus)}</b> ({s.saveRate}% penghasilan) yang bisa bekerja untuk mimpi Anda. Itu sekitar <b>{rp(s.surplus / 30)}</b> per hari.
                  </li>
                ) : (
                  <li>
                    Pengeluaran {s.surplus === 0 ? "sama dengan" : "lebih besar dari"} penghasilan. Langkah paling berdampak: pangkas pengeluaran terbesar dan naikkan active income.
                  </li>
                )}
                {topExpense && topExpense.amount > 0 && s.expense > 0 && (
                  <li>
                    Pengeluaran terbesar: <b>{topExpense.name || "tanpa nama"}</b>, {Math.round((topExpense.amount / s.expense) * 100)}% dari total. Hemat 10% di sini = {rp(topExpense.amount * 0.1)}/bulan.
                  </li>
                )}

                {s.passive === 0 && s.massive === 0 && <li>100% penghasilan Anda masih bergantung pada tenaga Anda. Satu massive income kecil sudah mengubah peta ini.</li>}
              </ul>
            </div>
          )}

          {complete && mode === "kondisi" && s.expense > 0 && <EmergencyCard range={s.emergency} irregular={s.irregular} fund={emergency ?? null} />}

          {complete && mode === "kondisi" && s.irregular && (
            <div className="card p-5">
              <p className="font-bold text-heading">Biar penghasilan tidak tetap lebih rutin</p>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-ink">
                {STEADY_TIPS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {complete && mode === "rencana" && (
          <div id="mimpi" className="card scroll-mt-20 p-5">
            <p className="flex items-center gap-2 font-bold text-heading">
              <Target className="h-4 w-4 text-brand" /> Sinkron dengan mimpi
            </p>
            {s.dreamRows.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Belum ada mimpi dengan target dana.{" "}
                <Link href="/goals" className="font-semibold text-brand">
                  Beri angka & tanggal di My Dreams
                </Link>{" "}
                agar EClub bisa menghitung berapa yang perlu disisihkan.
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-2">
                  {s.dreamRows.map((d) => (
                    <li key={d.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-ink">{d.title}</span>
                      <span className="shrink-0 font-semibold text-heading tabular-nums">{d.perMonth ? `${rp(d.perMonth)}/bln` : "tanpa tanggal"}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1.5 rounded-xl bg-paper p-3 text-sm">
                  {s.need > 0 && (
                    <p>
                      Perlu disisihkan <b>{rp(s.need)}</b>/bulan.{" "}
                      {s.gap > 0 ? (
                        <span className="text-danger">
                          Kurang <b>{rp(s.gap)}</b>/bulan.
                        </span>
                      ) : (
                        <span className="text-success">Sisa uang Anda cukup ✓</span>
                      )}
                    </p>
                  )}
                  {s.irregular && <p className="text-xs text-muted">Hitungan aman: penghasilan tidak tetap dihitung dari bulan terkecil, jadi sisa uang dianggap {rp(s.safeSurplus)}/bulan.</p>}
                  {s.monthsNow && <p>Dengan kondisi sekarang, semua mimpi tercapai dalam ±{s.monthsNow} bulan.</p>}
                  {faster > 0 && (
                    <p className="font-semibold text-success">
                      Jika rencana massive income berjalan: ±{s.monthsWithPlan} bulan, {faster} bulan lebih cepat! 🚀
                    </p>
                  )}
                  {s.gap > 0 && s.planned === 0 && <p className="text-muted">Tutup selisihnya dengan satu rencana massive income di langkah 4.</p>}
                </div>
              </>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <Help k="dreams" />
              <Link href="/target" className="text-xs font-semibold text-brand hover:underline">
                Pecah jadi target harian →
              </Link>
            </div>
          </div>
          )}
        </aside>
      </div>

    </div>
  );
}
