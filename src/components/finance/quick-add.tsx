"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ArrowRight } from "lucide-react";
import { saveTx } from "@/app/actions/finance";
import { CATEGORIES, MOVE, TRANSFERS, WALLET_LABEL, type TxKind, type Wallet } from "@/lib/finance";
import type { Pocket } from "@/lib/pockets";
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

export function QuickAdd({ defaultWallet, pockets = [], plus = false, fab = true }: { defaultWallet: Wallet; pockets?: Pocket[]; plus?: boolean; fab?: boolean }) {
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
        className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-lift transition hover:bg-brand-soft active:scale-95 lg:right-28 lg:bottom-8 lg:left-auto lg:translate-x-0 print:hidden"
      >
        <Plus className="h-5 w-5 text-gold" strokeWidth={2.5} /> Catat
      </button>}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center" onClick={() => setOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[92dvh] w-full max-w-lg animate-rise overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-lift sm:rounded-3xl sm:p-6">
              <Sheet key={n} preset={preset} defaultWallet={defaultWallet} pockets={pockets} plus={plus} onDone={() => setOpen(false)} />
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

function Sheet({ preset, defaultWallet, pockets, plus, onDone }: { preset: QuickPreset; defaultWallet: Wallet; pockets: Pocket[]; plus: boolean; onDone: () => void }) {
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
      {kind === "transfer" ? (
        <>
          <input type="hidden" name="pocket_id" value={fromP} />
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
      {kind !== "transfer" && <PocketPick label="Kantong:" list={pockets.filter((p) => p.wallet === wallet)} value={pocket} onChange={setPocket} />}

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
              disabled={!plus}
              onClick={() => {
                setCategory(MOVE.key);
                setFromP(pockets[0]?.id ?? "");
                setToP(pockets[1]?.id ?? "");
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition disabled:opacity-60 ${category === MOVE.key ? "border-brand bg-brand/5" : "border-line hover:bg-paper"}`}
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
