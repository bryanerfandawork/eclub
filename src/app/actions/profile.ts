"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";
import { normalizeWa } from "@/lib/whatsapp";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: perubahan belum bisa disimpan." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk lagi." };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: String(formData.get("full_name") ?? "").trim().slice(0, 80) || null,
    segment: String(formData.get("segment") ?? "") || null,
    success_definition: String(formData.get("success_definition") ?? "").trim().slice(0, 1000) || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Gagal menyimpan. Coba lagi." };
  revalidatePath("/", "layout");
  return { message: "Profil tersimpan." };
}

export async function updateWhatsApp(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: perubahan belum bisa disimpan." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk lagi." };
  const raw = String(formData.get("whatsapp") ?? "").trim();
  const optIn = formData.get("wa_opt_in") === "on";
  const wa = raw ? normalizeWa(raw) : null;
  if (raw && !wa) return { error: "Nomor WhatsApp tidak valid. Contoh: 081234567890" };
  if (optIn && !wa) return { error: "Isi nomor WhatsApp dulu untuk mengaktifkan notifikasi." };
  const { error } = await supabase
    .from("profiles")
    .update({ whatsapp: wa, wa_opt_in: optIn, wa_daily: formData.get("wa_daily") === "on" })
    .eq("id", user.id);
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 9 sudah dijalankan." };
  if (wa) {
    const { notifyWelcome } = await import("@/lib/whatsapp");
    await notifyWelcome(user.id, wa);
  }
  revalidatePath("/profile");
  return { message: optIn ? "Notifikasi WhatsApp aktif." : "Pengaturan WhatsApp tersimpan." };
}

/** Tanggal lahir & domisili (untuk ucapan ulang tahun dan info event di kota Anda). */
export async function updateBio(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: perubahan belum bisa disimpan." };
  const birth = String(formData.get("birth_date") ?? "");
  const province = String(formData.get("province") ?? "");
  const regency = String(formData.get("regency") ?? "");
  if (birth && (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || birth > new Date().toISOString().slice(0, 10) || birth < "1920-01-01")) return { error: "Tanggal lahir tidak valid." };
  if (province && !/^\d{2}$/.test(province)) return { error: "Provinsi tidak valid." };
  if (regency && (!/^\d{2}\.\d{2}$/.test(regency) || !regency.startsWith(province + "."))) return { error: "Pilih kota/kabupaten sesuai provinsinya." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk lagi." };
  const { error } = await supabase.from("profiles").update({ birth_date: birth || null, province: province || null, regency: regency || null }).eq("id", user.id);
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 14 sudah dijalankan." };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { message: "Data diri tersimpan." };
}

/** Langkah "Lengkapi data diri" setelah daftar (WA, tanggal lahir, domisili). */
export async function completeOnboarding(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) redirect("/dashboard");
  const raw = String(formData.get("whatsapp") ?? "").trim();
  const wa = normalizeWa(raw);
  const birth = String(formData.get("birth_date") ?? "");
  const province = String(formData.get("province") ?? "");
  const regency = String(formData.get("regency") ?? "");
  if (!wa) return { error: "Nomor WhatsApp tidak valid. Contoh: 081234567890" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || birth > new Date().toISOString().slice(0, 10) || birth < "1920-01-01") return { error: "Isi tanggal lahir yang benar." };
  if (!/^\d{2}$/.test(province)) return { error: "Pilih provinsi." };
  if (!/^\d{2}\.\d{2}$/.test(regency) || !regency.startsWith(province + ".")) return { error: "Pilih kota/kabupaten." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk lagi." };
  const { error } = await supabase
    .from("profiles")
    .update({ whatsapp: wa, wa_opt_in: formData.get("wa_opt_in") === "on", birth_date: birth, province, regency })
    .eq("id", user.id);
  if (error) return { error: "Gagal menyimpan. Coba lagi sebentar lagi." };
  const { notifyWelcome } = await import("@/lib/whatsapp");
  await notifyWelcome(user.id, wa);
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

function safeNext(v: FormDataEntryValue | null) {
  const n = String(v ?? "");
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}
