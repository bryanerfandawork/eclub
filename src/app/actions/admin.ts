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
    ["bank_accounts", String(formData.get("bank_accounts") ?? "").trim().slice(0, 1000)],
  ];
  for (const [skey, svalue] of settings) {
    const { error } = await supabase.rpc("admin_set_setting", { skey, svalue });
    if (error) return { error: "Gagal menyimpan pengaturan: " + error.message };
  }
  revalidatePath("/", "layout");
  return { message: "Pengaturan paket tersimpan." };
}
