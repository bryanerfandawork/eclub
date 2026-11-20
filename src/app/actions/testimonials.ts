"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

export async function saveTestimonial(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: perubahan tidak disimpan." };
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const quote = String(formData.get("quote") ?? "").trim().slice(0, 600);
  if (!name || !quote) return { error: "Nama dan isi testimoni wajib diisi." };
  const photo = String(formData.get("photo_url") ?? "").trim();
  const row = {
    name,
    quote,
    role: String(formData.get("role") ?? "").trim().slice(0, 80) || null,
    photo_url: /^https:\/\//.test(photo) ? photo.slice(0, 500) : null,
    published: formData.get("published") === "on",
    sort: Math.floor(Number(formData.get("sort") ?? 0)) || 0,
  };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("testimonials").update(row).eq("id", id) : await supabase.from("testimonials").insert(row);
  if (error) return { error: "Gagal menyimpan: " + error.message };
  revalidatePath("/", "layout");
  return { message: id ? "Testimoni diperbarui." : "Testimoni ditambahkan." };
}

export async function deleteTestimonial(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}
