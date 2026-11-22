"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

/** Simpan evaluasi mingguan (disimpan di assessment_results dengan kunci weekly_review). */
export async function saveReview(_: FormState, fd: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: evaluasi belum bisa disimpan." };
  const t = (k: string) => String(fd.get(k) ?? "").trim().slice(0, 500);
  const win = t("win");
  const fix = t("fix");
  const focus = t("focus");
  const mood = Math.min(5, Math.max(1, Number(fd.get("mood")) || 3));
  if (!win || !focus) return { error: "Isi minimal pertanyaan 1 dan 3." };
  const supabase = await createClient();
  const { error } = await supabase.from("assessment_results").insert({ assessment_key: "weekly_review", answers: { win, fix, focus }, scores: { mood } });
  if (error) return { error: "Gagal menyimpan. Coba lagi." };
  revalidatePath("/evaluasi");
  revalidatePath("/dashboard");
  return { message: "Evaluasi minggu ini tersimpan. Hebat, Anda menjaga kompas tetap lurus! 🧭" };
}
