import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { todayJakarta } from "./format";
import { getMe } from "./me";
import { setSummary, type Book, type Tx, type Wallet } from "./finance";
import type { Earmark, Pocket } from "./pockets";

/**
 * pockets = semua kantong yang boleh saya akses (pribadi + buku bersama).
 * txs & balances = keuangan "milik saya": Pribadi + buku usaha yang saya miliki (bukan buku keluarga / buku orang lain).
 */
export type FinanceData = { balances: Record<Wallet, number>; txs: Tx[]; hasAny: boolean; pockets: Pocket[]; books: Book[] };

/** Kantong yang dihitung sebagai keuangan "saya" (Home, Hari ini, dashboard). */
export function ownIds(pockets: Pocket[], books: Book[]) {
  const fam = new Set(books.filter((b) => b.kind === "family").map((b) => b.id));
  return pockets.filter((p) => p.own !== false && !(p.book_id && fam.has(p.book_id))).map((p) => p.id);
}

/** Buku keuangan yang bisa saya akses + undangan untuk saya. Kosong bila SQL 029 belum dijalankan. */
async function getBooksRaw(): Promise<Book[]> {
  if (isDemoMode) return DEMO_BOOKS;
  const [supabase, me] = await Promise.all([createClient(), getMe()]);
  const { data, error } = await supabase.rpc("fin_my_books");
  if (error) return [];
  return ((data ?? []) as Omit<Book, "mine">[]).map((b) => ({ ...b, members: Number(b.members) || 1, mine: b.owner_id === me.user?.id }));
}

const DEMO_BOOKS: Book[] = [
  { id: "bk1", kind: "business", name: "Usaha saya", owner_id: "demo", owner_name: "Anda", role: "owner", status: "active", pocket_ids: null, owner_plus: true, workspace_id: null, members: 2, mine: true },
  { id: "bk2", kind: "family", name: "Keluarga kita", owner_id: "demo", owner_name: "Anda", role: "owner", status: "active", pocket_ids: null, owner_plus: true, workspace_id: null, members: 2, mine: true },
];

/** Catatan satu bulan yang menyentuh kantong tertentu (satu buku, atau Pribadi). */
async function getViewTxsRaw(month: string, key: string): Promise<Tx[]> {
  const ids = key ? key.split(",") : [];
  if (!ids.length) return [];
  const { from, to } = monthRange(month);
  if (isDemoMode) return demoTxs().filter((t) => t.tx_date >= from && t.tx_date < to && (ids.includes(t.pocket_id ?? "") || ids.includes(t.to_pocket_id ?? "")));
  const supabase = await createClient();
  const list = ids.join(",");
  const { data } = await supabase
    .from("fin_transactions")
    .select("*")
    .gte("tx_date", from)
    .lt("tx_date", to)
    .or(`pocket_id.in.(${list}),to_pocket_id.in.(${list})`)
    .order("tx_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(800);
  return ((data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
}
/** key = id kantong dipisah koma (supaya bisa di-cache per permintaan). */
export const getViewTxs = cache(getViewTxsRaw);

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  return { from: `${month}-01`, to: `${next}-01` };
}

function demoTxs(): Tx[] {
  const d = (n: number) => todayJakarta(-n);
  const rows: Omit<Tx, "id">[] = [
    { wallet: "business", kind: "in", to_wallet: null, amount: 2_450_000, category: "penjualan", note: "Penjualan minggu ini", tx_date: d(0) },
    { wallet: "business", kind: "out", to_wallet: null, amount: 850_000, category: "bahan", note: "Belanja bahan", tx_date: d(1) },
    { wallet: "business", kind: "transfer", to_wallet: "personal", amount: 1_500_000, category: "gaji_diri", note: null, tx_date: d(2) },
    { wallet: "personal", kind: "out", to_wallet: null, amount: 45_000, category: "makan", note: "Makan siang", tx_date: d(0) },
    { wallet: "personal", kind: "out", to_wallet: null, amount: 320_000, category: "tagihan", note: "Listrik", tx_date: d(3) },
    { wallet: "business", kind: "out", to_wallet: null, amount: 250_000, category: "marketing", note: "Iklan IG", tx_date: d(4) },
    { wallet: "business", kind: "in", to_wallet: null, amount: 5_000_000, category: "saldo_awal", note: null, tx_date: d(6) },
    { wallet: "personal", kind: "in", to_wallet: null, amount: 1_000_000, category: "saldo_awal", note: null, tx_date: d(6) },
  ];
  const pk = (t: Omit<Tx, "id">) => (t.wallet === "business" ? "pk4" : "pk2");
  return rows.map((r, i) => ({ ...r, id: `demo-${i}`, pocket_id: pk(r), to_pocket_id: r.to_wallet ? (r.to_wallet === "business" ? "pk4" : "pk2") : null }));
}

async function getFinanceRaw(month: string): Promise<FinanceData> {
  const { from, to } = monthRange(month);
  if (isDemoMode) {
    const all = demoTxs();
    const bal = { personal: 0, business: 0 } as Record<Wallet, number>;
    for (const t of all) {
      if (t.kind === "in") bal[t.wallet] += t.amount;
      else if (t.kind === "out") bal[t.wallet] -= t.amount;
      else {
        bal[t.wallet] -= t.amount;
        if (t.to_wallet) bal[t.to_wallet] += t.amount;
      }
    }
    return { balances: bal, txs: all.filter((t) => t.tx_date >= from && t.tx_date < to), hasAny: true, pockets: DEMO_POCKETS(bal), books: DEMO_BOOKS };
  }
  const supabase = await createClient();
  const [pockets, books] = await Promise.all([getPockets(), getBooks()]);
  const mine = new Set(ownIds(pockets, books));
  const own = pockets.filter((p) => mine.has(p.id));
  let txs: Tx[];
  if (own.length) txs = await getViewTxs(month, own.map((p) => p.id).join(","));
  else {
    // Sebelum SQL 022: belum ada kantong, pakai dompet lama.
    const t = await supabase.from("fin_transactions").select("*").gte("tx_date", from).lt("tx_date", to).order("tx_date", { ascending: false }).order("created_at", { ascending: false }).limit(500);
    txs = ((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
  }
  const balances = { personal: 0, business: 0 } as Record<Wallet, number>;
  if (own.length) {
    balances.personal = own.filter((p) => !p.book_id && p.wallet === "personal").reduce((n, p) => n + p.balance, 0);
    balances.business = own.filter((p) => p.wallet === "business").reduce((n, p) => n + p.balance, 0);
  } else {
    const b = await supabase.rpc("fin_balances");
    for (const r of (b.data ?? []) as { wallet: Wallet; balance: number }[]) balances[r.wallet] = Number(r.balance) || 0;
  }
  let hasAny = txs.length > 0 || pockets.some((p) => p.balance !== 0);
  if (!hasAny) {
    const { count } = await supabase.from("fin_transactions").select("id", { count: "exact", head: true });
    hasAny = (count ?? 0) > 0;
  }
  return { balances, txs, hasAny, pockets, books };
}

const DEMO_POCKETS = (bal: Record<Wallet, number>): Pocket[] => [
  { id: "pk1", wallet: "personal", name: "Dompet", type: "cash", provider: null, balance: Math.round(bal.personal * 0.3) },
  { id: "pk2", wallet: "personal", name: "BCA", type: "bank", provider: "bca", balance: bal.personal - Math.round(bal.personal * 0.3), earmarks: [{ dream_id: "demo-2", title: "Umrah bersama orang tua", amount: 1_200_000 }] },
  { id: "pk3", wallet: "business", name: "Kas toko", type: "cash", provider: null, balance: Math.round(bal.business * 0.2), book_id: "bk1" },
  { id: "pk4", wallet: "business", name: "BRI usaha", type: "bank", provider: "bri", balance: bal.business - Math.round(bal.business * 0.2) - 250_000, book_id: "bk1" },
  { id: "pk5", wallet: "business", name: "GoPay", type: "ewallet", provider: "gopay", balance: 250_000, book_id: "bk1" },
  { id: "pk6", wallet: "personal", name: "Kas keluarga", type: "cash", provider: null, balance: 1_750_000, book_id: "bk2" },
];

/**
 * Kantong aktif yang boleh saya akses + saldonya. Pengguna baru otomatis mendapat kantong pribadi
 * dan buku "Usaha saya" (SQL 029). Kosong bila SQL 022 belum dijalankan.
 */
async function getPocketsRaw(): Promise<Pocket[]> {
  if (isDemoMode) return DEMO_POCKETS((await getFinance(todayJakarta().slice(0, 7))).balances).map((p) => ({ ...p, own: true }));
  const supabase = await createClient();
  const cols = "id, wallet, name, type, provider, book_id";
  const load = async () => {
    const r = await supabase.from("fin_pockets").select(cols).eq("archived", false).order("created_at");
    if (!r.error) return { data: r.data as Omit<Pocket, "balance">[], books: true };
    const old = await supabase.from("fin_pockets").select("id, wallet, name, type, provider").eq("archived", false).order("created_at");
    return old.error ? null : { data: old.data as Omit<Pocket, "balance">[], books: false };
  };
  let res = await load();
  if (!res) return [];
  const books = res.books ? await getBooks() : [];
  const personal = res.data.some((p) => !p.book_id && p.wallet === "personal");
  const anyBiz = res.books ? books.some((b) => b.mine) : res.data.some((p) => p.wallet === "business");
  if (!personal || !anyBiz) {
    if (!personal) await supabase.from("fin_pockets").insert({ wallet: "personal", name: "Dompet pribadi", type: "cash" });
    if (!anyBiz) {
      if (res.books) await supabase.rpc("fin_book_create", { p_kind: "business", p_name: "Usaha saya" });
      else await supabase.from("fin_pockets").insert({ wallet: "business", name: "Kas usaha", type: "cash" });
    }
    res = (await load()) ?? res;
  }
  const mineBooks = new Set(books.filter((b) => b.mine).map((b) => b.id));
  const [{ data: bal }, funds] = await Promise.all([supabase.rpc("fin_pocket_balances"), getDreamFunds()]);
  const m = new Map(((bal ?? []) as { pocket_id: string; balance: number }[]).map((r) => [r.pocket_id, Number(r.balance) || 0]));
  return res.data.map((p) => ({ ...p, balance: m.get(p.id) ?? 0, earmarks: funds.get(p.id) ?? [], own: !p.book_id || mineBooks.has(p.book_id) }));
}

/** Tabungan mimpi per kantong (SQL 023). Map kosong bila tabel belum ada. */
async function getDreamFundsRaw(): Promise<Map<string, Earmark[]>> {
  const out = new Map<string, Earmark[]>();
  if (isDemoMode) return out;
  const supabase = await createClient();
  const { data, error } = await supabase.from("fin_dream_funds").select("pocket_id, dream_id, amount, dreams(title)").limit(5000);
  if (error) return out;
  const sum = new Map<string, Earmark & { pocket_id: string }>();
  for (const r of (data ?? []) as unknown as { pocket_id: string; dream_id: string; amount: number; dreams: { title: string } | null }[]) {
    const k = `${r.pocket_id}|${r.dream_id}`;
    const cur = sum.get(k) ?? { pocket_id: r.pocket_id, dream_id: r.dream_id, title: r.dreams?.title ?? "Mimpi", amount: 0 };
    cur.amount += Number(r.amount);
    sum.set(k, cur);
  }
  for (const e of sum.values()) if (e.amount > 0) out.set(e.pocket_id, [...(out.get(e.pocket_id) ?? []), { dream_id: e.dream_id, title: e.title, amount: e.amount }]);
  return out;
}

/** Sudah lapor keuangan hari ini? (ada transaksi hari ini atau menandai "tidak ada transaksi"). */
async function getFinTodayRaw(): Promise<{ reported: boolean; noTx: boolean; in: number; out: number; count: number }> {
  const today = todayJakarta();
  if (isDemoMode) return { reported: true, noTx: false, in: 2_450_000, out: 45_000, count: 2 };
  const [supabase, me] = await Promise.all([createClient(), getMe()]);
  const [t, c] = await Promise.all([
    // Yang saya catat sendiri hari ini (termasuk di buku bersama).
    supabase.from("fin_transactions").select("kind, amount, category").eq("tx_date", today).eq("user_id", me.user?.id ?? ""),
    supabase.from("fin_checks").select("check_date").eq("check_date", today).maybeSingle(),
  ]);
  const rows = (t.data ?? []) as { kind: string; amount: number; category: string }[];
  const sum = (k: string) => rows.filter((r) => r.kind === k && r.category !== "saldo_awal").reduce((n, r) => n + Number(r.amount), 0);
  return { reported: rows.length > 0 || !!c.data, noTx: !!c.data, in: sum("in"), out: sum("out"), count: rows.length };
}

/** Ringkasan bulan untuk satu dompet: pemasukan, pengeluaran (transfer dihitung terpisah). */
export function monthSummary(txs: Tx[], w: Wallet) {
  let income = 0, expense = 0, transferIn = 0, transferOut = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.kind === "in" && t.wallet === w && t.category !== "saldo_awal") income += t.amount;
    else if (t.kind === "out" && t.wallet === w) {
      expense += t.amount;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
    } else if (t.kind === "transfer" && t.wallet !== t.to_wallet) {
      if (t.wallet === w) transferOut += t.amount;
      if (t.to_wallet === w) transferIn += t.amount;
    }
  }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { income, expense, transferIn, transferOut, top };
}

/** Ringkasan 6 bulan terakhir untuk sekumpulan kantong (grafik Plus). */
export async function getMonthly(ids: string[]): Promise<{ month: string; income: number; expense: number }[]> {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(todayJakarta().slice(0, 7) + "-01T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  let txs: Tx[] = [];
  if (isDemoMode) {
    const w = ids.includes("pk4") ? "business" : "personal";
    txs = months.flatMap((m, i) => [
      { id: `a${i}`, wallet: w as Wallet, kind: "in" as const, to_wallet: null, amount: (w === "business" ? 6_000_000 : 4_000_000) + i * 400_000, category: "lain", note: null, tx_date: `${m}-05`, pocket_id: ids[0] },
      { id: `b${i}`, wallet: w as Wallet, kind: "out" as const, to_wallet: null, amount: (w === "business" ? 4_200_000 : 3_100_000) + ((i * 7) % 5) * 150_000, category: "lain", note: null, tx_date: `${m}-10`, pocket_id: ids[0] },
    ]);
  } else if (ids.length) {
    const supabase = await createClient();
    const list = ids.join(",");
    const { data } = await supabase.from("fin_transactions").select("wallet, kind, to_wallet, amount, category, tx_date, pocket_id, to_pocket_id").gte("tx_date", `${months[0]}-01`).or(`pocket_id.in.(${list}),to_pocket_id.in.(${list})`).limit(8000);
    txs = ((data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
  }
  const set = new Set(ids);
  return months.map((m) => {
    const s = setSummary(txs.filter((t) => t.tx_date.startsWith(m)), set);
    return { month: m, income: s.income, expense: s.expense };
  });
}

// Satu kali per permintaan (halaman memanggilnya dari beberapa komponen).
export const getFinance = cache(getFinanceRaw);
export const getPockets = cache(getPocketsRaw);
export const getFinToday = cache(getFinTodayRaw);
export const getDreamFunds = cache(getDreamFundsRaw);
export const getBooks = cache(getBooksRaw);
