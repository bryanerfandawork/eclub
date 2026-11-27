"use client";

import { useActionState } from "react";
import { saveFeatures } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { PlanFeature } from "@/lib/plans";
import { useState } from "react";

function PromoFields({ settings }: { settings: Record<string, unknown> }) {
  const [mode, setMode] = useState(String(settings.promo_mode ?? "none"));
  return (
    <section className="card p-5 lg:p-6">
      <h2 className="font-bold text-heading">Promo harga Plus</h2>
      <p className="mt-1 text-sm text-muted">Tampil di halaman Paket, Beli Plus, halaman depan, dan halaman pembayaran. Angka kuota dihitung otomatis dari pembelian Plus yang sudah lunas, jadi selalu jujur. Saat kuota habis atau tanggal lewat, pita promo hilang sendiri dan kembali ke kalimat harga spesial.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Jenis batas</label>
          <select name="promo_mode" value={mode} onChange={(e) => setMode(e.target.value)} className="input">
            <option value="none">Tanpa batas (kalimat harga spesial)</option>
            <option value="date">Sampai tanggal (hitung mundur)</option>
            <option value="quota">Untuk X pembeli pertama</option>
          </select>
        </div>
        {mode !== "none" && (
          <div>
            <label className="label">Nama promo</label>
            <input name="promo_label" maxLength={40} defaultValue={String(settings.promo_label ?? "")} placeholder="Promo Pembukaan" className="input" />
          </div>
        )}
        {mode === "date" && (
          <div>
            <label className="label">Berakhir pada (23.59 WIB)</label>
            <input type="date" name="promo_end" defaultValue={String(settings.promo_end ?? "")} className="input" />
          </div>
        )}
        {mode === "quota" && (
          <>
            <div>
              <label className="label">Jumlah kuota (orang)</label>
              <input name="promo_quota" inputMode="numeric" defaultValue={String(settings.promo_quota ?? "")} placeholder="100" className="input" />
            </div>
            <div>
              <label className="label">Dihitung sejak</label>
              <input type="date" name="promo_start" defaultValue={String(settings.promo_start ?? "")} className="input" />
              <p className="mt-1 text-xs text-muted">Kosongkan = mulai hari ini.</p>
            </div>
          </>
        )}
      </div>
      <div className="mt-4">
        <label className="label">Kalimat pengingat harga <span className="font-normal text-muted">(opsional)</span></label>
        <input name="promo_note" maxLength={200} defaultValue={String(settings.promo_note ?? "")} placeholder="Harga spesial saat ini. Harga dapat menyesuaikan sewaktu-waktu seiring bertambahnya fitur dan materi, jadi amankan selagi masih berlaku." className="input" />
        <p className="mt-1 text-xs text-muted">Kosongkan untuk memakai kalimat bawaan di atas. Selalu tampil saat tidak ada promo berbatas.</p>
      </div>
    </section>
  );
}

export function FeaturesForm({ features, settings, canEdit }: { features: PlanFeature[]; settings: Record<string, unknown>; canEdit: boolean }) {
  const [state, action] = useActionState(saveFeatures, undefined);
  const v = (n: number | null) => (n == null ? "" : String(n));
  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={!canEdit} className="space-y-5">
        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Harga EClub Plus</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Bulanan (Rp)</label>
              <input name="plus_price_monthly" inputMode="numeric" defaultValue={String(settings.plus_price_monthly ?? "")} className="input" />
            </div>
            <div>
              <label className="label">Tahunan (Rp)</label>
              <input name="plus_price_yearly" inputMode="numeric" defaultValue={String(settings.plus_price_yearly ?? "")} className="input" />
            </div>
            <div>
              <label className="label">Laporan DISC (Rp)</label>
              <input name="disc_report_price" inputMode="numeric" defaultValue={String(settings.disc_report_price ?? "49000")} className="input" />
            </div>
            <div>
              <label className="label">Kontak upgrade</label>
              <input name="upgrade_contact" defaultValue={String(settings.upgrade_contact ?? "")} className="input" placeholder="No. WhatsApp atau link" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Cara konfirmasi bayar</label>
              <select name="payment_mode" defaultValue={String(settings.payment_mode ?? "manual")} className="input">
                <option value="manual">Manual (konfirmasi via WhatsApp)</option>
                <option value="auto">Otomatis (Moota/penyedia)</option>
              </select>
            </div>
            <div>
              <label className="label">No. WhatsApp admin</label>
              <input name="admin_whatsapp" defaultValue={String(settings.admin_whatsapp ?? "")} className="input" placeholder="081234567890" />
            </div>
            <div>
              <label className="label">Link gambar QRIS <span className="font-normal text-muted">(opsional)</span></label>
              <input name="qris_image_url" defaultValue={String(settings.qris_image_url ?? "")} className="input" placeholder="https://… atau /payments/qris.png" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Rekening tujuan transfer</label>
            <textarea name="bank_accounts" rows={3} defaultValue={String(settings.bank_accounts ?? "")} className="input resize-y" placeholder={"BCA 1234567890 a.n. PT EClub Indonesia\nMandiri 0987654321 a.n. PT EClub Indonesia"} />
            <p className="mt-1 text-xs text-muted">Satu rekening per baris dengan format: <b>Nama bank, nomor rekening, a.n. pemilik</b>. Halaman pembayaran otomatis menampilkannya per bank dengan logo dan tombol salin.</p>
          </div>
        </section>

        <PromoFields settings={settings} />

        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Affiliate & kode kupon</h2>
          <p className="mt-1 text-xs text-muted">Berlaku untuk transaksi berikutnya. Komisi yang sudah tercatat tidak berubah. Pembeli yang datang dari link affiliate tetap tercatat ke affiliate tersebut walau memakai kode umum.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Komisi affiliate (%)</label>
              <input name="affiliate_rate" inputMode="numeric" defaultValue={String(settings.affiliate_rate ?? "20")} className="input" />
            </div>
            <div>
              <label className="label">Potongan kupon paket Plus (%)</label>
              <input name="coupon_discount" inputMode="numeric" defaultValue={String(settings.coupon_discount ?? "50")} className="input" />
            </div>
            <div>
              <label className="label">Potongan kupon produk lain (%)</label>
              <input name="coupon_discount_other" inputMode="numeric" defaultValue={String(settings.coupon_discount_other ?? "10")} className="input" />
              <p className="mt-1 text-[11px] text-muted">Laporan Gaya Diri & course.</p>
            </div>
            <div>
              <label className="label">Kode kupon umum</label>
              <input name="general_coupon_code" defaultValue={String(settings.general_coupon_code ?? "NEWECLUB")} className="input uppercase" />
              <p className="mt-1 text-[11px] text-muted">Disarankan ke pembeli yang belum punya kupon. Kosongkan untuk mematikan.</p>
            </div>
            <div>
              <label className="label">Masa tunggu komisi (hari)</label>
              <input name="affiliate_hold_days" inputMode="numeric" defaultValue={String(settings.affiliate_hold_days ?? "7")} className="input" />
            </div>
            <div>
              <label className="label">Komisi berlaku (bulan sejak daftar)</label>
              <input name="affiliate_months" inputMode="numeric" defaultValue={String(settings.affiliate_months ?? "12")} className="input" />
            </div>
          </div>
        </section>

        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Ruang Kerja Tim</h2>
          <p className="mt-1 text-sm text-muted">Hanya member Plus yang bisa membuat ruang kerja. Batas anggota (selain pemilik) per ruang kerja. Anggota boleh akun gratis.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Maks. anggota · Plus bulanan</label>
              <input name="team_max_monthly" inputMode="numeric" defaultValue={String(settings.team_max_monthly ?? "5")} className="input" />
            </div>
            <div>
              <label className="label">Maks. anggota · Plus tahunan</label>
              <input name="team_max_yearly" inputMode="numeric" defaultValue={String(settings.team_max_yearly ?? "15")} className="input" />
            </div>
          </div>
        </section>

        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Notifikasi WhatsApp</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Pengingat perpanjangan (H-berapa)</label>
              <input name="renewal_days" defaultValue={String(settings.renewal_days ?? "7,3,1")} className="input" placeholder="7,3,1" />
              <p className="mt-1 text-xs text-muted">Pisahkan dengan koma. Ditambah 1 pesan sehari setelah berakhir.</p>
            </div>
            <div>
              <label className="label">Maks. pesan per pagi</label>
              <input name="wa_daily_max" inputMode="numeric" defaultValue={String(settings.wa_daily_max ?? "40")} className="input" />
              <p className="mt-1 text-xs text-muted">Maksimal 70. Sesuaikan dengan kuota paket Fonnte.</p>
            </div>
            <div>
              <label className="label">Penyemangat pagi</label>
              <p className="rounded-xl bg-paper px-3 py-2.5 text-sm text-muted">Sekarang dikirim lewat notifikasi HP. Atur di tab <a href="/admin/notifikasi" className="font-semibold text-brand">Notifikasi</a>.</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Promo ulang tahun (ditambahkan di ucapan WA)</label>
            <textarea name="birthday_promo" rows={2} defaultValue={String(settings.birthday_promo ?? "")} className="input resize-y" placeholder="Misal: Diskon 20% EClub Plus tahunan khusus minggu ini. Balas pesan ini untuk klaim." />
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="p-5 lg:p-6">
            <h2 className="font-bold text-heading">Batas fitur per paket</h2>
            <p className="mt-1 text-xs text-muted">Kosongkan = tanpa batas. Isi 0 = terkunci. Fitur bertanda &quot;Segera&quot; belum aktif di aplikasi.</p>
          </div>
          <div className="divide-y divide-line border-t border-line">
            {features.map((f) => (
              <div key={f.key} className="grid gap-3 p-5 sm:grid-cols-[1fr_110px_110px] sm:items-center">
                <input type="hidden" name="key" value={f.key} />
                <div className="space-y-1.5">
                  <input name={`label_${f.key}`} defaultValue={f.label} className="input py-1.5 font-semibold" />
                  <input name={`desc_${f.key}`} defaultValue={f.description ?? ""} className="input py-1.5 text-xs text-muted" />
                  {!f.enforced && <span className="inline-block rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">Segera</span>}
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted">Gratis</span>
                  <input name={`free_${f.key}`} defaultValue={v(f.free_limit)} placeholder="∞" inputMode="numeric" className="input py-1.5 text-center" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-brand">Plus</span>
                  <input name={`plus_${f.key}`} defaultValue={v(f.plus_limit)} placeholder="∞" inputMode="numeric" className="input py-1.5 text-center" />
                </label>
              </div>
            ))}
          </div>
        </section>
      </fieldset>
      <FormMessage state={state} />
      {canEdit ? <SubmitButton>Simpan pengaturan</SubmitButton> : <p className="text-sm text-muted">Hanya Super Admin yang bisa mengubah paket.</p>}
    </form>
  );
}
