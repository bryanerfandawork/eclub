"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { cleanProfile } from "@/lib/income";

type Part = "income" | "potensi";

/** Simpan sebagian Peta Income: "income" (kesibukan, penghasilan, pengeluaran, rencana) atau "potensi" (minat-bakat, SWOT, aset). */
export async function saveIncome(raw: unknown, part: Part = "income"): Promise<{ ok?: boolean; error?: string }> {
  if (isDemoMode) return { error: "Mode demo: data belum bisa disimpan." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir, silakan masuk lagi." };
  const p = cleanProfile(raw);
  const cols =
    part === "potensi"
      ? { interests: p.interests, hobbies: p.hobbies, talents: p.talents, passions: p.passions, swot: p.swot, assets: p.assets }
      : { situation: p.situation, sources: p.sources, expenses: p.expenses, plans: p.plans };
  const { error } = await supabase.from("income_profiles").upsert({ user_id: user.id, ...cols, updated_at: new Date().toISOString() });
  if (error) {
    console.error("saveIncome", error);
    return { error: error.code === "42P01" ? "Fitur ini butuh SQL 020 dijalankan admin." : "Gagal menyimpan. Coba lagi." };
  }
  revalidatePath("/income");
  revalidatePath("/potensi");
  revalidatePath("/journey");
  revalidatePath("/dashboard");
  return { ok: true };
}
