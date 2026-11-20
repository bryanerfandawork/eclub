"use server";

import { revalidatePath } from "next/cache";
import { computePlacement, PLACEMENT_KEY, validAnswers } from "@/lib/placement";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Posisi dihitung ulang di server dari jawaban. Disimpan di tabel assessment_results (tanpa batas paket). */
export async function submitPlacement(raw: Record<string, unknown>) {
  const answers = validAnswers(raw);
  if (!answers) return { error: "Masih ada pertanyaan yang belum dijawab." };
  const result = computePlacement(answers);
  if (isDemoMode) return result;
  const supabase = await createClient();
  const { error } = await supabase.from("assessment_results").insert({ assessment_key: PLACEMENT_KEY, answers, scores: result });
  if (error) return { error: "Gagal menyimpan hasil: " + error.message };
  revalidatePath("/", "layout");
  return result;
}
