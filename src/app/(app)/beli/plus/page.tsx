import { PromoBadge } from "@/components/promo-badge";
import { Check, Crown } from "lucide-react";
import { OrderButton } from "@/components/order-button";
import { PageHeader } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { couponInfo, getSettings } from "@/lib/plans";

export const metadata = { title: "Beli EClub Plus" };

export default async function BuyPlus() {
  const s = await getSettings();
  const monthly = Number(s.plus_price_monthly) || 0;
  const yearly = Number(s.plus_price_yearly) || 0;
  const save = monthly && yearly ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;
  const c = couponInfo(s);
  const rate = Number(s.affiliate_rate) || 20;
  const perks = [
    "Asisten Catat: cerita transaksi lewat chat, langsung rapi",
    "Tambah usaha tanpa batas & keuangan keluarga bersama",
    "Ruang Kerja Tim: tugas, papan, kalender & diskusi",
    "Mimpi, rencana harian & kebiasaan tanpa batas",
    "Laporan lengkap Gaya Diri & 9 ide Peta Income",
    "Laba rugi otomatis, grafik 6 bulan & ekspor",
    `Kupon pribadi: teman hemat ${c.pct}%, Anda dapat ${rate}%`,
    "Harga khusus mentoring, event & course Plus",
    "Bantuan prioritas lewat WhatsApp",
  ];
  return (
    <>
      <PageHeader eyebrow="EClub Plus" title="Pilih periode langganan" desc="Bayar lewat transfer bank. Paket aktif otomatis setelah pembayaran terdeteksi." />
      <PromoBadge className="mb-5 max-w-3xl" />
      {c.code && c.pct > 0 && (
        <p className="mb-5 max-w-3xl rounded-2xl border-2 border-dashed border-gold bg-gold-soft/60 px-4 py-3 text-sm text-heading">
          🎟️ Pakai kode kupon teman Anda, atau kode <b>{c.code}</b>, di halaman pembayaran untuk hemat <b>{c.pct}%</b>.
        </p>
      )}
      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        <section className="card flex flex-col p-6">
          <p className="font-bold text-heading">Bulanan</p>
          {c.code && c.pct > 0 ? (
            <>
              <p className="mt-2 text-sm text-muted line-through">{rupiah(monthly)}</p>
              <p className="text-3xl font-bold text-heading">{rupiah(c.after(monthly))}</p>
              <p className="text-sm text-muted">per bulan dengan kupon</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-heading">{rupiah(monthly)}</p>
              <p className="text-sm text-muted">per bulan</p>
            </>
          )}
          <div className="mt-auto pt-6">
            <OrderButton product="plus_monthly" label="Pilih bulanan" className="btn-ghost w-full py-3" />
          </div>
        </section>
        <section className="relative flex flex-col overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lift">
          {save > 0 && <span className="absolute top-5 right-5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-brand-deep">Hemat {save}%</span>}
          <p className="flex items-center gap-1.5 font-bold text-gold">
            <Crown className="h-4 w-4" /> Tahunan
          </p>
          {c.code && c.pct > 0 ? (
            <>
              <p className="mt-2 text-sm text-white/60 line-through">{rupiah(yearly)}</p>
              <p className="text-3xl font-bold">{rupiah(c.after(yearly))}</p>
              <p className="text-sm text-white/70">per tahun dengan kupon, setara {rupiah(Math.round(c.after(yearly) / 12))}/bulan</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold">{rupiah(yearly)}</p>
              <p className="text-sm text-white/70">per tahun</p>
            </>
          )}
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
