"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notifyPayout } from "@/lib/whatsapp";
import type { FormState } from "./auth";

export async function requestPayout(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: pencairan belum bisa diajukan." };
  const amount = Number(formData.get("amount")) || 0;
  const bank = [formData.get("bank"), formData.get("account"), formData.get("holder")].map((x) => String(x ?? "").trim()).filter(Boolean).join(" · ");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_payout", { p_amount: amount, p_bank: bank });
  if (error) return { error: error.message.includes("function") ? "Fitur affiliate belum aktif (SQL tahap 13)." : error.message };
  await notifyPayout(String(data), "requested");
  revalidatePath("/affiliate");
  return { message: "Permintaan terkirim ✓ Admin akan mentransfer dalam 1–3 hari kerja." };
}

export async function adminProcessPayout(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_process_payout", { p_id: id, p_status: String(formData.get("status")), p_note: String(formData.get("note") ?? "") });
  if (!error) await notifyPayout(id, "processed");
  revalidatePath("/admin/affiliate");
}
