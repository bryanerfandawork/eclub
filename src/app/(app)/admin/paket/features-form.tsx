"use client";

import { useActionState } from "react";
import { saveFeatures } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { PlanFeature } from "@/lib/plans";

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
              <input name="disc_report_price" inputMode="numeric" defaultValue={String(settings.disc_report_price ?? "29000")} className="input" />
            </div>
            <div>
              <label className="label">Komisi affiliate (%)</label>
              <input name="affiliate_rate" inputMode="numeric" defaultValue={String(settings.affiliate_rate ?? "20")} className="input" />
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
            <p className="mt-1 text-xs text-muted">Ditampilkan di halaman pembayaran. Pada mode otomatis, harus rekening yang terhubung ke Moota.</p>
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
