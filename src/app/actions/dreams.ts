"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";
import { getLimit, UPGRADE_HINT } from "@/lib/plans";

const DEMO_MSG = "Mode demo: data belum bisa disimpan sampai database disambungkan.";

function money(v: FormDataEntryValue | null) {
  const digits = String(v ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function revalidateDreams(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/goals");
  if (id) revalidatePath(`/goals/${id}`);
}

export async function createDream(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Tuliskan mimpi Anda terlebih dahulu." };

  const supabase = await createClient();
  const limit = await getLimit("dreams");
  if (limit != null) {
    const { count } = await supabase.from("dreams").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= limit) return { error: `Paket Anda bisa menyimpan ${limit} mimpi. ${UPGRADE_HINT}` };
  }
  const { data, error } = await supabase
    .from("dreams")
    .insert({
      title: title.slice(0, 120),
      category: String(formData.get("category") ?? "Lainnya"),
      why: String(formData.get("why") ?? "").trim().slice(0, 1000) || null,
      target_amount: money(formData.get("target_amount")),
      saved_amount: money(formData.get("saved_amount")) ?? 0,
      target_date: String(formData.get("target_date") ?? "") || null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Gagal menyimpan mimpi. Coba lagi." };

  const firstStep = String(formData.get("first_step") ?? "").trim();
  if (firstStep) await supabase.from("dream_actions").insert({ dream_id: data.id, title: firstStep.slice(0, 160) });

  revalidateDreams();
  redirect(`/goals/${data.id}`);
}

export async function updateSaved(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const id = String(formData.get("id"));
  const add = money(formData.get("amount"));
  if (!add) return { error: "Masukkan nominal." };
  const supabase = await createClient();
  const { data: dream } = await supabase.from("dreams").select("saved_amount").eq("id", id).single();
  if (!dream) return { error: "Mimpi tidak ditemukan." };
  const { error } = await supabase
    .from("dreams")
    .update({ saved_amount: Number(dream.saved_amount) + add })
    .eq("id", id);
  if (error) return { error: "Gagal menyimpan. Coba lagi." };
  revalidateDreams(id);
  return { message: "Tabungan diperbarui." };
}

export async function setDreamStatus(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["active", "achieved", "paused"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("dreams").update({ status }).eq("id", id);
  revalidateDreams(id);
}

export async function deleteDream(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("dreams").delete().eq("id", String(formData.get("id")));
  revalidateDreams();
  redirect("/goals");
}

export async function addAction(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const dreamId = String(formData.get("dream_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Tuliskan langkahnya." };
  const supabase = await createClient();
  const { error } = await supabase.from("dream_actions").insert({ dream_id: dreamId, title: title.slice(0, 160) });
  if (error) return { error: "Gagal menambah langkah." };
  revalidateDreams(dreamId);
  return { message: "ok" };
}

export async function toggleAction(formData: FormData) {
  if (isDemoMode) return;
  const id = String(formData.get("id"));
  const done = formData.get("done") === "true";
  const supabase = await createClient();
  const { data } = await supabase.from("dream_actions").update({ done: !done }).eq("id", id).select("dream_id").single();
  revalidateDreams(data?.dream_id);
}

export async function deleteAction(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("dream_actions")
    .delete()
    .eq("id", String(formData.get("id")))
    .select("dream_id")
    .single();
  revalidateDreams(data?.dream_id);
}
