"use server";

import { revalidatePath } from "next/cache";
import { CATEGORIES, MOVE, TRANSFERS, type TxKind, type Wallet } from "@/lib/finance";
import { todayJakarta } from "@/lib/format";
import { getAccount, getLimit, isAdmin } from "@/lib/plans";
import { PROVIDERS, type PocketType } from "@/lib/pockets";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getBooks, getPockets } from "@/lib/finance-server";
import { getMe } from "@/lib/me";
import type { FormState } from "./auth";

type PK = { id: string; wallet: Wallet; book_id?: string | null };
const SOURCES = ["manual", "scan", "chat"];

export async function saveTx(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: transaksi belum bisa disimpan." };
  const kind = String(formData.get("kind")) as TxKind;
  const amount = Number(String(formData.get("amount") ?? "").replace(/[^\d]/g, ""));
  if (!amount || amount <= 0) return { error: "Isi nominalnya dulu." };
  const category = String(formData.get("category") ?? "");
  const date = String(formData.get("tx_date") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200) || null;
  const supabase = await createClient();
  if (kind === "transfer" && category === "tabung") return saveDreamFund(supabase, formData, amount);
  // Kantong (SQL 022). Sebelum SQL dijalankan, daftar kantong kosong dan transaksi disimpan seperti dulu.
  // Setelah SQL 029 daftar ini juga berisi kantong buku bersama yang boleh saya pakai.
  const [all, books] = await Promise.all([getPockets(), getBooks()]);
  const pockets: PK[] = all;
  const isOwn = (p: PK) => !p.book_id || books.some((b) => b.id === p.book_id && b.mine);
  const manages = (p: PK) => !p.book_id || books.some((b) => b.id === p.book_id && (b.role === "owner" || b.role === "manager"));
  const pick = (id: string, w: Wallet, filter: (p: PK) => boolean = () => true) =>
    pockets.find((p) => p.id === id && p.wallet === w && filter(p)) ?? pockets.find((p) => p.wallet === w && !p.book_id && filter(p)) ?? pockets.find((p) => p.wallet === w && filter(p));
  let row: Record<string, unknown>;
  if (kind === "transfer") {
    if (category === MOVE.key) {
      const from = pockets.find((p) => p.id === String(formData.get("pocket_id")));
      const to = pockets.find((p) => p.id === String(formData.get("to_pocket_id")));
      if (!from || !to || from.id === to.id) return { error: "Pilih kantong asal dan tujuan yang berbeda." };
      const acc = await getAccount();
      // Pindah di dalam buku bersama mengikuti paket pemilik buku. Selain itu khusus Plus.
      const sharedPlus = !!from.book_id && from.book_id === to.book_id && books.some((b) => b.id === from.book_id && b.owner_plus);
      if (acc.plan !== "plus" && !isAdmin(acc.role) && !sharedPlus) return { error: "Pindah antar kantong khusus member Plus." };
      if (from.book_id !== to.book_id && !(manages(from) && manages(to))) return { error: "Hanya pemilik/pengelola yang bisa memindahkan uang antar buku." };
      row = { kind, wallet: from.wallet, to_wallet: to.wallet, pocket_id: from.id, to_pocket_id: to.id, category, amount, note };
    } else {
      const tr = TRANSFERS.find((t) => t.key === category);
      if (!tr) return { error: "Pilih jenis pindah dana." };
      row = { kind, wallet: tr.from, to_wallet: tr.to, category, amount, note };
      // Gaji diri / tambah modal: antara Pribadi saya dan buku usaha yang saya kelola.
      const from = pick(String(formData.get("pocket_id") ?? ""), tr.from, tr.from === "personal" ? isOwn : manages);
      const to = pick(String(formData.get("to_pocket_id") ?? ""), tr.to, tr.to === "personal" ? isOwn : manages);
      if (from && to) Object.assign(row, { pocket_id: from.id, to_pocket_id: to.id });
    }
  } else if (kind === "in" || kind === "out") {
    let wallet = String(formData.get("wallet")) as Wallet;
    const chosen = pockets.find((p) => p.id === String(formData.get("pocket_id") ?? ""));
    if (chosen) wallet = chosen.wallet;
    if (!(wallet in CATEGORIES)) return { error: "Pilih dompet." };
    if (!CATEGORIES[wallet][kind].some((c) => c.key === category)) return { error: "Pilih kategori." };
    row = { kind, wallet, category, amount, note };
    const p = chosen ?? pick("", wallet, isOwn);
    if (p) row.pocket_id = p.id;
  } else return { error: "Jenis transaksi tidak valid." };
  const source = String(formData.get("source") ?? "manual");
  if (SOURCES.includes(source) && source !== "manual" && pockets.some((p) => p.book_id !== undefined)) row.source = source;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) row.tx_date = date;
  // Uang yang keluar dari kantong melebihi saldo bebasnya = memakai uang yang disisihkan untuk mimpi.
  const fromPocket = row.pocket_id ? String(row.pocket_id) : null;
  let overlap = 0;
  let marks: Mark[] = [];
  if (fromPocket && (kind === "out" || kind === "transfer")) {
    marks = await pocketMarks(supabase, fromPocket);
    if (marks.length) {
      const { data: bal } = await supabase.rpc("fin_pocket_balances");
      const balance = Number(((bal ?? []) as { pocket_id: string; balance: number }[]).find((b) => b.pocket_id === fromPocket)?.balance ?? 0);
      const free = balance - marks.reduce((n, m) => n + m.amount, 0);
      overlap = Math.min(amount, Math.max(0, amount - Math.max(0, free)), marks.reduce((n, m) => n + m.amount, 0));
    }
  }
  const mode = String(formData.get("dream_mode") ?? "");
  const pickDream = String(formData.get("dream_pick") ?? "");
  if (overlap > 0 && kind === "out" && !(["for", "other"].includes(mode) && marks.some((m) => m.dream_id === pickDream)))
    return { error: "Uang ini sebagian disisihkan untuk mimpi. Pilih dulu: untuk mimpi tersebut, atau keperluan lain (dan mimpi mana yang dikorbankan)." };
  const { data: tx, error } = await supabase.from("fin_transactions").insert(row).select("id").single();
  if (error) return { error: /kantong|buku/i.test(error.message) ? error.message : "Gagal menyimpan. Pastikan SQL tahap 12 sudah dijalankan." };
  if (overlap > 0 && fromPocket) {
    if (kind === "out") await consumeMarks(supabase, fromPocket, marks, overlap, pickDream, mode === "for", tx?.id ?? null);
    else if (row.to_pocket_id) {
      // Pindah dana: tanda mimpi ikut pindah ke kantong tujuan.
      let left = overlap;
      for (const m of marks) {
        const take = Math.min(m.amount, left);
        if (take <= 0) break;
        await supabase.from("fin_dream_funds").insert([
          { dream_id: m.dream_id, pocket_id: fromPocket, amount: -take, kind: "release", tx_id: tx?.id ?? null },
          { dream_id: m.dream_id, pocket_id: String(row.to_pocket_id), amount: take, kind: "release", tx_id: tx?.id ?? null },
        ]);
        left -= take;
      }
    }
  }
  revalidateFin();
  if (overlap > 0 && kind === "out" && mode === "other") revalidatePath("/goals");
  return { message: "Tersimpan ✓" };
}

type Mark = { dream_id: string; amount: number };
type Sb = Awaited<ReturnType<typeof createClient>>;

async function pocketMarks(supabase: Sb, pocketId: string): Promise<Mark[]> {
  const { data, error } = await supabase.from("fin_dream_funds").select("dream_id, amount").eq("pocket_id", pocketId);
  if (error) return [];
  const m = new Map<string, number>();
  for (const r of data ?? []) m.set(r.dream_id as string, (m.get(r.dream_id as string) ?? 0) + Number(r.amount));
  return [...m.entries()].filter(([, a]) => a > 0).map(([dream_id, amount]) => ({ dream_id, amount }));
}

/** Kurangi tanda mimpi. Bukan untuk mimpi itu = dikorbankan: tabungan mimpinya berkurang (sisa target bertambah). */
async function consumeMarks(supabase: Sb, pocketId: string, marks: Mark[], overlap: number, first: string, forDream: boolean, txId: string | null) {
  const order = [...marks].sort((a, b) => (a.dream_id === first ? -1 : b.dream_id === first ? 1 : 0));
  let left = overlap;
  for (const m of order) {
    const take = Math.min(m.amount, left);
    if (take <= 0) break;
    const sacrifice = !(forDream && m.dream_id === first);
    await supabase.from("fin_dream_funds").insert({ dream_id: m.dream_id, pocket_id: pocketId, amount: -take, kind: sacrifice ? "sacrifice" : "use", tx_id: txId });
    if (sacrifice) {
      const { data: d } = await supabase.from("dreams").select("saved_amount").eq("id", m.dream_id).maybeSingle();
      if (d) await supabase.from("dreams").update({ saved_amount: Math.max(0, Number(d.saved_amount) - take) }).eq("id", m.dream_id);
    }
    left -= take;
  }
}

/** Tabung untuk mimpi: tandai uang di kantong untuk mimpi tertentu (tabungan mimpi ikut bertambah). */
async function saveDreamFund(supabase: Sb, formData: FormData, amount: number): Promise<FormState> {
  const dreamId = String(formData.get("dream_id") ?? "");
  const toId = String(formData.get("to_pocket_id") ?? "");
  const fromId = String(formData.get("pocket_id") ?? "") || toId;
  // Tabungan mimpi hanya di kantong milik sendiri (pribadi atau buku yang saya miliki).
  const pk = (await getPockets()).filter((p) => p.own !== false);
  if (!pk.length) return { error: "Fitur ini aktif setelah SQL 022 dan 023 dijalankan." };
  const to = pk.find((p) => p.id === toId);
  const from = pk.find((p) => p.id === fromId);
  if (!to || !from) return { error: "Pilih kantong tempat tabungan disimpan." };
  const { data: dream } = await supabase.from("dreams").select("id, saved_amount").eq("id", dreamId).maybeSingle();
  if (!dream) return { error: "Pilih mimpi yang ingin ditabung." };
  // Tidak boleh menyisihkan lebih dari saldo bebas kantong asal.
  const { data: bal } = await supabase.rpc("fin_pocket_balances");
  const balance = Number(((bal ?? []) as { pocket_id: string; balance: number }[]).find((b) => b.pocket_id === from.id)?.balance ?? 0);
  const marks = await pocketMarks(supabase, from.id);
  const free = balance - marks.reduce((n, m) => n + m.amount, 0);
  if (amount > free) return { error: `Saldo bebas di kantong ini hanya Rp${Math.max(0, free).toLocaleString("id-ID")}. Catat pemasukan dulu, atau kurangi nominalnya.` };
  let txId: string | null = null;
  if (from.id !== to.id) {
    const acc = await getAccount();
    if (acc.plan !== "plus" && !isAdmin(acc.role)) return { error: "Memindahkan ke kantong lain khusus member Plus. Pilih kantong yang sama untuk menyisihkan uangnya." };
    const { data: tx, error } = await supabase
      .from("fin_transactions")
      .insert({ kind: "transfer", wallet: from.wallet, to_wallet: to.wallet, pocket_id: from.id, to_pocket_id: to.id, category: MOVE.key, amount, note: "Tabung untuk mimpi" })
      .select("id")
      .single();
    if (error) return { error: "Gagal memindahkan uang. Coba lagi." };
    txId = tx?.id ?? null;
  }
  const { error } = await supabase.from("fin_dream_funds").insert({ dream_id: dream.id, pocket_id: to.id, amount, kind: "save", tx_id: txId });
  if (error) return { error: "Gagal menyimpan. Pastikan SQL 023 sudah dijalankan." };
  await supabase.from("dreams").update({ saved_amount: Number(dream.saved_amount) + amount }).eq("id", dream.id);
  revalidateFin();
  revalidatePath("/goals");
  revalidatePath(`/goals/${dream.id}`);
  return { message: "Tersimpan ✓" };
}

export async function deleteTx(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("fin_transactions").delete().eq("id", String(formData.get("id")));
  revalidateFin();
}

function revalidateFin() {
  for (const p of ["/keuangan", "/keuangan/kantong", "/keuangan/buku", "/dashboard", "/today"]) revalidatePath(p);
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
  const bookId = String(formData.get("book_id") ?? "");
  if (!f.name) return { error: "Beri nama kantong, misal: Dompet, BCA, GoPay." };
  const supabase = await createClient();
  if (bookId) {
    const book = (await getBooks()).find((b) => b.id === bookId && b.status === "active");
    if (!book || (book.role !== "owner" && book.role !== "manager")) return { error: "Hanya pemilik/pengelola yang bisa menambah kantong di buku ini." };
    if (!book.mine && !book.owner_plus) return { error: "Paket Plus pemilik buku sudah berakhir, jadi kantong baru belum bisa ditambah." };
    if (book.mine && (await overLimit(supabase))) return { error: LIMIT_MSG(await getLimit("fin_pockets")) };
    const { error } = await supabase.from("fin_pockets").insert({ ...f, wallet: book.kind === "business" ? "business" : "personal", book_id: book.id });
    if (error) return { error: "Gagal menyimpan. Pastikan SQL 029 sudah dijalankan." };
  } else {
    const wallet = String(formData.get("wallet") ?? "personal") as Wallet;
    if (wallet !== "personal" && wallet !== "business") return { error: "Pilih pribadi atau usaha." };
    if (await overLimit(supabase)) return { error: LIMIT_MSG(await getLimit("fin_pockets")) };
    const { error } = await supabase.from("fin_pockets").insert({ ...f, wallet });
    if (error) return { error: "Gagal menyimpan. Pastikan SQL 022 sudah dijalankan." };
  }
  revalidateFin();
  return { message: "Kantong ditambahkan ✓" };
}

const LIMIT_MSG = (limit: number | null) =>
  `Paket gratis punya ${limit} kantong (1 pribadi + 1 usaha). Anda bisa mengganti nama/jenis kantong yang ada, atau upgrade ke Plus untuk kantong tanpa batas.`;

/** Batas kantong dihitung dari kantong atas nama saya (pribadi + buku milik saya). */
async function overLimit(supabase: Sb) {
  const limit = await getLimit("fin_pockets");
  if (limit === null) return false;
  const me = await getMe();
  const { count } = await supabase.from("fin_pockets").select("id", { count: "exact", head: true }).eq("archived", false).eq("user_id", me.user?.id ?? "");
  return (count ?? 0) >= limit;
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
  const p = (await getPockets()).find((x) => x.id === id);
  if (!p) return;
  const same = (await getPockets()).filter((x) => (x.book_id ?? null) === (p.book_id ?? null) && x.wallet === p.wallet && (p.book_id || x.own !== false));
  const count = same.length;
  if (count <= 1) return;
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
