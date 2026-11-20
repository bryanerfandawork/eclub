"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";
import { WHEEL_AREAS } from "@/lib/types";
import type { FormState } from "./auth";

const DEMO_MSG = "Mode demo: data belum bisa disimpan sampai database disambungkan.";

export async function saveWheel(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const scores: Record<string, number> = {};
  for (const { key } of WHEEL_AREAS) {
    const n = Math.round(Number(formData.get(key)));
    if (!(n >= 1 && n <= 10)) return { error: "Beri nilai 1–10 untuk setiap area." };
    scores[key] = n;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("wheel_assessments").insert({
    scores,
    note: String(formData.get("note") ?? "").trim().slice(0, 1000) || null,
  });
  if (error) return { error: "Gagal menyimpan. Pastikan tabel tahap 2 sudah dibuat di Supabase." };
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  redirect("/wheel-of-life?tersimpan=1");
}

function revalidateDaily() {
  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath("/progress");
}

export async function addDaily(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Tuliskan aksinya." };
  const date = String(formData.get("date") ?? "") || todayJakarta();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("daily_actions").insert({
    title: title.slice(0, 160),
    action_date: date,
    dream_id: String(formData.get("dream_id") ?? "") || null,
  });
  if (error) return { error: "Gagal menambah aksi. Pastikan tabel tahap 2 sudah dibuat di Supabase." };
  revalidateDaily();
  return { message: "ok" };
}

export async function toggleDaily(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase
    .from("daily_actions")
    .update({ done: formData.get("done") !== "true" })
    .eq("id", String(formData.get("id")));
  revalidateDaily();
}

export async function deleteDaily(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("daily_actions").delete().eq("id", String(formData.get("id")));
  revalidateDaily();
}

/** Pindahkan aksi kemarin yang belum selesai ke hari ini. */
export async function carryOverDaily() {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase
    .from("daily_actions")
    .update({ action_date: todayJakarta() })
    .eq("done", false)
    .lt("action_date", todayJakarta())
    .gte("action_date", todayJakarta(-7));
  revalidateDaily();
}
