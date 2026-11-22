import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Download, Landmark, MessageCircle, QrCode, XCircle } from "lucide-react";
import { cookies } from "next/headers";
import { applyCoupon, saveOrderWa } from "@/app/actions/orders";
import { parseBankAccounts } from "@/lib/banks";
import { getSettings } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh, CopyButton, CouponForm, SaveWaForm } from "./client";

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
  coupon_code?: string | null;
  discount?: number;
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
  const banks = String(settings.bank_accounts ?? "").trim() || (isDemoMode ? "BCA 1234567890 a.n. PT EClub Indonesia\nMandiri 1230009876543 a.n. PT EClub Indonesia" : "");
  const manual = String(settings.payment_mode ?? "manual") !== "auto";
  const { accounts, rest: bankNotes } = parseBankAccounts(banks);
  const qris = String(settings.qris_image_url ?? "");
  const qrisDownload = qris ? (qris.includes("/storage/v1/object/public/") ? `${qris}${qris.includes("?") ? "&" : "?"}download=QRIS-EClub.png` : qris) : "";
  const adminWa = String(settings.admin_whatsapp ?? "").replace(/[^\d]/g, "").replace(/^0/, "62");
  const code = o.id.slice(0, 8).toUpperCase();
  const waText = encodeURIComponent(`Halo Admin EClub, saya sudah membayar.\n\nKode pesanan: ${code}\nProduk: ${o.title}\nNominal: Rp${o.amount.toLocaleString("id-ID")}\n\nBerikut bukti pembayarannya:`);
  let userWa: string | null = null;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: prof } = await supabase.from("profiles").select("whatsapp").maybeSingle();
    userWa = (prof?.whatsapp as string | null) ?? null;
  }
  const refCookie = (await cookies()).get("eclub_ref")?.value;
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
          <Link href={o.product === "course" ? "/learn" : o.product === "mentoring" ? "/mentoring" : o.product === "event" ? "/event" : "/dashboard"} className="btn-primary mt-6">
            {o.product === "course" ? "Mulai belajar" : o.product === "mentoring" ? "Lihat jadwal mentoring" : o.product === "event" ? "Lihat event" : "Ke dashboard"}
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
            {o.coupon_code && (
              <p className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                🎟️ Kupon {o.coupon_code}: hemat Rp{idr(o.discount ?? 0)}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-white/75">
              Tiga angka terakhir (<b>{String(o.amount).slice(-3)}</b>) adalah kode unik agar pembayaran Anda mudah dikenali. Mohon bayar persis sampai angka terakhir.
            </p>
          </div>
          <div className="space-y-5 p-6">
            {!o.coupon_code && status === "pending" && <CouponForm orderId={o.id} action={applyCoupon} suggested={refCookie} />}
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
                <div className="mt-3 flex justify-center">
                  <a href={qrisDownload} download="QRIS-EClub.png" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold text-heading hover:bg-paper">
                    <Download className="h-3.5 w-3.5" /> Unduh QRIS
                  </a>
                </div>
                <p className="mt-2 text-center text-xs text-muted">Scan dengan aplikasi bank atau e-wallet apa pun, lalu masukkan nominal di atas. Bayar dari HP yang sama? Unduh QRIS, lalu pilih gambar ini di menu scan aplikasi Anda.</p>
              </div>
            )}
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-heading">
                <Landmark className="h-4 w-4 text-gold" /> {qris ? "Atau transfer ke rekening" : "Rekening tujuan"}
              </p>
              {accounts.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {accounts.map((a) => (
                    <li key={a.bank + a.number} className="rounded-xl border border-line bg-white p-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold tracking-tight" style={{ background: a.brand.bg, color: a.brand.fg, boxShadow: a.brand.accent ? `inset 0 -4px 0 ${a.brand.accent}` : undefined }}>
                          {a.brand.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-heading">{a.bank}</p>
                          {a.holder && <p className="truncate text-xs text-muted">a.n. {a.holder}</p>}
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-paper py-2 pr-2 pl-3">
                        <p className="font-mono text-base font-bold tracking-wide text-heading">{a.number.replace(/(\d{4})(?=\d)/g, "$1\u2009")}</p>
                        <CopyButton value={a.number} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 rounded-xl bg-paper p-4 text-sm leading-relaxed text-ink">{banks || "Rekening tujuan belum diatur. Silakan hubungi admin EClub."}</p>
              )}
              {accounts.length > 0 && bankNotes.length > 0 && <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-muted">{bankNotes.join("\n")}</p>}
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
