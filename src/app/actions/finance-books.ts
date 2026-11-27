"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToSubs } from "@/lib/push";
import type { FormState } from "./auth";

const DEMO = { error: "Mode demo: belum bisa disimpan." };
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const clean = (m: string) => m.replace(/^.*?ERROR:\s*/i, "");

function refresh() {
  for (const p of ["/keuangan", "/keuangan/buku", "/keuangan/kantong", "/dashboard", "/today"]) revalidatePath(p);
}

/** Buat buku usaha / keluarga. */
export async function createBook(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const name = str(f, "name").slice(0, 40);
  const kind = str(f, "kind") === "family" ? "family" : "business";
  if (!name) return { error: kind === "family" ? "Beri nama, misal: Keluarga Santoso." : "Tulis nama usahanya, misal: Toko Kue Bunda." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("fin_book_create", { p_kind: kind, p_name: name });
  if (error) return { error: error.message.includes("function") ? "Fitur ini aktif setelah SQL 029 dijalankan." : clean(error.message) };
  refresh();
  return { message: kind === "family" ? "Buku keluarga dibuat ✓ Sekarang ajak pasangan Anda." : "Usaha ditambahkan ✓" };
}

/** Ganti nama buku / hubungkan ke Ruang Kerja (pemilik). */
export async function updateBook(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const id = str(f, "id");
  const name = str(f, "name").slice(0, 40);
  if (!name) return { error: "Nama wajib diisi." };
  const ws = str(f, "workspace_id") || null;
  const supabase = await createClient();
  if (ws) {
    // Hanya ruang kerja yang saya miliki.
    const { data } = await supabase.from("workspaces").select("id").eq("id", ws).maybeSingle();
    if (!data) return { error: "Ruang kerja tidak ditemukan." };
  }
  const { error } = await supabase.from("fin_books").update({ name, workspace_id: ws }).eq("id", id);
  if (error) return { error: "Gagal menyimpan. Hanya pemilik yang bisa mengubah." };
  refresh();
  if (ws) revalidatePath(`/tim/${ws}`);
  return { message: "Tersimpan ✓" };
}

/** Arsipkan buku (pemilik). Catatannya tetap tersimpan. */
export async function archiveBook(f: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("fin_books").update({ archived: true }).eq("id", str(f, "id"));
  refresh();
}

function pocketList(f: FormData) {
  if (str(f, "scope") !== "some") return null;
  const ids = f.getAll("pockets").map(String).filter(Boolean);
  return ids.length ? ids : null;
}

/** Undang lewat username. Peran: manager (pengelola) atau recorder (pencatat, bisa dibatasi kantong). */
export async function inviteToBook(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const book = str(f, "book_id");
  const username = str(f, "username").replace(/^@/, "");
  const role = str(f, "role") === "manager" ? "manager" : "recorder";
  if (!username) return { error: "Tulis username EClub orang yang diajak." };
  const pockets = role === "recorder" ? pocketList(f) : null;
  if (role === "recorder" && str(f, "scope") === "some" && !pockets) return { error: "Pilih minimal 1 kantong yang boleh dipakai." };
  const supabase = await createClient();
  const { data: target, error } = await supabase.rpc("fin_book_invite", { p_book: book, p_username: username, p_role: role, p_pockets: pockets });
  if (error) return { error: clean(error.message) };
  // Notifikasi HP untuk yang diundang.
  after(async () => {
    const admin = createAdminClient();
    if (!admin || !target) return;
    const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", String(target));
    if (subs?.length) await sendPushToSubs(admin, subs, { title: "Ajakan kelola keuangan bersama", body: "Buka EClub untuk menerima ajakan ini.", url: "/keuangan/buku", tag: `buku-${book}` }).catch(() => 0);
  });
  refresh();
  return { message: `Undangan terkirim ke @${username} ✓ Tinggal menunggu diterima.` };
}

export async function respondBook(f: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.rpc("fin_book_respond", { p_book: str(f, "book_id"), p_accept: str(f, "accept") === "1" });
  refresh();
}

export async function setBookMember(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const role = str(f, "role") === "manager" ? "manager" : "recorder";
  const pockets = role === "recorder" ? pocketList(f) : null;
  if (role === "recorder" && str(f, "scope") === "some" && !pockets) return { error: "Pilih minimal 1 kantong." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("fin_book_set_member", { p_book: str(f, "book_id"), p_user: str(f, "user_id"), p_role: role, p_pockets: pockets });
  if (error) return { error: clean(error.message) };
  refresh();
  return { message: "Akses diperbarui ✓" };
}

export async function removeBookMember(f: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.rpc("fin_book_remove", { p_book: str(f, "book_id"), p_user: str(f, "user_id") });
  refresh();
}
