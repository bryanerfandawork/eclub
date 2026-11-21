"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/actions/finance-products";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

type Line = { name: string; cost: number };
export type HppData = { lines: Line[]; yield: number; perUnit: number; overhead: number; margin: number };
export type Product = { id: string; name: string; data: HppData; hpp: number; price: number };

const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const fmt = (n: number) => (n ? n.toLocaleString("id-ID") : "");

function Money({ value, onChange, placeholder }: { value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted">Rp</span>
      <input inputMode="numeric" className="input pl-9" placeholder={placeholder ?? "0"} value={fmt(value)} onChange={(e) => onChange(num(e.target.value))} />
    </div>
  );
}

const EMPTY: HppData = { lines: [{ name: "", cost: 0 }, { name: "", cost: 0 }], yield: 0, perUnit: 0, overhead: 0, margin: 40 };

export function HppCalculator({ initial, canSave }: { initial?: Product; canSave: boolean }) {
  const [d, setD] = useState<HppData>(initial?.data ?? EMPTY);
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [state, action] = useActionState<FormState, FormData>(saveProduct, {});

  const calc = useMemo(() => {
    const bahan = d.lines.reduce((s, l) => s + l.cost, 0);
    const perBatch = bahan + d.overhead;
    const hpp = d.yield > 0 ? perBatch / d.yield + d.perUnit : 0;
    const suggest = d.margin < 100 ? hpp / (1 - d.margin / 100) : 0;
    const actualMargin = price > 0 ? ((price - hpp) / price) * 100 : null;
    return { bahan, hpp, suggest, actualMargin, profit: price > 0 ? price - hpp : suggest - hpp };
  }, [d, price]);

  const set = (p: Partial<HppData>) => setD((x) => ({ ...x, ...p }));
  const setLine = (i: number, p: Partial<Line>) => set({ lines: d.lines.map((l, j) => (j === i ? { ...l, ...p } : l)) });

  return (
    <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <section className="card space-y-5 p-5 lg:col-span-3 lg:p-6">
        <div>
          <label className="label">Nama produk</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Brownies cokelat" />
        </div>
        <div>
          <p className="label">1. Bahan baku untuk sekali produksi</p>
          <div className="space-y-2">
            {d.lines.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} placeholder={i === 0 ? "Tepung 1 kg" : i === 1 ? "Telur 10 butir" : "Bahan lain"} />
                <div className="w-36 shrink-0">
                  <Money value={l.cost} onChange={(n) => setLine(i, { cost: n })} />
                </div>
                <button type="button" onClick={() => set({ lines: d.lines.filter((_, j) => j !== i) })} className="grid w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-danger" aria-label="Hapus bahan">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set({ lines: [...d.lines, { name: "", cost: 0 }] })} className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand/80 hover:text-brand">
            <Plus className="h-4 w-4" /> Tambah bahan
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">2. Jadi berapa produk?</label>
            <input inputMode="numeric" className="input" value={d.yield || ""} onChange={(e) => set({ yield: num(e.target.value) })} placeholder="Misal: 20 potong" />
          </div>
          <div>
            <label className="label">3. Biaya lain sekali produksi</label>
            <Money value={d.overhead} onChange={(n) => set({ overhead: n })} placeholder="Gas, listrik, tenaga" />
          </div>
          <div>
            <label className="label">4. Kemasan per produk</label>
            <Money value={d.perUnit} onChange={(n) => set({ perUnit: n })} placeholder="Box, stiker, plastik" />
          </div>
          <div>
            <label className="label">Harga jual sekarang (opsional)</label>
            <Money value={price} onChange={setPrice} placeholder="Kosongkan bila belum ada" />
          </div>
        </div>
      </section>

      <aside className="space-y-4 lg:col-span-2">
        <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
          <p className="text-xs font-semibold text-gold">HPP per produk</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{rp(calc.hpp)}</p>
          <p className="mt-1 text-xs text-white/60">Modal untuk membuat 1 produk ({rp(calc.bahan)} bahan + biaya lain, dibagi {d.yield || "…"} produk, + kemasan)</p>
          <div className="mt-5 border-t border-white/15 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Target untung</span>
              <span className="font-bold text-gold">{d.margin}%</span>
            </div>
            <input type="range" min={10} max={80} step={5} value={d.margin} onChange={(e) => set({ margin: Number(e.target.value) })} className="mt-2 w-full accent-[#c6a15b]" />
            <p className="mt-3 text-sm text-white/70">Saran harga jual</p>
            <p className="text-2xl font-bold">{rp(Math.ceil(calc.suggest / 500) * 500)}</p>
          </div>
        </section>
        {calc.actualMargin !== null && calc.hpp > 0 && (
          <section className={`rounded-2xl border p-4 text-sm ${calc.actualMargin < 20 ? "border-danger/30 bg-danger/5" : "border-success/30 bg-success/5"}`}>
            <p className="font-bold text-heading">
              Harga Anda {rp(price)} → untung {rp(calc.profit)} per produk ({Math.round(calc.actualMargin)}%)
            </p>
            <p className="mt-1 text-muted">
              {calc.actualMargin < 0
                ? "Harga di bawah modal. Setiap produk terjual justru rugi."
                : calc.actualMargin < 20
                  ? "Untungnya tipis. Pertimbangkan menaikkan harga atau menekan biaya bahan."
                  : calc.actualMargin < 40
                    ? "Cukup sehat. Pastikan biaya operasional bulanan tetap tertutup."
                    : "Margin sehat. Pertahankan kualitas dan konsistensi."}
            </p>
          </section>
        )}
        <form action={action} className="card space-y-3 p-4">
          <input type="hidden" name="id" value={initial?.id ?? ""} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="data" value={JSON.stringify(d)} />
          <input type="hidden" name="hpp" value={Math.round(calc.hpp)} />
          <input type="hidden" name="price" value={price || Math.ceil(calc.suggest / 500) * 500} />
          {canSave ? (
            <SubmitButton className="btn-primary w-full">{initial ? "Simpan perubahan" : "Simpan produk"}</SubmitButton>
          ) : (
            <a href="/beli/plus" className="btn-gold w-full">
              Simpan produk dengan EClub Plus
            </a>
          )}
          <FormMessage state={state} />
          <p className="text-center text-xs text-muted">Kalkulator gratis dipakai. Menyimpan daftar produk khusus member Plus.</p>
        </form>
      </aside>
    </div>
  );
}
