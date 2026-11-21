"use server";

import { revalidatePath } from "next/cache";
import { CATEGORIES, TRANSFERS, type TxKind, type Wallet } from "@/lib/finance";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

export async function saveTx(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: transaksi belum bisa disimpan." };
  const kind = String(formData.get("kind")) as TxKind;
  const amount = Number(String(formData.get("amount") ?? "").replace(/[^\d]/g, ""));
  if (!amount || amount <= 0) return { error: "Isi nominalnya dulu." };
  const category = String(formData.get("category") ?? "");
  const date = String(formData.get("tx_date") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200) || null;
  let row: Record<string, unknown>;
  if (kind === "transfer") {
    const tr = TRANSFERS.find((t) => t.key === category);
    if (!tr) return { error: "Pilih jenis pindah dana." };
    row = { kind, wallet: tr.from, to_wallet: tr.to, category, amount, note };
  } else if (kind === "in" || kind === "out") {
    const wallet = String(formData.get("wallet")) as Wallet;
    if (!(wallet in CATEGORIES)) return { error: "Pilih dompet." };
    if (!CATEGORIES[wallet][kind].some((c) => c.key === category)) return { error: "Pilih kategori." };
    row = { kind, wallet, category, amount, note };
  } else return { error: "Jenis transaksi tidak valid." };
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) row.tx_date = date;
  const supabase = await createClient();
  const { error } = await supabase.from("fin_transactions").insert(row);
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 12 sudah dijalankan." };
  revalidatePath("/keuangan");
  revalidatePath("/dashboard");
  return { message: "Tersimpan ✓" };
}

export async function deleteTx(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("fin_transactions").delete().eq("id", String(formData.get("id")));
  revalidatePath("/keuangan");
  revalidatePath("/dashboard");
}
