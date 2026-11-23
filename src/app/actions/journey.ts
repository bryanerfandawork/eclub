"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const KEYS: Record<string, string> = { rekap: "rekap_ack", ritme: "ritme_ack" };

/** "Saya paham & siap lanjut": menandai isian rekap (langkah 4) atau ritme evaluasi (langkah 5) selesai. */
export async function ackStep(formData: FormData) {
  const key = KEYS[String(formData.get("step"))];
  const next = String(formData.get("next") ?? "/dashboard");
  if (!key || isDemoMode) redirect(next.startsWith("/") ? next : "/dashboard");
  const supabase = await createClient();
  const { count } = await supabase.from("assessment_results").select("id", { count: "exact", head: true }).eq("assessment_key", key);
  if (!count) await supabase.from("assessment_results").insert({ assessment_key: key, answers: {}, scores: {} });
  for (const p of ["/dashboard", "/journey", "/rekap", "/evaluasi"]) revalidatePath(p);
  redirect(next.startsWith("/") ? next : "/dashboard");
}
