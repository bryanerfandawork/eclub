"use server";

import { revalidatePath } from "next/cache";
import { CATEGORIES, MOVE, TRANSFERS, type TxKind, type Wallet } from "@/lib/finance";
import { todayJakarta } from "@/lib/format";
import { getAccount, getLimit, isAdmin } from "@/lib/plans";
import { PROVIDERS, type PocketType } from "@/lib/pockets";
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
  const supabase = await createClient();
  // Kantong (SQL 022). Sebelum SQL dijalankan, daftar kantong kosong dan transaksi disimpan seperti dulu.
  const { data: pk, error: pkErr } = await supabase.from("fin_pockets").select("id, wallet").eq("archived", false).order("created_at");
  const pockets = pkErr ? [] : ((pk ?? []) as { id: string; wallet: Wallet }[]);
  const pick = (id: string, w: Wallet) => pockets.find((p) => p.id === id && p.wallet === w) ?? pockets.find((p) => p.wallet === w);
  let row: Record<string, unknown>;
  if (kind === "transfer") {
    if (category === MOVE.key) {
      const acc = await getAccount();
      if (acc.plan !== "plus" && !isAdmin(acc.role)) return { error: "Pindah antar kantong khusus member Plus." };
      const from = pockets.find((p) => p.id === String(formData.get("pocket_id")));
      const to = pockets.find((p) => p.id === String(formData.get("to_pocket_id")));
      if (!from || !to || from.id === to.id) return { error: "Pilih kantong asal dan tujuan yang berbeda." };
      row = { kind, wallet: from.wallet, to_wallet: to.wallet, pocket_id: from.id, to_pocket_id: to.id, category, amount, note };
    } else {
      const tr = TRANSFERS.find((t) => t.key === category);
      if (!tr) return { error: "Pilih jenis pindah dana." };
      row = { kind, wallet: tr.from, to_wallet: tr.to, category, amount, note };
      const from = pick(String(formData.get("pocket_id") ?? ""), tr.from);
      const to = pick(String(formData.get("to_pocket_id") ?? ""), tr.to);
      if (from && to) Object.assign(row, { pocket_id: from.id, to_pocket_id: to.id });
    }
  } else if (kind === "in" || kind === "out") {
    const wallet = String(formData.get("wallet")) as Wallet;
    if (!(wallet in CATEGORIES)) return { error: "Pilih dompet." };
    if (!CATEGORIES[wallet][kind].some((c) => c.key === category)) return { error: "Pilih kategori." };
    row = { kind, wallet, category, amount, note };
    const p = pick(String(formData.get("pocket_id") ?? ""), wallet);
    if (p) row.pocket_id = p.id;
  } else return { error: "Jenis transaksi tidak valid." };
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) row.tx_date = date;
  const { error } = await supabase.from("fin_transactions").insert(row);
  if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 12 sudah dijalankan." };
  revalidateFin();
  return { message: "Tersimpan ✓" };
}

export async function deleteTx(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("fin_transactions").delete().eq("id", String(formData.get("id")));
  revalidateFin();
}

function revalidateFin() {
  for (const p of ["/keuangan", "/keuangan/kantong", "/dashboard", "/today"]) revalidatePath(p);
}

function pocketFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  const provider = String(formData.get("provider") ?? "") || null;
  const prov = PROVIDERS.find((p) => p.key === provider);
  let type = String(formData.get("type") ?? "cash") as PocketType;
  if (prov) type = prov.type;
  if (!["cash", "bank", "ewallet", "other"].includes(type)) type = "cash";
  return { name: name || prov?.label || "", type, provider: prov ? prov.key : null };
}

export async function addPocket(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: kantong belum bisa disimpan." };
  const f = pocketFields(formData);
  const wallet = String(formData.get("wallet")) as Wallet;
  if (wallet !== "personal" && wallet !== "business") return { error: "Pilih pribadi atau usaha." };
  if (!f.name) return { error: "Beri nama kantongnya, misal: Dompet, BCA, GoPay." };
  const supabase = await createClient();
  const limit = await getLimit("fin_pockets");
  if (limit !== null) {
    const { count } = await supabase.from("fin_pockets").select("id", { count: "exact", head: true }).eq("archived", false);
    if ((count ?? 0) >= limit)
      return { error: `Paket gratis punya ${limit} kantong (1 pribadi + 1 usaha). Anda bisa mengganti nama/jenis kantong yang ada, atau upgrade ke Plus untuk kantong tanpa batas.` };
  }
  const { error } = await supabase.from("fin_pockets").insert({ ...f, wallet });
  if (error) return { error: "Gagal menyimpan. Pastikan SQL 022 sudah dijalankan." };
  revalidateFin();
  return { message: "Kantong ditambahkan ✓" };
}

export async function updatePocket(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: kantong belum bisa disimpan." };
  const f = pocketFields(formData);
  if (!f.name) return { error: "Nama kantong wajib diisi." };
  const supabase = await createClient();
  const { error } = await supabase.from("fin_pockets").update(f).eq("id", String(formData.get("id")));
  if (error) return { error: "Gagal menyimpan." };
  revalidateFin();
  return { message: "Tersimpan ✓" };
}

export async function archivePocket(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  const id = String(formData.get("id"));
  // Kantong terakhir di dompet itu tidak boleh diarsipkan.
  const { data: p } = await supabase.from("fin_pockets").select("wallet").eq("id", id).maybeSingle();
  if (!p) return;
  const { count } = await supabase.from("fin_pockets").select("id", { count: "exact", head: true }).eq("archived", false).eq("wallet", p.wallet);
  if ((count ?? 0) <= 1) return;
  // Saldo harus nol dulu (pindahkan isinya), supaya uang tidak "hilang" dari saldo dompet.
  const { data: bal } = await supabase.rpc("fin_pocket_balances");
  if (Number(((bal ?? []) as { pocket_id: string; balance: number }[]).find((b) => b.pocket_id === id)?.balance ?? 0) !== 0) return;
  await supabase.from("fin_pockets").update({ archived: true }).eq("id", id);
  revalidateFin();
}

/** Laporan keuangan harian: "Hari ini tidak ada transaksi". */
export async function markNoTx(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  if (formData.get("undo") === "1") await supabase.from("fin_checks").delete().eq("check_date", todayJakarta());
  else await supabase.from("fin_checks").upsert({ check_date: todayJakarta() }, { onConflict: "user_id,check_date" });
  revalidateFin();
}
