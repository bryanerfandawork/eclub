import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { todayJakarta } from "./format";
import type { Tx, Wallet } from "./finance";
import type { Pocket } from "./pockets";

export type FinanceData = { balances: Record<Wallet, number>; txs: Tx[]; hasAny: boolean; pockets: Pocket[] };

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
  return rows.map((r, i) => ({ ...r, id: `demo-${i}` }));
}

export async function getFinance(month: string): Promise<FinanceData> {
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
    return { balances: bal, txs: all.filter((t) => t.tx_date >= from && t.tx_date < to), hasAny: true, pockets: DEMO_POCKETS(bal) };
  }
  const supabase = await createClient();
  const [b, pockets, t] = await Promise.all([
    supabase.rpc("fin_balances"),
    getPockets(),
    supabase.from("fin_transactions").select("*").gte("tx_date", from).lt("tx_date", to).order("tx_date", { ascending: false }).order("created_at", { ascending: false }).limit(500),
  ]);
  const balances = { personal: 0, business: 0 } as Record<Wallet, number>;
  for (const r of (b.data ?? []) as { wallet: Wallet; balance: number }[]) balances[r.wallet] = Number(r.balance) || 0;
  // Setelah SQL 022: saldo dompet = jumlah saldo kantongnya (benar juga untuk pindah antar kantong).
  if (pockets.length) for (const w of ["personal", "business"] as Wallet[]) balances[w] = pockets.filter((p) => p.wallet === w).reduce((n, p) => n + p.balance, 0);
  const txs = ((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
  let hasAny = txs.length > 0 || balances.personal !== 0 || balances.business !== 0;
  if (!hasAny) {
    const { count } = await supabase.from("fin_transactions").select("id", { count: "exact", head: true });
    hasAny = (count ?? 0) > 0;
  }
  return { balances, txs, hasAny, pockets };
}

const DEMO_POCKETS = (bal: Record<Wallet, number>): Pocket[] => [
  { id: "pk1", wallet: "personal", name: "Dompet", type: "cash", provider: null, balance: Math.round(bal.personal * 0.3) },
  { id: "pk2", wallet: "personal", name: "BCA", type: "bank", provider: "bca", balance: bal.personal - Math.round(bal.personal * 0.3) },
  { id: "pk3", wallet: "business", name: "Kas toko", type: "cash", provider: null, balance: Math.round(bal.business * 0.2) },
  { id: "pk4", wallet: "business", name: "BRI usaha", type: "bank", provider: "bri", balance: bal.business - Math.round(bal.business * 0.2) - 250_000 },
  { id: "pk5", wallet: "business", name: "GoPay", type: "ewallet", provider: "gopay", balance: 250_000 },
];

/** Kantong aktif + saldonya. Pengguna baru otomatis mendapat 2 kantong bawaan. Kosong bila SQL 022 belum dijalankan. */
export async function getPockets(): Promise<Pocket[]> {
  if (isDemoMode) return DEMO_POCKETS((await getFinance(todayJakarta().slice(0, 7))).balances);
  const supabase = await createClient();
  const first = await supabase.from("fin_pockets").select("id, wallet, name, type, provider").eq("archived", false).order("created_at");
  if (first.error) return [];
  let data = first.data as Omit<Pocket, "balance">[] | null;
  if (!data?.length) {
    await supabase.from("fin_pockets").insert([
      { wallet: "personal", name: "Dompet pribadi", type: "cash" },
      { wallet: "business", name: "Kas usaha", type: "cash" },
    ]);
    ({ data } = await supabase.from("fin_pockets").select("id, wallet, name, type, provider").eq("archived", false).order("created_at"));
  }
  const { data: bal } = await supabase.rpc("fin_pocket_balances");
  const m = new Map(((bal ?? []) as { pocket_id: string; balance: number }[]).map((r) => [r.pocket_id, Number(r.balance) || 0]));
  return ((data ?? []) as Omit<Pocket, "balance">[]).map((p) => ({ ...p, balance: m.get(p.id) ?? 0 }));
}

/** Sudah lapor keuangan hari ini? (ada transaksi hari ini atau menandai "tidak ada transaksi"). */
export async function getFinToday(): Promise<{ reported: boolean; noTx: boolean; in: number; out: number; count: number }> {
  const today = todayJakarta();
  if (isDemoMode) return { reported: true, noTx: false, in: 2_450_000, out: 45_000, count: 2 };
  const supabase = await createClient();
  const [t, c] = await Promise.all([
    supabase.from("fin_transactions").select("kind, amount, category").eq("tx_date", today),
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

/** Ringkasan 6 bulan terakhir per dompet (grafik Plus). */
export async function getMonthly(w: Wallet): Promise<{ month: string; income: number; expense: number }[]> {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(todayJakarta().slice(0, 7) + "-01T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  let txs: Tx[] = [];
  if (isDemoMode) {
    txs = months.flatMap((m, i) => [
      { id: `a${i}`, wallet: w, kind: "in" as const, to_wallet: null, amount: (w === "business" ? 6_000_000 : 4_000_000) + i * 400_000, category: w === "business" ? "penjualan" : "gaji", note: null, tx_date: `${m}-05` },
      { id: `b${i}`, wallet: w, kind: "out" as const, to_wallet: null, amount: (w === "business" ? 4_200_000 : 3_100_000) + ((i * 7) % 5) * 150_000, category: "lain", note: null, tx_date: `${m}-10` },
    ]);
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("fin_transactions").select("wallet, kind, to_wallet, amount, category, tx_date").gte("tx_date", `${months[0]}-01`).limit(5000);
    txs = ((data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
  }
  return months.map((m) => {
    const s = monthSummary(txs.filter((t) => t.tx_date.startsWith(m)), w);
    return { month: m, income: s.income, expense: s.expense };
  });
}
