"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

function revalidateWorks() {
  for (const p of ["/rutinitas", "/today", "/dashboard"]) revalidatePath(p);
}

export async function addWork(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: data belum bisa disimpan." };
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) return { error: "Tulis nama pekerjaan atau aktivitasnya." };
  const supabase = await createClient();
  const { count } = await supabase.from("works").select("id", { count: "exact", head: true }).eq("archived", false);
  if ((count ?? 0) >= 12) return { error: "Maksimal 12 pekerjaan aktif. Arsipkan yang sudah tidak dijalani." };
  const { error } = await supabase.from("works").insert({ name, dream_id: String(formData.get("dream_id") ?? "") || null });
  if (error) return { error: "Gagal menyimpan. Pastikan SQL 021 sudah dijalankan." };
  revalidateWorks();
  return { message: "Pekerjaan ditambahkan ✓" };
}

export async function archiveWork(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("works").update({ archived: true }).eq("id", String(formData.get("id")));
  revalidateWorks();
}
