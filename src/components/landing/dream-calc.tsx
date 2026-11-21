"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const fmt = (n: number) => (n ? n.toLocaleString("id-ID") : "");
const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

/** Kalkulator mimpi di halaman depan: mimpi → tabungan harian → produk terjual per hari. */
export function DreamCalc() {
  const [dream, setDream] = useState("Umroh 2 orang");
  const [target, setTarget] = useState(60_000_000);
  const [years, setYears] = useState(5);
  const [product, setProduct] = useState("keripik");
  const [profit, setProfit] = useState(5000);
  const perDay = Math.ceil(target / Math.max(1, years * 365));
  const units = profit > 0 ? Math.ceil(perDay / profit) : 0;
  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-lift lg:grid-cols-2">
      <div className="space-y-4 p-6 sm:p-8">
        <div>
          <label className="label">Mimpi saya</label>
          <input className="input" value={dream} onChange={(e) => setDream(e.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <label className="label">Butuh dana</label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted">Rp</span>
              <input inputMode="numeric" className="input pl-9" value={fmt(target)} onChange={(e) => setTarget(num(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="label">Dalam</label>
            <select className="input" value={years} onChange={(e) => setYears(Number(e.target.value))}>
              {[1, 2, 3, 5, 7, 10].map((y) => (
                <option key={y} value={y}>
                  {y} tahun
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_140px] gap-3">
          <div>
            <label className="label">Produk yang saya jual</label>
            <input className="input" value={product} onChange={(e) => setProduct(e.target.value)} />
          </div>
          <div>
            <label className="label">Untung / pcs</label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted">Rp</span>
              <input inputMode="numeric" className="input pl-9" value={fmt(profit)} onChange={(e) => setProfit(num(e.target.value))} />
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col justify-center bg-brand p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-12 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
        <p className="text-sm text-white/70">Untuk “{dream || "mimpi Anda"}”, sisihkan</p>
        <p className="text-4xl font-bold tracking-tight sm:text-5xl">
          {rp(perDay)}
          <span className="text-lg font-medium text-white/60">/hari</span>
        </p>
        <p className="mt-4 text-sm text-white/70">Artinya, cukup jual</p>
        <p className="text-4xl font-bold text-gold sm:text-5xl">
          {units} {product || "produk"}
          <span className="text-lg font-medium text-white/60"> per hari</span>
        </p>
        <p className="mt-4 text-sm text-white/70">Mimpi besar terasa mungkin saat dipecah jadi angka kecil yang bisa dikerjakan setiap hari.</p>
        <Link href="/daftar" className="btn-gold mt-6 w-full py-3.5 sm:w-auto">
          Simpan & dapatkan rencananya gratis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
