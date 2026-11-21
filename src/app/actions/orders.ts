"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { normalizeWa, notifyOrderCancelled, notifyOrderCreated, notifyOrderPaid } from "@/lib/whatsapp";
import type { FormState } from "./auth";

export async function startOrder(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: pembayaran belum aktif." };
  const product = String(formData.get("product"));
  const slug = String(formData.get("slug") ?? "") || null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", { p_product: product, p_course_slug: slug });
  if (error || !data) return { error: error?.message ?? "Gagal membuat pesanan." };
  const order = data as { id: string; created_at: string };
  // Kirim notifikasi hanya untuk pesanan yang baru dibuat (bukan pesanan lama yang dipakai ulang).
  if (Date.now() - new Date(order.created_at).getTime() < 60_000) await notifyOrderCreated(order.id);
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
  const id = String(formData.get("id"));
  const { error } = await supabase.rpc("admin_cancel_order", { p_order: id });
  if (!error) await notifyOrderCancelled(id);
  revalidatePath("/admin/pesanan");
}

/** Simpan nomor WhatsApp untuk notifikasi transaksi (dari halaman pesanan). */
export async function saveOrderWa(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo." };
  const wa = normalizeWa(String(formData.get("whatsapp") ?? ""));
  if (!wa) return { error: "Nomor WhatsApp tidak valid. Contoh: 081234567890" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir." };
  const { error } = await supabase.from("profiles").update({ whatsapp: wa }).eq("id", user.id);
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 9 sudah dijalankan." };
  const orderId = String(formData.get("order_id") ?? "");
  if (orderId) await notifyOrderCreated(orderId, false);
  revalidatePath(`/pesanan/${orderId}`);
  return { message: "Nomor tersimpan. Info pembayaran sudah dikirim ke WhatsApp Anda." };
}
