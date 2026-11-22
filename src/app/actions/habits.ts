"use server";

import { revalidatePath } from "next/cache";
import { todayJakarta } from "@/lib/format";
import { getLimit } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

const DEMO = { error: "Mode demo: data belum bisa disimpan." };

function revalidateHabits() {
  for (const p of ["/kebiasaan", "/rutinitas", "/today", "/dashboard"]) revalidatePath(p);
}

export async function addHabit(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const emoji = String(formData.get("emoji") ?? "✅").slice(0, 8) || "✅";
  if (!name) return { error: "Tulis nama kebiasaannya." };
  const supabase = await createClient();
  const limit = await getLimit("habits");
  if (limit !== null) {
    const { count } = await supabase.from("habits").select("id", { count: "exact", head: true }).eq("archived", false);
    if ((count ?? 0) >= limit) return { error: `Paket gratis bisa memantau ${limit} kebiasaan. Upgrade ke Plus untuk tanpa batas, atau arsipkan salah satu.` };
  }
  const dream_id = String(formData.get("dream_id") ?? "") || null;
  let { error } = await supabase.from("habits").insert({ name, emoji, dream_id });
  if (error) ({ error } = await supabase.from("habits").insert({ name, emoji })); // sebelum SQL 021
  if (error) return { error: "Gagal menyimpan. Coba lagi sebentar." };
  revalidateHabits();
  return { message: "Kebiasaan ditambahkan ✓" };
}

export async function toggleHabit(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const date = String(formData.get("date") ?? todayJakarta());
  const done = formData.get("done") === "1";
  const supabase = await createClient();
  if (done) await supabase.from("habit_logs").delete().eq("habit_id", id).eq("log_date", date);
  else await supabase.from("habit_logs").insert({ habit_id: id, log_date: date });
  revalidateHabits();
}

export async function archiveHabit(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("habits").update({ archived: true }).eq("id", String(formData.get("id")));
  revalidateHabits();
}

export async function saveGratitude(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const items = [1, 2, 3].map((i) => String(formData.get(`item${i}`) ?? "").trim().slice(0, 200)).filter(Boolean);
  const mood = Number(formData.get("mood")) || null;
  if (items.length === 0) return { error: "Tuliskan minimal satu hal yang Anda syukuri hari ini." };
  const supabase = await createClient();
  const { error } = await supabase.from("gratitude_entries").upsert({ entry_date: todayJakarta(), items, mood }, { onConflict: "user_id,entry_date" });
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 13 sudah dijalankan." };
  revalidatePath("/kebiasaan");
  return { message: "Tersimpan. Terima kasih sudah berhenti sejenak untuk bersyukur 🙏" };
}
