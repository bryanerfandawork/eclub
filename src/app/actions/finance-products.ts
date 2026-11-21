"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

export async function saveProduct(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: produk belum bisa disimpan." };
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Beri nama produknya dulu." };
  let data: unknown = {};
  try {
    data = JSON.parse(String(formData.get("data") ?? "{}"));
  } catch {
    return { error: "Data kalkulator tidak valid." };
  }
  const hpp = Math.max(0, Math.round(Number(formData.get("hpp")) || 0));
  const price = Math.max(0, Math.round(Number(formData.get("price")) || 0));
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const row = { name, data, hpp, price };
  const { error } = id ? await supabase.from("fin_products").update(row).eq("id", id) : await supabase.from("fin_products").insert(row);
  if (error) return { error: "Gagal menyimpan. Fitur simpan produk khusus member Plus (dan pastikan SQL tahap 13 sudah dijalankan)." };
  revalidatePath("/keuangan/hpp");
  return { message: "Produk tersimpan ✓" };
}

export async function deleteProduct(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("fin_products").delete().eq("id", String(formData.get("id")));
  revalidatePath("/keuangan/hpp");
}
