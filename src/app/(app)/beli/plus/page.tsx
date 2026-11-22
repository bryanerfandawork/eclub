import { PromoBadge } from "@/components/promo-badge";
import { Check, Crown } from "lucide-react";
import { OrderButton } from "@/components/order-button";
import { PageHeader } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { getSettings } from "@/lib/plans";

export const metadata = { title: "Beli EClub Plus" };

export default async function BuyPlus() {
  const s = await getSettings();
  const monthly = Number(s.plus_price_monthly) || 0;
  const yearly = Number(s.plus_price_yearly) || 0;
  const save = monthly && yearly ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;
  const perks = ["Laporan lengkap Gaya Diri & rekomendasi karier", "Laporan laba rugi otomatis & simpan produk HPP", "Link affiliate: bagi hasil 20% tiap teman membeli", "Harga khusus mentoring 1-on-1 & event", "Dream Planner & habit tracker tanpa batas", "Course khusus member Plus"];
  return (
    <>
      <PageHeader eyebrow="EClub Plus" title="Pilih periode langganan" desc="Bayar lewat transfer bank. Paket aktif otomatis setelah pembayaran terdeteksi." />
      <PromoBadge className="mb-5 max-w-3xl" />
      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        <section className="card flex flex-col p-6">
          <p className="font-bold text-heading">Bulanan</p>
          <p className="mt-2 text-3xl font-bold text-heading">{rupiah(monthly)}</p>
          <p className="text-sm text-muted">per bulan</p>
          <div className="mt-auto pt-6">
            <OrderButton product="plus_monthly" label="Pilih bulanan" className="btn-ghost w-full py-3" />
          </div>
        </section>
        <section className="relative flex flex-col overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lift">
          {save > 0 && <span className="absolute top-5 right-5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-brand-deep">Hemat {save}%</span>}
          <p className="flex items-center gap-1.5 font-bold text-gold">
            <Crown className="h-4 w-4" /> Tahunan
          </p>
          <p className="mt-2 text-3xl font-bold">{rupiah(yearly)}</p>
          <p className="text-sm text-white/70">per tahun</p>
          <div className="mt-auto pt-6">
            <OrderButton product="plus_yearly" label="Pilih tahunan" className="btn-gold w-full py-3" />
          </div>
        </section>
      </div>
      <ul className="mt-6 grid max-w-3xl gap-2 sm:grid-cols-2">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-ink">
            <Check className="h-4 w-4 text-success" /> {p}
          </li>
        ))}
      </ul>
    </>
  );
}
