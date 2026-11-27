"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ArrowRight } from "lucide-react";
import { saveTx } from "@/app/actions/finance";
import { CATEGORIES, MOVE, TRANSFERS, WALLET_LABEL, type TxKind, type Wallet } from "@/lib/finance";
import Link from "next/link";
import { earmarked, freeBalance, providerOf, type Pocket, type PocketType } from "@/lib/pockets";
import { DEFAULT_TEASER } from "@/lib/assistant-config";
import { PocketBadge } from "./pocket-badge";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/app/actions/auth";

export type QuickPreset = { kind?: TxKind; wallet?: Wallet; category?: string };
const EVENT = "eclub:catat";

/** Buka lembar "Catat" dari mana saja (tombol petunjuk, kartu kosong, dll). */
export function openQuickAdd(preset: QuickPreset = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: preset }));
}

export function CatatButton({ preset, className, children }: { preset?: QuickPreset; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => openQuickAdd(preset)} className={className}>
      {children}
    </button>
  );
}

function jakarta(offset: number) {
  return new Date(Date.now() + offset * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export type DreamOpt = { id: string; title: string };

export function QuickAdd({ defaultWallet, pockets = [], plus = false, fab = true, dreams = [], teaser = DEFAULT_TEASER }: { defaultWallet: Wallet; pockets?: Pocket[]; plus?: boolean; fab?: boolean; dreams?: DreamOpt[]; teaser?: string[] }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<QuickPreset>({});
  const [n, setN] = useState(0); // reset form setiap kali dibuka

  useEffect(() => {
    const h = (e: Event) => {
      setPreset((e as CustomEvent<QuickPreset>).detail ?? {});
      setN((x) => x + 1);
      setOpen(true);
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {fab && <button
        type="button"
        onClick={() => openQuickAdd({})}
        className="fixed bottom-[112px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-lift transition hover:bg-brand-soft active:scale-95 lg:right-28 lg:bottom-8 lg:left-auto lg:translate-x-0 print:hidden"
      >
        <Plus className="h-5 w-5 text-gold" strokeWidth={2.5} /> Catat
      </button>}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center" onClick={() => setOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[92dvh] w-full max-w-lg animate-rise overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-lift sm:rounded-3xl sm:p-6">
              <Sheet key={n} preset={preset} defaultWallet={defaultWallet} pockets={pockets} plus={plus} dreams={dreams} teaser={teaser} onDone={() => setOpen(false)} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const KINDS: { k: TxKind; label: string }[] = [
  { k: "out", label: "Pengeluaran" },
  { k: "in", label: "Pemasukan" },
  { k: "transfer", label: "Pindah dana" },
];

function PocketPick({ label, list, value, onChange, always = false }: { label: string; list: Pocket[]; value: string; onChange: (id: string) => void; always?: boolean }) {
  if (list.length < (always ? 1 : 2)) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm font-semibold transition ${value === p.id ? "border-brand bg-brand/5 text-heading" : "border-line text-ink hover:bg-paper"}`}
          >
            <PocketBadge type={p.type} provider={p.provider} size={26} /> {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const rp = (n: number) => `Rp${Math.max(0, n).toLocaleString("id-ID")}`;

/** Deretan kantong di bawah pilihan dompet. Gratis: bank/e-wallet tampil terkunci (pop-up Plus). Plus: kantong sendiri + tambah. */
function WalletPockets({ list, value, onChange, plus, onLocked, teaserKeys }: { list: Pocket[]; value: string; onChange: (id: string) => void; plus: boolean; onLocked: () => void; teaserKeys: string[] }) {
  const used = new Set(list.map((p) => p.provider));
  const teaser = plus ? [] : teaserKeys.filter((k) => !used.has(k) && providerOf(k));
  return (
    <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {list.length === 0 && (
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-brand bg-brand/5 py-1 pr-3 pl-1 text-sm font-semibold text-heading">
          <PocketBadge type="cash" provider={null} size={26} /> Cash / Dompet
        </span>
      )}
      {list.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm font-semibold transition ${value === p.id ? "border-brand bg-brand/5 text-heading" : "border-line text-ink hover:bg-paper"}`}
        >
          <PocketBadge type={p.type} provider={p.provider} size={26} /> {p.name}
          {earmarked(p) > 0 && <span title="Ada tabungan mimpi">🐷</span>}
        </button>
      ))}
      {teaser.map((k) => {
        const pv = providerOf(k)!;
        return (
          <button key={k} type="button" onClick={onLocked} className="flex shrink-0 items-center gap-2 rounded-full border border-dashed border-line py-1 pr-3 pl-1 text-sm font-semibold text-muted opacity-70 grayscale hover:opacity-100">
            <PocketBadge type={pv.type} provider={k} size={26} /> {pv.label} <span className="text-[10px]">🔒</span>
          </button>
        );
      })}
      {plus && (
        <Link href="/keuangan/kantong" className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm font-semibold text-brand hover:border-gold">
          <Plus className="h-4 w-4" /> Tambahkan kantong lain
        </Link>
      )}
    </div>
  );
}

function Upsell({ onClose, teaser }: { onClose: () => void; teaser: string[] }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-rise rounded-3xl bg-white p-5 text-center shadow-lift">
        <div className="flex justify-center gap-1.5">
          {teaser.filter((k) => providerOf(k)).slice(0, 6).map((k) => (
            <PocketBadge key={k} type={providerOf(k)!.type as PocketType} provider={k} size={34} />
          ))}
        </div>
        <p className="mt-4 text-lg font-bold text-heading">Pisahkan uang per kantong</p>
        <p className="mt-1 text-sm text-muted">
          Dengan <b className="text-heading">EClub Plus</b>, catat uang di setiap tempatnya: tunai, BCA, BRI, Mandiri, DANA, ShopeePay, atau kantong buatan Anda sendiri. Saldo tiap kantong selalu cocok dengan aslinya, plus bisa pindah antar kantong, grafik 6 bulan, dan ekspor Excel.
        </p>
        <Link href="/paket" className="btn-primary mt-4 w-full py-3">
          Upgrade ke Plus
        </Link>
        <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-sm font-semibold text-muted">
          Nanti saja
        </button>
      </div>
    </div>
  );
}

function Sheet({ preset, defaultWallet, pockets, plus, dreams, teaser, onDone }: { preset: QuickPreset; defaultWallet: Wallet; pockets: Pocket[]; plus: boolean; dreams: DreamOpt[]; teaser: string[]; onDone: () => void }) {
  const [upsell, setUpsell] = useState(false);
  const [dreamId, setDreamId] = useState(dreams[0]?.id ?? "");
  const [dreamMode, setDreamMode] = useState<"" | "for" | "other">("");
  const [dreamPick, setDreamPick] = useState("");
  const [kind, setKind] = useState<TxKind>(preset.kind ?? "out");
  const [wallet, setWallet] = useState<Wallet>(preset.wallet ?? defaultWallet);
  const [category, setCategory] = useState(preset.category ?? "");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState<"0" | "-1" | "custom">("0");
  const [custom, setCustom] = useState(jakarta(0));
  const [note, setNote] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(saveTx, {});
  const first = (w: Wallet) => pockets.find((p) => p.wallet === w)?.id ?? "";
  const [pocket, setPocket] = useState(first(preset.wallet ?? defaultWallet));
  const [fromP, setFromP] = useState("");
  const [toP, setToP] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) amountRef.current?.focus();
  }, []);
  useEffect(() => {
    if (state?.message) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [state, onDone]);

  const cats = kind === "transfer" ? [] : CATEGORIES[wallet][kind];
  const date = day === "custom" ? custom : jakarta(Number(day));
  const tone = kind === "in" ? "text-success" : kind === "out" ? "text-brand" : "text-heading";

  if (state?.message)
    return (
      <div className="py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-3xl">✓</div>
        <p className="mt-4 text-lg font-bold text-heading">Tersimpan</p>
        <p className="text-sm text-muted">Catatan Anda sudah masuk.</p>
      </div>
    );

  return (
    <form action={action}>
      {upsell && <Upsell onClose={() => setUpsell(false)} teaser={teaser} />}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-heading">Catat transaksi</h2>
        <button type="button" onClick={onDone} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-paper" aria-label="Tutup">
          <X className="h-5 w-5" />
        </button>
      </div>

      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="wallet" value={wallet} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tx_date" value={date} />
      <input type="hidden" name="dream_mode" value={dreamMode} />
      <input type="hidden" name="dream_pick" value={dreamPick} />
      {kind === "transfer" && category === "tabung" && <input type="hidden" name="dream_id" value={dreamId} />}
      {kind === "transfer" ? (
        <>
          <input type="hidden" name="pocket_id" value={category === "tabung" && !plus ? toP : fromP} />
          <input type="hidden" name="to_pocket_id" value={toP} />
        </>
      ) : (
        <input type="hidden" name="pocket_id" value={pocket} />
      )}

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-paper p-1">
        {KINDS.map((x) => (
          <button
            key={x.k}
            type="button"
            onClick={() => {
              setKind(x.k);
              setCategory(x.k === "transfer" ? "gaji_diri" : "");
            }}
            className={`rounded-xl py-2 text-sm font-semibold transition ${kind === x.k ? "bg-white text-heading shadow-soft" : "text-muted"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {kind !== "transfer" && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-muted">Dompet:</span>
          {(["personal", "business"] as Wallet[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setWallet(w);
                setCategory("");
                setPocket(first(w));
              }}
              className={`rounded-full border px-3.5 py-1.5 font-semibold transition ${wallet === w ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-paper"}`}
            >
              {w === "personal" ? "🙂" : "🏪"} {WALLET_LABEL[w]}
            </button>
          ))}
        </div>
      )}
      {kind !== "transfer" && <WalletPockets teaserKeys={teaser} list={pockets.filter((p) => p.wallet === wallet)} value={pocket} onChange={setPocket} plus={plus} onLocked={() => setUpsell(true)} />}

      <label className="mt-5 block">
        <span className="text-xs font-medium text-muted">Nominal</span>
        <div className={`mt-1 flex items-baseline gap-2 border-b-2 border-line pb-1 focus-within:border-brand ${tone}`}>
          <span className="text-xl font-semibold">Rp</span>
          <input
            ref={amountRef}
            name="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
              setAmount(v ? v.toLocaleString("id-ID") : "");
            }}
            className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-line"
          />
        </div>
      </label>

      {kind === "transfer" ? (
        <div className="mt-5 space-y-2">
          {dreams.length > 0 && pockets.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCategory("tabung");
                setToP(first("personal"));
                setFromP(first("personal"));
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${category === "tabung" ? "border-brand bg-brand/5" : "border-gold/50 bg-gold-soft/30 hover:bg-gold-soft/60"}`}
            >
              <span className="text-2xl">🐷</span>
              <span className="flex-1">
                <span className="font-semibold text-heading">Tabung untuk mimpi</span>
                <span className="block text-xs text-muted">Sisihkan uang di kantong untuk mimpi pilihan. Tabungan mimpinya ikut bertambah.</span>
              </span>
            </button>
          )}
          {category === "tabung" && (
            <div className="space-y-3 rounded-2xl bg-paper p-3.5">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Untuk mimpi:</p>
                <div className="flex flex-wrap gap-2">
                  {dreams.map((d) => (
                    <button key={d.id} type="button" onClick={() => setDreamId(d.id)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${dreamId === d.id ? "border-brand bg-brand text-white" : "border-line bg-white text-ink"}`}>
                      ✨ {d.title}
                    </button>
                  ))}
                </div>
              </div>
              <PocketPick label="Disimpan di kantong:" list={pockets} value={toP} onChange={setToP} always />
              {plus && <PocketPick label="Diambil dari kantong:" list={pockets} value={fromP} onChange={setFromP} always />}
              {(() => {
                const src = pockets.find((p) => p.id === (plus ? fromP : toP));
                return src ? <p className="text-xs text-muted">Saldo bebas {src.name}: {rp(freeBalance(src))}</p> : null;
              })()}
            </div>
          )}
          {TRANSFERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setCategory(t.key);
                setFromP(first(t.from));
                setToP(first(t.to));
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${category === t.key ? "border-brand bg-brand/5" : "border-line hover:bg-paper"}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="flex-1">
                <span className="flex items-center gap-1.5 font-semibold text-heading">
                  {t.label}
                  <span className="flex items-center gap-1 text-xs font-medium text-muted">
                    ({WALLET_LABEL[t.from]} <ArrowRight className="h-3 w-3" /> {WALLET_LABEL[t.to]})
                  </span>
                </span>
                <span className="block text-xs text-muted">{t.hint}</span>
              </span>
            </button>
          ))}
          {pockets.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (!plus) return setUpsell(true);
                setCategory(MOVE.key);
                setFromP(pockets[0]?.id ?? "");
                setToP(pockets[1]?.id ?? "");
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${plus ? "" : "opacity-70"} ${category === MOVE.key ? "border-brand bg-brand/5" : "border-line hover:bg-paper"}`}
            >
              <span className="text-2xl">{MOVE.emoji}</span>
              <span className="flex-1">
                <span className="flex items-center gap-1.5 font-semibold text-heading">
                  {MOVE.label} {!plus && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-brand">PLUS</span>}
                </span>
                <span className="block text-xs text-muted">{MOVE.hint}</span>
              </span>
            </button>
          )}
          {(() => {
            const tr = TRANSFERS.find((t) => t.key === category);
            const from = category === MOVE.key ? pockets : pockets.filter((p) => p.wallet === tr?.from);
            const to = category === MOVE.key ? pockets.filter((p) => p.id !== fromP) : pockets.filter((p) => p.wallet === tr?.to);
            return (
              <>
                <PocketPick label="Dari kantong:" list={from} value={fromP} onChange={(id) => { setFromP(id); if (id === toP) setToP(pockets.find((p) => p.id !== id)?.id ?? ""); }} always={category === MOVE.key} />
                <PocketPick label="Ke kantong:" list={to} value={toP} onChange={setToP} always={category === MOVE.key} />
              </>
            );
          })()}
        </div>
      ) : (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-muted">Untuk apa?</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {cats.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-center transition ${category === c.key ? "border-brand bg-brand/5" : "border-transparent bg-paper hover:border-line"}`}
              >
                <span className="text-2xl leading-none">{c.emoji}</span>
                <span className="line-clamp-2 text-[11px] leading-tight font-medium text-ink">{c.label}</span>
              </button>
            ))}
          </div>
          {category === "tabungan" && dreams.length > 0 && (
            <p className="mt-2 rounded-xl bg-gold-soft/50 px-3 py-2 text-xs text-heading">
              Tip: pakai <b>Pindah dana › Tabung untuk mimpi</b> supaya uangnya tetap di kantong Anda dan tercatat sebagai tabungan mimpi.
            </p>
          )}
          {(() => {
            const p = pockets.find((x) => x.id === pocket);
            const amt = Number(amount.replace(/[^\d]/g, "")) || 0;
            if (kind !== "out" || !p || !p.earmarks?.length || amt <= Math.max(0, freeBalance(p))) return null;
            const over = Math.min(amt - Math.max(0, freeBalance(p)), earmarked(p));
            const marks = p.earmarks;
            return (
              <div className="mt-4 rounded-2xl border border-gold bg-gold-soft/40 p-3.5">
                <p className="text-sm font-bold text-heading">🐷 Uang ini sudah Anda sisihkan untuk mimpi</p>
                <p className="mt-0.5 text-xs text-muted">
                  Di {p.name}: {marks.map((e) => `${e.title} ${rp(e.amount)}`).join(", ")}. Pengeluaran ini memakai {rp(over)} dari tabungan tersebut. Untuk apa?
                </p>
                <div className="mt-2.5 space-y-1.5">
                  {marks.map((e) => (
                    <button key={e.dream_id} type="button" onClick={() => { setDreamMode("for"); setDreamPick(e.dream_id); }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${dreamMode === "for" && dreamPick === e.dream_id ? "border-brand bg-white text-heading" : "border-line bg-white/60 text-ink"}`}>
                      ✅ Memang untuk mimpi &quot;{e.title}&quot;
                    </button>
                  ))}
                  <button type="button" onClick={() => { setDreamMode("other"); setDreamPick(marks.length === 1 ? marks[0].dream_id : ""); }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${dreamMode === "other" ? "border-danger bg-white text-danger" : "border-line bg-white/60 text-ink"}`}>
                    ⚠️ Untuk keperluan lain
                  </button>
                </div>
                {dreamMode === "other" && (
                  <div className="mt-2.5">
                    <p className="text-xs font-medium text-heading">Mimpi mana yang dikorbankan? Tabungannya berkurang {rp(over)}, jadi sisa target menabungnya bertambah.</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {marks.map((e) => (
                        <button key={e.dream_id} type="button" onClick={() => setDreamPick(e.dream_id)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${dreamPick === e.dream_id ? "border-danger bg-danger text-white" : "border-line bg-white"}`}>
                          {e.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {(
          [
            ["0", "Hari ini"],
            ["-1", "Kemarin"],
            ["custom", "Pilih tanggal"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setDay(v)}
            className={`rounded-full border px-3.5 py-1.5 font-medium transition ${day === v ? "border-heading bg-heading text-white" : "border-line text-ink hover:bg-paper"}`}
          >
            {l}
          </button>
        ))}
        {day === "custom" && <input type="date" value={custom} max={jakarta(0)} onChange={(e) => setCustom(e.target.value)} className="input w-auto py-1.5" />}
      </div>

      {note ? (
        <input name="note" maxLength={200} placeholder="Catatan (opsional), misal: belanja di pasar" className="input mt-4" autoFocus />
      ) : (
        <button type="button" onClick={() => setNote(true)} className="mt-4 text-sm font-semibold text-brand/80 hover:text-brand">
          + Tambah catatan
        </button>
      )}

      {state?.error && <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{state?.error}</p>}

      <SubmitButton className="btn-primary mt-5 w-full py-3.5 text-base">Simpan</SubmitButton>
    </form>
  );
}

export function DeleteTx({ id, action }: { id: string; action: (fd: FormData) => Promise<void> }) {
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <button type="button" onClick={() => setAsk(true)} className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-paper hover:text-danger" aria-label="Hapus">
        ✕
      </button>
    );
  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <button className="rounded-lg bg-danger px-2 py-1 text-xs font-semibold text-white">Hapus</button>
      <button type="button" onClick={() => setAsk(false)} className="rounded-lg px-2 py-1 text-xs text-muted">
        Batal
      </button>
    </form>
  );
}
