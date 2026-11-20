"use server";

import { revalidatePath } from "next/cache";
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
  revalidatePath("/profile");
  return { message: optIn ? "Notifikasi WhatsApp aktif." : "Pengaturan WhatsApp tersimpan." };
}
