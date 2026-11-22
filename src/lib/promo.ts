import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { getSettings } from "./plans";

export const DEFAULT_PROMO_NOTE = "Harga spesial saat ini. Harga dapat menyesuaikan sewaktu-waktu seiring bertambahnya fitur dan materi, jadi amankan selagi masih berlaku.";

export type Promo =
  | { kind: "date"; label: string; endsAt: string; note: string }
  | { kind: "quota"; label: string; left: number; total: number; note: string }
  | { kind: "special"; note: string };

/**
 * Status promo harga Plus, selalu jujur: kuota dihitung dari pembelian Plus yang benar-benar lunas sejak promo dimulai,
 * tanggal berakhir memakai akhir hari WIB. Kuota habis / tanggal lewat -> kembali ke kalimat "harga spesial".
 */
export const getPromo = cache(async (): Promise<Promo> => {
  const s = await getSettings();
  const note = String(s.promo_note ?? "").trim() || DEFAULT_PROMO_NOTE;
  const label = String(s.promo_label ?? "").trim() || "Harga promo";
  const mode = String(s.promo_mode ?? "none");
  if (mode === "date") {
    const end = String(s.promo_end ?? "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      const endsAt = `${end}T23:59:59+07:00`;
      if (new Date(endsAt).getTime() > Date.now()) return { kind: "date", label, endsAt, note };
    }
  }
  if (mode === "quota") {
    const total = Math.max(0, Math.round(Number(s.promo_quota) || 0));
    const start = /^\d{4}-\d{2}-\d{2}$/.test(String(s.promo_start ?? "")) ? `${s.promo_start}T00:00:00+07:00` : null;
    if (total > 0 && start) {
      let used = 0;
      if (!isDemoMode) {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc("promo_paid_count", { since: start });
        if (error) return { kind: "special", note }; // SQL 020 belum dijalankan: jangan tampilkan angka palsu.
        used = Number(data) || 0;
      } else used = Math.round(total * 0.6);
      const left = total - used;
      if (left > 0) return { kind: "quota", label, left, total, note };
    }
  }
  return { kind: "special", note };
});
