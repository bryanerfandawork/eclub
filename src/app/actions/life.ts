"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { VALUE_OPTIONS, WHEEL_AREAS } from "@/lib/types";
import type { FormState } from "./auth";

export async function saveLifePlan(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: data belum bisa disimpan sampai database disambungkan." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk lagi." };

  const allowedValues = new Set<string>(VALUE_OPTIONS);
  const values = formData.getAll("core_values").map(String).filter((v) => allowedValues.has(v)).slice(0, 5);
  const areaKeys = new Set<string>(WHEEL_AREAS.map((a) => a.key));
  const priorities = String(formData.get("priorities") ?? "")
    .split(",")
    .filter((k) => areaKeys.has(k))
    .slice(0, 3);
  const success = String(formData.get("success_definition") ?? "").trim().slice(0, 1000) || null;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("life_plans").upsert({
      user_id: user.id,
      core_values: values,
      vision: String(formData.get("vision") ?? "").trim().slice(0, 2000) || null,
      priorities,
      updated_at: new Date().toISOString(),
    }),
    supabase.from("profiles").upsert({ id: user.id, success_definition: success, updated_at: new Date().toISOString() }),
  ]);
  if (e1 || e2) return { error: "Gagal menyimpan. Pastikan tabel tahap 3 sudah dibuat di Supabase." };
  revalidatePath("/", "layout");
  redirect("/my-life?tersimpan=1");
}
