"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { addDaily } from "@/app/actions/growth";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/app/actions/auth";

export type DreamLite = { id: string; title: string; target: number; saved: number; date: string };
export type ProductLite = { id: string; name: string; hpp: number; price: number };
type Row = { name: string; hpp: number; price: number };

const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const fmt = (n: number) => (n ? n.toLocaleString("id-ID") : "");

function jakartaToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export function TargetPlanner({ dreams, products, profitPerDay }: { dreams: DreamLite[]; products: ProductLite[]; profitPerDay: number | null }) {
  const [dreamId, setDreamId] = useState(dreams[0]?.id ?? "manual");
  const [manual, setManual] = useState({ title: "Umroh 2 orang", target: 60_000_000, years: 5 });
  const [rows, setRows] = useState<Row[]>(products.length ? products.slice(0, 3).map((p) => ({ name: p.name, hpp: p.hpp, price: p.price })) : [{ name: "Keripik", hpp: 0, price: 5000 }]);
  const [state, action] = useActionState<FormState, FormData>(addDaily, {});

  const dream = dreams.find((d) => d.id === dreamId);
  const calc = useMemo(() => {
    const today = new Date(jakartaToday() + "T00:00:00Z").getTime();
    let remaining: number, days: number, title: string;
    if (dream) {
      remaining = Math.max(0, dream.target - dream.saved);
      days = Math.max(1, Math.round((new Date(dream.date + "T00:00:00Z").getTime() - today) / 86_400_000));
      title = dream.title;
    } else {
      remaining = manual.target;
      days = Math.max(1, Math.round(manual.years * 365));
      title = manual.title;
    }
    const perDay = Math.ceil(remaining / days);
    const items = rows
      .filter((r) => r.price > 0)
      .map((r) => {
        const assumed = r.hpp <= 0;
        const profit = assumed ? r.price : r.price - r.hpp;
        return { ...r, assumed, profit, units: profit > 0 ? Math.ceil(perDay / profit) : null };
      });
    return { remaining, days, perDay, perMonth: perDay * 30, title, items };
  }, [dream, manual, rows]);

  const best = calc.items.filter((i) => i.units).sort((a, b) => (a.units ?? 0) - (b.units ?? 0))[0];
  const setRow = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <div className="space-y-5 lg:col-span-3">
        <section className="card p-5 lg:p-6">
          <p className="eyebrow">Langkah 1</p>
          <h2 className="mt-1 font-bold text-heading">Mimpi apa yang ingin Anda wujudkan?</h2>
          <div className="mt-4 space-y-2">
            {dreams.map((d) => (
              <label key={d.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${dreamId === d.id ? "border-brand bg-brand/5" : "border-line hover:bg-paper"}`}>
                <input type="radio" name="dream" checked={dreamId === d.id} onChange={() => setDreamId(d.id)} className="accent-[#8b2220]" />
                <span className="flex-1 text-sm">
                  <b className="block text-heading">{d.title}</b>
                  <span className="text-muted">
                    {rp(d.target)} · target {new Date(d.date + "T00:00:00").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </span>
                </span>
              </label>
            ))}
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${dreamId === "manual" ? "border-brand bg-brand/5" : "border-line hover:bg-paper"}`}>
              <input type="radio" name="dream" checked={dreamId === "manual"} onChange={() => setDreamId("manual")} className="mt-1 accent-[#8b2220]" />
              <span className="flex-1 text-sm">
                <b className="block text-heading">{dreams.length ? "Coba hitung mimpi lain" : "Tulis mimpi Anda"}</b>
                {dreamId === "manual" && (
                  <span className="mt-2 grid gap-2 sm:grid-cols-3">
                    <input className="input sm:col-span-3" value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder="Misal: Umroh 2 orang" />
                    <span className="relative sm:col-span-2">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted">Rp</span>
                      <input inputMode="numeric" className="input pl-9" value={fmt(manual.target)} onChange={(e) => setManual({ ...manual, target: num(e.target.value) })} />
                    </span>
                    <select className="input" value={manual.years} onChange={(e) => setManual({ ...manual, years: Number(e.target.value) })}>
                      {[0.5, 1, 2, 3, 4, 5, 7, 10].map((y) => (
                        <option key={y} value={y}>
                          {y < 1 ? "6 bulan" : `${y} tahun`}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </span>
            </label>
          </div>
          {dreamId === "manual" && (
            <Link href="/goals/baru" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Simpan sebagai mimpi di Dream Planner <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>

        <section className="card p-5 lg:p-6">
          <p className="eyebrow">Langkah 2</p>
          <h2 className="mt-1 font-bold text-heading">Produk apa yang Anda jual?</h2>
          <p className="mt-1 text-xs text-muted">Isi modal (HPP) agar hasilnya akurat. Belum tahu HPP? Hitung di Kalkulator HPP.</p>
          <div className="mt-4 space-y-2">
            <div className="hidden grid-cols-[1fr_120px_120px_36px] gap-2 px-1 text-[11px] font-semibold text-muted sm:grid">
              <span>Produk</span>
              <span>Modal / pcs</span>
              <span>Harga jual</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-2 sm:grid-cols-[1fr_120px_120px_36px] sm:bg-transparent sm:p-0">
                <input className="input col-span-2 sm:col-span-1" value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Nama produk" />
                <input inputMode="numeric" className="input" value={fmt(r.hpp)} onChange={(e) => setRow(i, { hpp: num(e.target.value) })} placeholder="Modal" />
                <input inputMode="numeric" className="input" value={fmt(r.price)} onChange={(e) => setRow(i, { price: num(e.target.value) })} placeholder="Harga jual" />
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="col-span-2 grid h-9 place-items-center rounded-lg text-muted hover:text-danger sm:col-span-1" aria-label="Hapus">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <button type="button" onClick={() => setRows([...rows, { name: "", hpp: 0, price: 0 }])} className="flex items-center gap-1 font-semibold text-brand/80 hover:text-brand">
              <Plus className="h-4 w-4" /> Tambah produk
            </button>
            {products
              .filter((p) => !rows.some((r) => r.name === p.name))
              .slice(0, 4)
              .map((p) => (
                <button key={p.id} type="button" onClick={() => setRows([...rows, { name: p.name, hpp: p.hpp, price: p.price }])} className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-gold">
                  + {p.name}
                </button>
              ))}
            <Link href="/keuangan/hpp" className="ml-auto text-xs font-semibold text-muted hover:text-heading">
              🧮 Kalkulator HPP
            </Link>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:col-span-2">
        <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lift">
          <div className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
          <p className="text-xs font-semibold text-gold">Untuk “{calc.title || "mimpi Anda"}”</p>
          <p className="mt-2 text-sm text-white/70">Anda perlu menyisihkan</p>
          <p className="text-4xl font-bold tracking-tight">
            {rp(calc.perDay)}
            <span className="text-base font-medium text-white/70">/hari</span>
          </p>
          <p className="mt-1 text-xs text-white/60">
            ≈ {rp(calc.perMonth)}/bulan · sisa {rp(calc.remaining)} dalam {calc.days.toLocaleString("id-ID")} hari
          </p>
          {calc.items.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-white/15 pt-4">
              <p className="text-sm text-white/70">Artinya, setiap hari jual salah satu:</p>
              {calc.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5">
                  <span className="text-sm">
                    <b>{it.name || "Produk"}</b>
                    <span className="block text-[11px] text-white/60">
                      untung {rp(it.profit)}/pcs{it.assumed ? " (modal belum diisi)" : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <b className="text-2xl text-gold">{it.units ?? "–"}</b>
                    <span className="block text-[11px] text-white/60">pcs/hari</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          {profitPerDay !== null && (
            <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-white/80">
              Dari catatan Keuangan, laba kas usaha Anda 30 hari terakhir rata-rata <b className="text-white">{rp(profitPerDay)}/hari</b>.{" "}
              {profitPerDay >= calc.perDay ? "Sudah cukup! Tinggal disiplin menyisihkan setiap hari. 💪" : `Masih kurang ${rp(calc.perDay - profitPerDay)}/hari. Yuk tingkatkan penjualan.`}
            </p>
          )}
        </section>
        {best?.units && (
          <form action={action} className="card p-4">
            <input type="hidden" name="title" value={`Jual ${best.units} ${best.name || "produk"} hari ini (target ${calc.title})`} />
            <input type="hidden" name="dream_id" value={dream?.id ?? ""} />
            <p className="text-sm text-ink">
              Jadikan aksi harian: <b>Jual {best.units} {best.name || "produk"}</b>
            </p>
            {state?.message ? (
              <p className="mt-2 text-sm font-semibold text-success">✓ Ditambahkan ke Daily Action hari ini.</p>
            ) : (
              <SubmitButton className="btn-primary mt-3 w-full">Tambahkan ke aksi hari ini</SubmitButton>
            )}
            {state?.error && <p className="mt-2 text-xs text-danger">{state.error}</p>}
          </form>
        )}
      </aside>
    </div>
  );
}
