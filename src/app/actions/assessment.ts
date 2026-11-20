"use server";

import { revalidatePath } from "next/cache";
import { getAssessment } from "@/lib/assessments";
import { scoreAssessment } from "@/lib/assessments/types";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Skor dihitung ulang di server dari jawaban, jadi hasil tidak bisa dimanipulasi dari browser. */
export async function submitAssessment(key: string, answers: Record<string, number>) {
  const a = getAssessment(key);
  if (!a || !a.questions.length) return { error: "Assessment belum tersedia." };
  const clean: Record<string, number> = {};
  for (const q of a.questions) {
    const v = Math.round(Number(answers[q.id]));
    if (!(v >= 1 && v <= 5)) return { error: "Masih ada pertanyaan yang belum dijawab." };
    clean[q.id] = v;
  }
  const scores = scoreAssessment(a, clean);
  if (isDemoMode) return { scores, demo: true };

  const supabase = await createClient();
  const { error } = await supabase.from("assessment_results").insert({ assessment_key: key, answers: clean, scores });
  if (error) return { error: "Gagal menyimpan hasil. Pastikan tabel tahap 4 sudah dibuat di Supabase." };
  revalidatePath(`/assessment/${key}`);
  return { scores };
}
