import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { todayJakarta } from "./format";
import type { Tx, Wallet } from "./finance";

export type FinanceData = { balances: Record<Wallet, number>; txs: Tx[]; hasAny: boolean };

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
    return { balances: bal, txs: all.filter((t) => t.tx_date >= from && t.tx_date < to), hasAny: true };
  }
  const supabase = await createClient();
  const [b, t] = await Promise.all([
    supabase.rpc("fin_balances"),
    supabase.from("fin_transactions").select("id, wallet, kind, to_wallet, amount, category, note, tx_date").gte("tx_date", from).lt("tx_date", to).order("tx_date", { ascending: false }).order("created_at", { ascending: false }).limit(500),
  ]);
  const balances = { personal: 0, business: 0 } as Record<Wallet, number>;
  for (const r of (b.data ?? []) as { wallet: Wallet; balance: number }[]) balances[r.wallet] = Number(r.balance) || 0;
  const txs = ((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) }));
  let hasAny = txs.length > 0 || balances.personal !== 0 || balances.business !== 0;
  if (!hasAny) {
    const { count } = await supabase.from("fin_transactions").select("id", { count: "exact", head: true });
    hasAny = (count ?? 0) > 0;
  }
  return { balances, txs, hasAny };
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
    } else if (t.kind === "transfer") {
      if (t.wallet === w) transferOut += t.amount;
      if (t.to_wallet === w) transferIn += t.amount;
    }
  }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { income, expense, transferIn, transferOut, top };
}
