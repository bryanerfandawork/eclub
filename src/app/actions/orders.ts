"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notifyOrderPaid } from "@/lib/whatsapp";
import type { FormState } from "./auth";

export async function startOrder(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: pembayaran belum aktif." };
  const product = String(formData.get("product"));
  const slug = String(formData.get("slug") ?? "") || null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", { p_product: product, p_course_slug: slug });
  if (error || !data) return { error: error?.message ?? "Gagal membuat pesanan." };
  redirect(`/pesanan/${(data as { id: string }).id}`);
}

export async function adminMarkPaid(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.rpc("admin_mark_paid", { p_order: id });
  if (!error) await notifyOrderPaid(id);
  revalidatePath("/admin/pesanan");
}

export async function adminCancelOrder(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.rpc("admin_cancel_order", { p_order: String(formData.get("id")) });
  revalidatePath("/admin/pesanan");
}
