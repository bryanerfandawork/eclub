"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, BookOpen, Check, Crown, HelpCircle, Lightbulb, Lock, Plus, Sparkles, Target, Trash2, Users, X } from "lucide-react";
import { saveIncome } from "@/app/actions/income";
import { CHIPS, HELP, KIND_DESC, KIND_LABEL, KIND_SEF, recommend, summarize, type DreamLite, type IncomeKind, type IncomeProfile } from "@/lib/income";
import type { Factor } from "@/lib/disc/score";

type Course = { slug: string; title: string } | null;
type Props = {
  initial: IncomeProfile;
  isNew: boolean;
  dreams: DreamLite[];
  disc: { primary: Factor; secondary: Factor | null } | null;
  hint: { out: { label: string; amount: number }[]; income: number } | null;
  canReco: boolean;
  courses: Record<IncomeKind, Course>;
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

function Section({ id, n, title, desc, help, children }: { id: string; n: number; title: string; desc: string; help: keyof typeof HELP; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-20 p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
        <div className="min-w-0">
          <h2 className="font-bold text-heading">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{desc}</p>
          <div className="mt-1.5">
            <Help k={help} />
          </div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function IncomeMap({ initial, isNew, dreams, disc, hint, canReco, courses }: Props) {
  const [chips, setChips] = useState({ interests: initial.interests, hobbies: initial.hobbies, talents: initial.talents, passions: initial.passions });
  const [sources, setSources] = useState(() => withIds(initial.sources));
  const [expenses, setExpenses] = useState(() => withIds(initial.expenses));
  const [plans, setPlans] = useState(() => withIds(initial.plans));
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [saving, startSave] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);

  const profile: IncomeProfile = useMemo(
    () => ({ ...chips, sources: sources.map(({ _k, ...s }) => s), expenses: expenses.map(({ _k, ...e }) => e), plans: plans.map(({ _k, ...p }) => p) }),
    [chips, sources, expenses, plans],
  );
  const json = JSON.stringify(profile);
  const [savedJson, setSavedJson] = useState(isNew ? "" : json);
  const dirty = json !== savedJson;
  const s = useMemo(() => summarize(profile, dreams), [profile, dreams]);
  const reco = useMemo(() => (canReco ? recommend(profile, disc) : null), [canReco, profile, disc]);
  const chosen = chips.interests.length + chips.hobbies.length + chips.talents.length + chips.passions.length;

  const toggle = (g: keyof typeof chips, label: string) => {
    setChips((c) => ({ ...c, [g]: c[g].includes(label) ? c[g].filter((x) => x !== label) : [...c[g], label].slice(0, 20) }));
    setStatus(null);
  };
  const addCustom = (g: keyof typeof chips) => {
    const v = (custom[g] ?? "").trim().slice(0, 40);
    if (v && !chips[g].includes(v)) toggle(g, v);
    setCustom((c) => ({ ...c, [g]: "" }));
  };
  const save = () =>
    startSave(async () => {
      const r = await saveIncome(profile);
      setStatus(r);
      if (r.ok) setSavedJson(json);
    });

  const topExpense = [...profile.expenses].sort((a, b) => b.amount - a.amount)[0];
  const faster = s.monthsNow && s.monthsWithPlan ? s.monthsNow - s.monthsWithPlan : 0;
  const focusIdx = KINDS.indexOf(s.focus);

  return (
    <div className="pb-24 lg:pb-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {isNew && (
            <div className="flex items-start gap-3 rounded-2xl bg-gold-soft/70 p-4 text-sm text-ink">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p>
                <b>Isi apa adanya, tidak perlu persis.</b> Angka taksiran sudah cukup untuk melihat posisi Anda. Hasilnya langsung muncul {""}
                <span className="hidden lg:inline">di samping</span>
                <span className="lg:hidden">di bawah</span> sambil Anda mengisi.
              </p>
            </div>
          )}

          <Section id="diri" n={1} title="Kenali diri Anda" desc="Pilih yang paling terasa. Boleh lebih dari satu, boleh tambah sendiri." help="self">
            <div className="space-y-5">
              {(Object.keys(CHIPS) as (keyof typeof CHIPS)[]).map((g) => {
                const list = [...CHIPS[g].items.map(([l]) => l), ...chips[g].filter((x) => !CHIPS[g].items.some(([l]) => l === x))];
                return (
                  <div key={g}>
                    <p className="text-sm font-semibold text-heading">
                      {CHIPS[g].title} <span className="font-normal text-muted">· {CHIPS[g].q}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {list.map((l) => {
                        const on = chips[g].includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggle(g, l)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"}`}
                          >
                            {on && <Check className="h-3 w-3" />} {l}
                          </button>
                        );
                      })}
                      <span className="inline-flex items-center rounded-full border border-dashed border-line bg-white pr-1 pl-3">
                        <input
                          value={custom[g] ?? ""}
                          onChange={(e) => setCustom((c) => ({ ...c, [g]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustom(g);
                            }
                          }}
                          maxLength={40}
                          placeholder="Tambah sendiri…"
                          className="w-28 bg-transparent py-1.5 text-xs outline-none"
                        />
                        <button type="button" onClick={() => addCustom(g)} aria-label="Tambah" className="grid h-6 w-6 place-items-center rounded-full text-brand hover:bg-paper">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section id="penghasilan" n={2} title="Penghasilan Anda sekarang" desc="Rata-rata per bulan. Pilih jenisnya: active, massive, atau passive." help="sources">
            <div className="space-y-3">
              {sources.map((x, i) => (
                <div key={x._k} className="rounded-xl border border-line bg-paper/50 p-3">
                  <div className="flex gap-2">
                    <input
                      value={x.name}
                      onChange={(e) => setSources((xs) => xs.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))}
                      maxLength={60}
                      placeholder="Misal: Gaji, uang saku, jualan online"
                      className="input min-w-0 flex-1 py-2"
                    />
                    <button type="button" onClick={() => setSources((xs) => xs.filter((_, j) => j !== i))} aria-label="Hapus" className="grid w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_180px]">
                    <div className="flex rounded-lg border border-line bg-white p-0.5">
                      {KINDS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          title={KIND_DESC[k]}
                          onClick={() => setSources((xs) => xs.map((y, j) => (j === i ? { ...y, kind: k } : y)))}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${x.kind === k ? `${KIND_TONE[k]} ${k === "massive" ? "text-heading" : "text-white"}` : "text-muted hover:text-heading"}`}
                        >
                          {KIND_LABEL[k].replace(" income", "")}
                        </button>
                      ))}
                    </div>
                    <Money value={x.amount} onChange={(n) => setSources((xs) => xs.map((y, j) => (j === i ? { ...y, amount: n } : y)))} />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["Gaji / honor", "active"],
                  ["Uang saku", "active"],
                  ["Jualan / usaha", "active"],
                  ["Freelance", "active"],
                  ["Side hustle", "massive"],
                  ["Investasi / sewa", "passive"],
                ].map(([n, k]) => (
                  <button key={n} type="button" onClick={() => setSources((xs) => [...xs, { _k: ++uid, name: n, kind: k as IncomeKind, amount: 0 }])} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-brand/40">
                    <Plus className="h-3 w-3 text-brand" /> {n}
                  </button>
                ))}
              </div>
              {hint && hint.income > 0 && <p className="text-xs text-muted">Catatan Keuangan Anda: pemasukan pribadi 30 hari terakhir {rp(hint.income)}.</p>}
            </div>
          </Section>

          <Section id="pengeluaran" n={3} title="Pengeluaran bulanan" desc="Taksiran rata-rata sebulan. Kosongkan yang tidak ada, tambah yang belum tercantum." help="expenses">
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

          <Section id="rencana" n={4} title="Rencana massive income" desc="Sumber penghasilan tambahan yang ingin Anda bangun, dan targetnya per bulan." help="plans">
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
            <p className="mt-2 text-xs text-muted">Belum ada ide? Lihat rekomendasi di bagian bawah.</p>
          </Section>
        </div>

        {/* Ringkasan langsung */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
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

          {s.income > 0 && (
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
                {s.expense > 0 && (
                  <li>
                    Dana darurat ideal: <b>{rp(s.emergency[0])}</b> sampai <b>{rp(s.emergency[1])}</b> (3 sampai 6 bulan pengeluaran). Siapkan ini sebelum passive income.
                  </li>
                )}
                {s.passive === 0 && s.massive === 0 && <li>100% penghasilan Anda masih bergantung pada tenaga Anda. Satu massive income kecil sudah mengubah peta ini.</li>}
              </ul>
            </div>
          )}

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

          <div className="hidden lg:block">
            <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} />
          </div>
        </aside>
      </div>

      {/* Rekomendasi */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Rekomendasi untuk Anda</p>
            <h2 className="mt-1 text-xl font-bold text-heading">Ide active, massive, dan passive income yang nyambung dengan Anda</h2>
          </div>
          {canReco && <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-brand"><Crown className="h-3.5 w-3.5" /> Plus</span>}
        </div>
        {reco ? (
          <>
            {(!disc || chosen < 3) && (
              <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-muted">
                {!disc ? (
                  <>
                    Agar lebih tajam, <Link href="/disc" className="font-semibold text-brand">isi Tes DISC</Link> (gratis, 10 menit).{" "}
                  </>
                ) : null}
                {chosen < 3 ? "Pilih lebih banyak minat, hobi, bakat, dan passion di langkah 1." : ""}
              </p>
            )}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {KINDS.map((k) => (
                <div key={k} className="card flex flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${KIND_TONE[k]}`} />
                    <p className="font-bold text-heading">{KIND_LABEL[k]}</p>
                    <span className="ml-auto text-[11px] text-muted">{KIND_SEF[k]}</span>
                  </div>
                  <ul className="mt-3 flex-1 space-y-4">
                    {reco[k].map((r) => (
                      <li key={r.id}>
                        <p className="text-sm font-semibold text-heading">{r.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted">{r.how}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {r.reasons.map((x) => (
                            <span key={x} className="rounded-full bg-gold-soft/70 px-2 py-0.5 text-[11px] text-ink">
                              ✓ {x}
                            </span>
                          ))}
                          <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted">modal {r.capital}</span>
                          {k === "massive" && !plans.some((p) => p.name === r.name) && (
                            <button type="button" onClick={() => setPlans((xs) => [...xs, { _k: ++uid, name: r.name, target: 0 }])} className="text-[11px] font-semibold text-brand hover:underline">
                              + Jadikan rencana
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {courses[k] && (
                    <Link href={`/learn/${courses[k]!.slug}`} className="mt-4 flex items-center gap-2 rounded-xl bg-paper p-3 text-xs font-semibold text-heading hover:text-brand">
                      <BookOpen className="h-4 w-4 shrink-0 text-brand" /> <span className="min-w-0 flex-1">Kelas: {courses[k]!.title}</span> <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Rekomendasi ini disusun dari aturan EClub (gaya DISC + pilihan Anda), bukan nasihat keuangan. Pelajari risiko sebelum berinvestasi.</p>
          </>
        ) : (
          <div className="relative mt-4 overflow-hidden rounded-3xl border border-line">
            <div className="pointer-events-none grid gap-4 p-5 blur-[6px] select-none lg:grid-cols-3" aria-hidden>
              {KINDS.map((k) => (
                <div key={k} className="card p-5">
                  <p className="font-bold text-heading">{KIND_LABEL[k]}</p>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="mt-4">
                      <div className="h-3 w-3/4 rounded bg-heading/30" />
                      <div className="mt-2 h-2 w-full rounded bg-muted/20" />
                      <div className="mt-1 h-2 w-5/6 rounded bg-muted/20" />
                      <div className="mt-2 h-4 w-1/2 rounded-full bg-gold/30" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center bg-white/40 p-5">
              <div className="max-w-md rounded-3xl bg-brand p-6 text-center text-white shadow-lift">
                <Lock className="mx-auto h-7 w-7 text-gold" />
                <p className="mt-2 text-lg font-bold">9 ide income khusus untuk Anda</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                  Member Plus mendapat rekomendasi active, massive, dan passive income yang dicocokkan dengan gaya DISC, minat, bakat, dan mimpi, lengkap dengan kelas yang perlu dipelajari.
                </p>
                <Link href="/paket" className="btn-gold mt-4">
                  <Crown className="h-4 w-4" /> Buka dengan Plus
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="card mt-5 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <Users className="h-8 w-8 shrink-0 text-brand" />
          <div className="flex-1">
            <p className="font-bold text-heading">Bingung memilih jalan yang paling pas?</p>
            <p className="mt-0.5 text-sm text-muted">Konsultasikan Peta Income Anda di sesi mentoring 1-on-1. Mentor membantu menyaring ide dan menyusun langkah 90 hari.</p>
          </div>
          <Link href="/mentoring" className="btn-primary shrink-0">
            Konsultasi <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[64px] z-30 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted">Sisa uang / bulan</p>
            <p className={`text-sm font-bold tabular-nums ${s.surplus < 0 ? "text-danger" : "text-heading"}`}>{rp(s.surplus)}</p>
          </div>
          <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} compact />
        </div>
      </div>
    </div>
  );
}

function SaveBar({ dirty, saving, status, onSave, compact }: { dirty: boolean; saving: boolean; status: { ok?: boolean; error?: string } | null; onSave: () => void; compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-2" : "space-y-2"}>
      <button type="button" onClick={onSave} disabled={saving || (!dirty && !status?.error)} className={`btn-primary ${compact ? "" : "w-full py-3"}`}>
        {saving ? "Menyimpan…" : dirty ? "Simpan Peta Income" : <><Check className="h-4 w-4" /> Tersimpan</>}
      </button>
      {status?.error && <p className={`text-xs text-danger ${compact ? "max-w-[140px]" : ""}`}>{status.error}</p>}
    </div>
  );
}
