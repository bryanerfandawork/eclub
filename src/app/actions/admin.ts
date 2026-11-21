"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

const DEMO_MSG = "Mode demo: perubahan admin tidak disimpan.";

function limitValue(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (s === "" || s === "∞") return null;
  const n = Math.floor(Number(s));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function setUserPlan(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const plan = String(formData.get("plan"));
  if (!["free", "plus"].includes(plan)) return { error: "Paket tidak valid." };
  const months = Number(formData.get("months") ?? 0);
  const expires = plan === "plus" && months > 0 ? new Date(Date.now() + months * 30.44 * 86_400_000).toISOString() : null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_plan", { target: String(formData.get("id")), new_plan: plan, expires });
  if (error) return { error: "Gagal: " + error.message };
  revalidatePath("/admin", "layout");
  return { message: plan === "plus" ? "Paket Plus diberikan." : "Paket diubah ke Gratis." };
}

export async function setUserRole(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const role = String(formData.get("role"));
  if (!["member", "mentor", "admin", "super_admin"].includes(role)) return { error: "Peran tidak valid." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_role", { target: String(formData.get("id")), new_role: role });
  if (error) return { error: "Gagal: " + error.message };
  revalidatePath("/admin", "layout");
  return { message: "Peran diperbarui." };
}

export async function saveFeatures(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const supabase = await createClient();
  const keys = formData.getAll("key").map(String);
  for (const key of keys) {
    const { error } = await supabase.rpc("admin_update_feature", {
      fkey: key,
      new_free: limitValue(formData.get(`free_${key}`)),
      new_plus: limitValue(formData.get(`plus_${key}`)),
      new_label: String(formData.get(`label_${key}`) ?? ""),
      new_description: String(formData.get(`desc_${key}`) ?? "") || null,
    });
    if (error) return { error: "Gagal menyimpan " + key + ": " + error.message };
  }
  const settings: [string, unknown][] = [
    ["plus_price_monthly", Number(String(formData.get("plus_price_monthly") ?? "").replace(/[^\d]/g, "")) || 0],
    ["plus_price_yearly", Number(String(formData.get("plus_price_yearly") ?? "").replace(/[^\d]/g, "")) || 0],
    ["upgrade_contact", String(formData.get("upgrade_contact") ?? "").trim().slice(0, 200)],
    ["disc_report_price", Number(String(formData.get("disc_report_price") ?? "").replace(/[^\d]/g, "")) || 49000],
    ["affiliate_rate", Math.min(50, Math.max(0, Number(String(formData.get("affiliate_rate") ?? "").replace(/[^\d]/g, "")) || 20))],
    ["coupon_discount", Math.min(50, Math.max(0, Number(String(formData.get("coupon_discount") ?? "").replace(/[^\d]/g, "")) || 0))],
    ["affiliate_hold_days", Math.min(60, Math.max(0, Number(String(formData.get("affiliate_hold_days") ?? "").replace(/[^\d]/g, "")) || 7))],
    ["affiliate_months", Math.min(120, Math.max(1, Number(String(formData.get("affiliate_months") ?? "").replace(/[^\d]/g, "")) || 12))],
    ["renewal_days", String(formData.get("renewal_days") ?? "7,3,1").replace(/[^\d,]/g, "").slice(0, 30) || "7,3,1"],
    ["wa_daily_max", Math.min(70, Math.max(1, Number(String(formData.get("wa_daily_max") ?? "").replace(/[^\d]/g, "")) || 40))],
    ["wa_motivation", formData.get("wa_motivation") !== "false"],
    ["birthday_promo", String(formData.get("birthday_promo") ?? "").trim().slice(0, 300)],
    ["payment_mode", formData.get("payment_mode") === "auto" ? "auto" : "manual"],
    ["admin_whatsapp", String(formData.get("admin_whatsapp") ?? "").replace(/[^\d+]/g, "").slice(0, 20)],
    ["qris_image_url", (() => { const v = String(formData.get("qris_image_url") ?? "").trim(); return /^(https:\/\/|\/)/.test(v) ? v.slice(0, 500) : ""; })()],
    ["bank_accounts", String(formData.get("bank_accounts") ?? "").trim().slice(0, 1000)],
  ];
  for (const [skey, svalue] of settings) {
    const { error } = await supabase.rpc("admin_set_setting", { skey, svalue });
    if (error) return { error: "Gagal menyimpan pengaturan: " + error.message };
  }
  revalidatePath("/", "layout");
  return { message: "Pengaturan tersimpan." };
}

/** Unggah gambar QRIS ke Supabase Storage (bucket "assets") lalu simpan tautannya di pengaturan. */
export async function uploadQris(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const file = formData.get("qris");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file gambar QRIS dulu." };
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return { error: "Format harus PNG, JPG, atau WEBP." };
  if (file.size > 2_000_000) return { error: "Ukuran gambar maksimal 2 MB." };
  const supabase = await createClient();
  const path = `qris-${Date.now()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
  const { error } = await supabase.storage.from("assets").upload(path, file, { contentType: file.type, upsert: true });
  if (error) return { error: "Gagal mengunggah: " + error.message + ". Pastikan SQL tahap 11 sudah dijalankan." };
  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  const { error: e2 } = await supabase.rpc("admin_set_setting", { skey: "qris_image_url", svalue: data.publicUrl });
  if (e2) return { error: "Gagal menyimpan: " + e2.message };
  revalidatePath("/", "layout");
  return { message: "QRIS tersimpan dan tampil di halaman pembayaran." };
}

/** Kirim pesan uji WhatsApp ke nomor admin untuk memastikan Fonnte tersambung. */
export async function testWhatsapp(): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const { sendWa, normalizeWa, waConfigured } = await import("@/lib/whatsapp");
  if (!waConfigured()) return { error: "FONNTE_TOKEN belum diisi di Vercel (lalu Redeploy)." };
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
  const wa = normalizeWa(String((data?.value as string) ?? ""));
  if (!wa) return { error: "Isi dulu No. WhatsApp admin di bawah, lalu simpan." };
  const ok = await sendWa(wa, "✅ Tes dari EClub: WhatsApp (Fonnte) sudah tersambung dengan benar.");
  return ok ? { message: "Pesan uji terkirim. Cek WhatsApp admin." } : { error: "Gagal mengirim. Periksa token Fonnte dan pastikan perangkat WA di Fonnte berstatus Connected." };
}
