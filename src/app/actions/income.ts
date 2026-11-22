"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { cleanProfile } from "@/lib/income";

export async function saveIncome(raw: unknown): Promise<{ ok?: boolean; error?: string }> {
  if (isDemoMode) return { error: "Mode demo: data belum bisa disimpan." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };
  const p = cleanProfile(raw);
  const { error } = await supabase.from("income_profiles").upsert({ user_id: user.id, ...p, updated_at: new Date().toISOString() });
  if (error) {
    console.error("saveIncome", error);
    return { error: error.code === "42P01" ? "Fitur ini butuh SQL 020 dijalankan admin." : "Gagal menyimpan. Coba lagi." };
  }
  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { ok: true };
}
