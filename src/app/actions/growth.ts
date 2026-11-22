"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";
import { getLimit } from "@/lib/plans";
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
  if (!title) return { error: "Tuliskan rencana aksinya." };
  const today = todayJakarta();
  const date = String(formData.get("date") ?? "") || today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  const supabase = await createClient();
  // Paket gratis: maksimal N rencana aksi BARU per hari (kebiasaan tidak dihitung).
  const limit = await getLimit("daily_action");
  if (limit !== null) {
    const { count } = await supabase.from("daily_actions").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00+07:00`);
    if ((count ?? 0) >= limit)
      return { error: `Paket gratis bisa menambah ${limit} rencana aksi baru per hari. Selesaikan atau lanjutkan yang ada, atau upgrade ke Plus untuk tanpa batas.` };
  }
  const workId = String(formData.get("work_id") ?? "") || null;
  let dreamId = String(formData.get("dream_id") ?? "") || null;
  if (workId && !dreamId) {
    const { data } = await supabase.from("works").select("dream_id").eq("id", workId).maybeSingle();
    dreamId = (data?.dream_id as string | null) ?? null;
  }
  const row = { title: title.slice(0, 160), action_date: date, dream_id: dreamId };
  let { error } = await supabase.from("daily_actions").insert({ ...row, work_id: workId, origin_date: date, status: "open" });
  if (error) ({ error } = await supabase.from("daily_actions").insert(row)); // sebelum SQL 021
  if (error) return { error: "Gagal menambah rencana aksi. Coba lagi sebentar." };
  revalidateDaily();
  return { message: "ok" };
}

export async function toggleDaily(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  const done = formData.get("done") !== "true";
  const id = String(formData.get("id"));
  const { error } = await supabase.from("daily_actions").update({ done, status: done ? "done" : "open", closed_at: null }).eq("id", id);
  if (error) await supabase.from("daily_actions").update({ done }).eq("id", id);
  revalidateDaily();
}

/** Lanjutkan (follow-up) rencana yang belum selesai ke hari ini atau besok. */
export async function followupDaily(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const to = formData.get("to") === "today" ? todayJakarta() : todayJakarta(1);
  const supabase = await createClient();
  const { data } = await supabase.from("daily_actions").select("*").eq("id", id).maybeSingle();
  if (!data) return;
  const { error } = await supabase
    .from("daily_actions")
    .update({ action_date: to, followups: Number(data.followups ?? 0) + 1, origin_date: data.origin_date ?? data.action_date })
    .eq("id", id);
  if (error) await supabase.from("daily_actions").update({ action_date: to }).eq("id", id);
  revalidateDaily();
}

/** Tutup rencana: tidak dilanjutkan lagi (bukan gagal, sekadar tidak relevan). */
export async function closeDaily(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("daily_actions").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", id);
  if (error) await supabase.from("daily_actions").delete().eq("id", id);
  revalidateDaily();
}

export async function deleteDaily(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("daily_actions").delete().eq("id", String(formData.get("id")));
  revalidateDaily();
}
