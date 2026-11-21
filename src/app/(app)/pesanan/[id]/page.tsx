import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Landmark, MessageCircle, QrCode, XCircle } from "lucide-react";
import { saveOrderWa } from "@/app/actions/orders";
import { getSettings } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh, CopyButton, SaveWaForm } from "./client";

export const metadata = { title: "Pesanan" };

type Order = {
  id: string;
  title: string;
  product: string;
  base_amount: number;
  unique_code: number;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  expires_at: string;
  paid_at: string | null;
  course_id: string | null;
};

const idr = (n: number) => n.toLocaleString("id-ID");

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let o: Order | null = null;
  if (isDemoMode) {
    o = { id, title: "EClub Plus · 1 bulan", product: "plus_monthly", base_amount: 49000, unique_code: 123, amount: 49123, status: "pending", expires_at: new Date(Date.now() + 86_400_000).toISOString(), paid_at: null, course_id: null };
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    o = data as Order | null;
  }
  if (!o) notFound();
  const settings = await getSettings();
  const banks = String(settings.bank_accounts ?? "").trim();
  const manual = String(settings.payment_mode ?? "manual") !== "auto";
  const qris = String(settings.qris_image_url ?? "");
  const adminWa = String(settings.admin_whatsapp ?? "").replace(/[^\d]/g, "").replace(/^0/, "62");
  const code = o.id.slice(0, 8).toUpperCase();
  const waText = encodeURIComponent(`Halo Admin EClub, saya sudah membayar.\n\nKode pesanan: ${code}\nProduk: ${o.title}\nNominal: Rp${o.amount.toLocaleString("id-ID")}\n\nBerikut bukti pembayarannya:`);
  let userWa: string | null = null;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: prof } = await supabase.from("profiles").select("whatsapp").maybeSingle();
    userWa = (prof?.whatsapp as string | null) ?? null;
  }
  const expired = o.status === "pending" && new Date(o.expires_at) < new Date();
  const status = expired ? "expired" : o.status;
  const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

  return (
    <div className="mx-auto max-w-lg">
      <AutoRefresh active={status === "pending"} />
      {status === "paid" ? (
        <div className="card animate-rise p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-heading">Pembayaran diterima</h1>
          <p className="mt-2 text-muted">{o.title} sudah aktif. Terima kasih!</p>
          <Link href={o.product === "course" ? "/learn" : "/dashboard"} className="btn-primary mt-6">
            {o.product === "course" ? "Mulai belajar" : "Ke dashboard"}
          </Link>
        </div>
      ) : status !== "pending" ? (
        <div className="card p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-muted" />
          <h1 className="mt-4 text-xl font-bold text-heading">Pesanan {status === "expired" ? "kedaluwarsa" : "dibatalkan"}</h1>
          <p className="mt-2 text-sm text-muted">Jika Anda sudah terlanjur transfer, hubungi admin dengan bukti transfer.</p>
          <Link href={o.product === "course" ? "/learn" : "/beli/plus"} className="btn-primary mt-6">
            Buat pesanan baru
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="bg-brand p-6 text-white">
            <p className="eyebrow">Menunggu pembayaran</p>
            <p className="mt-1 font-semibold">{o.title}</p>
            <p className="mt-4 text-sm text-white/70">Transfer tepat sebesar</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-4xl font-bold tracking-tight">
                Rp{idr(o.amount).slice(0, -3)}
                <span className="rounded-md bg-gold px-1 text-brand-deep">{idr(o.amount).slice(-3)}</span>
              </p>
              <CopyButton value={String(o.amount)} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/75">
              Tiga angka terakhir (<b>{String(o.amount).slice(-3)}</b>) adalah kode unik agar pembayaran Anda mudah dikenali. Mohon bayar persis sampai angka terakhir.
            </p>
          </div>
          <div className="space-y-5 p-6">
            {manual && (
              <ol className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-muted">
                {["Bayar", "Kirim bukti via WA", "Admin konfirmasi"].map((t, i) => (
                  <li key={t} className="rounded-xl bg-paper px-2 py-2.5">
                    <span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            )}
            {qris && (
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-heading">
                  <QrCode className="h-4 w-4 text-gold" /> Bayar dengan QRIS
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qris} alt="QRIS EClub" className="mx-auto mt-3 w-full max-w-[260px] rounded-xl border border-line bg-white p-2" />
                <p className="mt-2 text-center text-xs text-muted">Scan dengan aplikasi bank atau e-wallet apa pun, lalu masukkan nominal di atas.</p>
              </div>
            )}
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-heading">
                <Landmark className="h-4 w-4 text-gold" /> {qris ? "Atau transfer ke rekening" : "Rekening tujuan"}
              </p>
              <p className="mt-2 rounded-xl bg-paper p-4 text-sm leading-relaxed whitespace-pre-line text-ink">
                {banks || "Rekening tujuan belum diatur. Silakan hubungi admin EClub."}
              </p>
            </div>
            {manual && adminWa.length > 8 && (
              <a href={`https://wa.me/${adminWa}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#25D366] py-3 text-white hover:brightness-95">
                <MessageCircle className="h-4 w-4" /> Sudah bayar? Konfirmasi via WhatsApp
              </a>
            )}
            {!userWa && !isDemoMode && <SaveWaForm orderId={o.id} action={saveOrderWa} />}
            <p className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" /> Bayar sebelum {fmt(o.expires_at)} WIB · Kode pesanan <b className="text-heading">{code}</b>
            </p>
            <p className="rounded-xl border border-dashed border-line p-4 text-xs leading-relaxed text-muted">
              {manual
                ? "Setelah admin memeriksa bukti pembayaran (biasanya kurang dari 1×24 jam pada hari kerja), paket Anda aktif dan halaman ini berubah otomatis. Kami juga mengabari lewat WhatsApp."
                : "Halaman ini akan berubah otomatis setelah pembayaran terdeteksi (biasanya 5–15 menit setelah transfer). Anda boleh menutup halaman ini; paket tetap aktif otomatis."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
