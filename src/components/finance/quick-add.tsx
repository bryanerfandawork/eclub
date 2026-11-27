"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ArrowRight } from "lucide-react";
import { saveTx } from "@/app/actions/finance";
import { BOOK_EMOJI, CATEGORIES, MOVE, TRANSFERS, WALLET_LABEL, bookWallet, type Book, type TxKind, type Wallet } from "@/lib/finance";
import type { Draft } from "@/lib/fin-parse";
import { AssistantBubble, SmartBar, UserBubble } from "./smart-bar";
import Link from "next/link";
import { earmarked, freeBalance, providerOf, type Pocket, type PocketType } from "@/lib/pockets";
import { DEFAULT_TEASER } from "@/lib/assistant-config";
import { PocketBadge } from "./pocket-badge";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/app/actions/auth";

/** book: "" = Pribadi, id buku, atau (sebelum SQL 029) "personal"/"business". */
export type QuickPreset = { kind?: TxKind; wallet?: Wallet; category?: string; book?: string; amount?: number; pocket_id?: string | null; date?: string; note?: string; source?: "scan" | "chat"; step?: string; said?: string };
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

export function QuickAdd({ defaultWallet, defaultBook, pockets = [], books = [], plus = false, fab = true, dreams = [], teaser = DEFAULT_TEASER }: { defaultWallet: Wallet; defaultBook?: string; pockets?: Pocket[]; books?: Book[]; plus?: boolean; fab?: boolean; dreams?: DreamOpt[]; teaser?: string[] }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<QuickPreset>({});
  const [n, setN] = useState(0); // reset form setiap kali dibuka
  const [queue, setQueue] = useState<QuickPreset[]>([]);
  const active = books.filter((b) => b.status === "active");
  const groupOf = (d: Draft) => {
    const p = pockets.find((x) => x.id === d.pocket_id);
    if (active.length) return p?.book_id ?? "";
    return d.wallet;
  };
  const toPreset = (d: Draft, src: "scan" | "chat", i: number, total: number, said?: string): QuickPreset => ({
    kind: d.kind,
    category: d.category,
    wallet: d.wallet,
    book: groupOf(d),
    amount: d.amount,
    pocket_id: d.pocket_id,
    date: d.date,
    note: d.note,
    source: src,
    step: total > 1 ? `${i + 1} dari ${total}` : undefined,
    said,
  });
  const onDrafts = (list: Draft[], src: "scan" | "chat", said?: string) => {
    const all = list.map((d, i) => toPreset(d, src, i, list.length, said));
    setQueue(all.slice(1));
    setPreset(all[0]);
    setN((x) => x + 1);
  };
  const done = () => {
    if (queue.length) {
      setPreset(queue[0]);
      setQueue(queue.slice(1));
      setN((x) => x + 1);
    } else setOpen(false);
  };

  useEffect(() => {
    const h = (e: Event) => {
      setPreset((e as CustomEvent<QuickPreset>).detail ?? {});
      setQueue([]);
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
              <Sheet key={n} preset={preset} defaultWallet={defaultWallet} defaultBook={defaultBook} pockets={pockets} books={active} plus={plus} dreams={dreams} teaser={teaser} onDone={done} onClose={() => { setQueue([]); setOpen(false); }} onDrafts={onDrafts} left={queue.length} />
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

function PocketPick({ label, list, value, onChange, always = false, nameOf = (p) => p.name }: { label: string; list: Pocket[]; value: string; onChange: (id: string) => void; always?: boolean; nameOf?: (p: Pocket) => string }) {
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
            <PocketBadge type={p.type} provider={p.provider} size={26} /> {nameOf(p)}
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

function Upsell({ onClose, teaser, chat = false }: { onClose: () => void; teaser: string[]; chat?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-rise rounded-3xl bg-white p-5 text-center shadow-lift">
        {chat ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-2xl">💬</div>
            <p className="mt-4 text-lg font-bold text-heading">Catat cukup lewat chat</p>
            <p className="mt-1 text-sm text-muted">
              Dengan <b className="text-heading">EClub Plus</b>, cukup ketik seperti ngobrol, misal <i>&quot;beli bahan kue 85rb pakai BCA, usaha&quot;</i>. Asisten Catat langsung mengisi jumlah, kategori, kantong, dan buku usaha/keluarga yang tepat. Laporan keuangan Anda rapi tanpa isi formulir.
            </p>
          </>
        ) : (
        <>
        <div className="flex justify-center gap-1.5">
          {teaser.filter((k) => providerOf(k)).slice(0, 6).map((k) => (
            <PocketBadge key={k} type={providerOf(k)!.type as PocketType} provider={k} size={34} />
          ))}
        </div>
        <p className="mt-4 text-lg font-bold text-heading">Pisahkan uang per kantong</p>
        <p className="mt-1 text-sm text-muted">
          Dengan <b className="text-heading">EClub Plus</b>, catat uang di setiap tempatnya: tunai, BCA, BRI, Mandiri, DANA, ShopeePay, atau kantong buatan Anda sendiri. Saldo tiap kantong selalu cocok dengan aslinya, plus bisa pindah antar kantong, grafik 6 bulan, dan ekspor Excel.
        </p>
        </>
        )}
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

type Group = { key: string; label: string; emoji: string; wallet: Wallet; pockets: Pocket[] };

function Sheet({ preset, defaultWallet, defaultBook, pockets, books, plus, dreams, teaser, onDone, onClose, onDrafts, left }: { preset: QuickPreset; defaultWallet: Wallet; defaultBook?: string; pockets: Pocket[]; books: Book[]; plus: boolean; dreams: DreamOpt[]; teaser: string[]; onDone: () => void; onClose: () => void; onDrafts: (d: Draft[], src: "scan" | "chat", said?: string) => void; left: number }) {
  // Dompet = Pribadi + buku usaha/keluarga (SQL 029). Sebelum itu: Pribadi & Usaha seperti dulu.
  const groups: Group[] = books.length
    ? [
        { key: "", label: "Pribadi", emoji: "🙂", wallet: "personal", pockets: pockets.filter((p) => !p.book_id && p.own !== false) },
        ...books.map((b) => ({ key: b.id, label: b.name, emoji: BOOK_EMOJI[b.kind], wallet: bookWallet(b.kind), pockets: pockets.filter((p) => p.book_id === b.id) })),
      ]
    : (["personal", "business"] as Wallet[]).map((w) => ({ key: w, label: WALLET_LABEL[w], emoji: w === "personal" ? "🙂" : "🏪", wallet: w, pockets: pockets.filter((p) => p.wallet === w) }));
  const bookName = (id?: string | null) => books.find((b) => b.id === id)?.name;
  const nameOf = (p: Pocket) => (p.book_id && books.length > 1 ? `${p.name} · ${bookName(p.book_id)}` : p.name);
  const managed = new Set(books.filter((b) => b.role !== "recorder").map((b) => b.id));
  const movable = pockets.filter((p) => !p.book_id || managed.has(p.book_id));
  const initialGroup = (() => {
    if (preset.book !== undefined && groups.some((g) => g.key === preset.book)) return preset.book;
    const w = preset.wallet ?? defaultWallet;
    if (!books.length) return w;
    if (defaultBook !== undefined && groups.some((g) => g.key === defaultBook) && (!preset.wallet || groups.find((g) => g.key === defaultBook)?.wallet === preset.wallet)) return defaultBook;
    return groups.find((g) => g.wallet === w && (w === "personal" ? g.key === "" : true))?.key ?? "";
  })();
  const [upsell, setUpsell] = useState<boolean | "chat">(false);
  const [dreamId, setDreamId] = useState(dreams[0]?.id ?? "");
  const [dreamMode, setDreamMode] = useState<"" | "for" | "other">("");
  const [dreamPick, setDreamPick] = useState("");
  const [kind, setKind] = useState<TxKind>(preset.kind ?? "out");
  const [group, setGroup] = useState(initialGroup);
  const g = groups.find((x) => x.key === group) ?? groups[0];
  const wallet = g.wallet;
  const [category, setCategory] = useState(preset.category ?? "");
  const [amount, setAmount] = useState(preset.amount ? preset.amount.toLocaleString("id-ID") : "");
  const presetDay = !preset.date || preset.date === jakarta(0) ? "0" : preset.date === jakarta(-1) ? "-1" : "custom";
  const [day, setDay] = useState<"0" | "-1" | "custom">(presetDay);
  const [custom, setCustom] = useState(preset.date ?? jakarta(0));
  const [note, setNote] = useState(!!preset.note);
  const [noteText, setNoteText] = useState(preset.note ?? "");
  const [state, action] = useActionState<FormState, FormData>(saveTx, {});
  const first = (w: Wallet) => (w === "personal" ? groups.find((x) => x.wallet === "personal")?.pockets[0]?.id : movable.find((p) => p.wallet === w)?.id) ?? "";
  const [pocket, setPocket] = useState(preset.pocket_id && g.pockets.some((p) => p.id === preset.pocket_id) ? preset.pocket_id : (g.pockets[0]?.id ?? ""));
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
  const ownPockets = pockets.filter((p) => p.own !== false);
  const date = day === "custom" ? custom : jakarta(Number(day));
  const tone = kind === "in" ? "text-success" : kind === "out" ? "text-brand" : "text-heading";

  if (state?.message)
    return (
      <div className="py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-3xl">✓</div>
        <p className="mt-4 text-lg font-bold text-heading">Tersimpan</p>
        <p className="text-sm text-muted">{left > 0 ? `Lanjut ke transaksi berikutnya (${left} lagi)…` : "Catatan Anda sudah masuk."}</p>
      </div>
    );

  return (
    <form action={action}>
      {upsell && <Upsell onClose={() => setUpsell(false)} teaser={teaser} chat={upsell === "chat"} />}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-heading">Catat transaksi</h2>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-paper" aria-label="Tutup">
          <X className="h-5 w-5" />
        </button>
      </div>

      {preset.source ? (
        <div className="mb-4 space-y-2 rounded-3xl bg-gold-soft/40 p-3 ring-1 ring-gold/40">
          {preset.said && <UserBubble>{preset.said}</UserBubble>}
          <AssistantBubble>
            Siap, sudah aku catat{preset.step ? ` (transaksi ${preset.step})` : ""} dari {preset.source === "scan" ? "foto nota" : "ceritamu"} ✍️ Cek sebentar di bawah, ubah bila perlu, lalu tekan <b>Simpan</b>.
          </AssistantBubble>
        </div>
      ) : (
        !preset.kind && !preset.category && <SmartBar onDrafts={onDrafts} plus={plus} onLocked={() => setUpsell("chat")} />
      )}
      <input type="hidden" name="kind" value={kind} />
      {preset.source && <input type="hidden" name="source" value={preset.source} />}
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
        <div className="mt-4 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 text-sm">
          <span className="shrink-0 text-muted">Dompet:</span>
          {groups.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => {
                if (x.wallet !== wallet) setCategory("");
                setGroup(x.key);
                setPocket(x.pockets[0]?.id ?? "");
              }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-semibold whitespace-nowrap transition ${group === x.key ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-paper"}`}
            >
              {x.emoji} {x.label}
            </button>
          ))}
        </div>
      )}
      {kind !== "transfer" && <WalletPockets teaserKeys={teaser} list={g.pockets} value={pocket} onChange={setPocket} plus={plus || (!!g.key && books.some((b) => b.id === g.key && b.owner_plus))} onLocked={() => setUpsell(true)} />}

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
          {dreams.length > 0 && ownPockets.length > 0 && (
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
              <PocketPick label="Disimpan di kantong:" list={ownPockets} value={toP} onChange={setToP} always nameOf={nameOf} />
              {plus && <PocketPick label="Diambil dari kantong:" list={ownPockets} value={fromP} onChange={setFromP} always nameOf={nameOf} />}
              {(() => {
                const src = ownPockets.find((p) => p.id === (plus ? fromP : toP));
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
            const side = (w?: Wallet) => (w === "personal" ? movable.filter((p) => p.wallet === "personal" && (p.own !== false || !!p.book_id)) : movable.filter((p) => p.wallet === w));
            const from = category === MOVE.key ? pockets : side(tr?.from);
            const to = category === MOVE.key ? pockets.filter((p) => p.id !== fromP) : side(tr?.to);
            return (
              <>
                <PocketPick label="Dari kantong:" list={from} value={fromP} onChange={(id) => { setFromP(id); if (id === toP) setToP(pockets.find((p) => p.id !== id)?.id ?? ""); }} always={category === MOVE.key} nameOf={nameOf} />
                <PocketPick label="Ke kantong:" list={to} value={toP} onChange={setToP} always={category === MOVE.key} nameOf={nameOf} />
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
        <input name="note" maxLength={200} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Catatan (opsional), misal: belanja di pasar" className="input mt-4" autoFocus={!preset.note} />
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
