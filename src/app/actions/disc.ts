"use server";

import { revalidatePath } from "next/cache";
import { scoreDisc, validDisc } from "@/lib/disc/score";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Skor dihitung ulang di server dari jawaban, mengikuti rumus Excel DISC. */
export async function submitDisc(raw: unknown) {
  const answers = validDisc(raw);
  if (!answers) return { error: "Setiap nomor harus punya satu pilihan 'paling sesuai' dan satu 'paling tidak sesuai' yang berbeda." };
  const result = scoreDisc(answers);
  if (isDemoMode) return { ok: true, demo: true };
  const supabase = await createClient();
  const { error } = await supabase.from("assessment_results").insert({ assessment_key: "disc", answers, scores: result });
  if (error) return { error: "Gagal menyimpan hasil: " + error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
