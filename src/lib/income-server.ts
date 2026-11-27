import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { catInfo } from "./finance";
import { todayJakarta } from "./format";
import { EMPTY_PROFILE, cleanProfile, type IncomeProfile } from "./income";

const DEMO: IncomeProfile = {
  ...EMPTY_PROFILE,
  situation: { role: "Karyawan", detail: "Staf admin di toko bangunan" },
  swot: { s: ["Teliti", "Jujur & dipercaya"], w: ["Suka menunda"], o: ["Media sosial & marketplace"], t: ["Utang / cicilan"] },
  interests: ["Kuliner", "Bisnis & jualan"],
  hobbies: ["Memasak"],
  talents: ["Teliti & rapi"],
  passions: ["Keluarga & rasa aman"],
  sources: [{ kind: "active", name: "Gaji kantor", amount: 5_500_000 }],
  expenses: [
    { name: "Makan & minum", amount: 1_800_000 },
    { name: "Transportasi", amount: 500_000 },
    { name: "Tempat tinggal (sewa/cicilan)", amount: 1_200_000 },
    { name: "Pulsa & internet", amount: 200_000 },
    { name: "Sedekah / zakat", amount: 250_000 },
  ],
  plans: [{ name: "Jualan frozen food", target: 1_500_000 }],
};

async function getIncomeProfileRaw(): Promise<IncomeProfile | null> {
  if (isDemoMode) return DEMO;
  const supabase = await createClient();
  const { data } = await supabase.from("income_profiles").select("*").maybeSingle();
  if (!data) return null;
  return { ...EMPTY_PROFILE, ...cleanProfile(data), updated_at: data.updated_at as string };
}

/** Petunjuk dari catatan Keuangan 30 hari terakhir (dompet pribadi): pengeluaran per kategori dan total pemasukan. */
export async function getFinanceHint(): Promise<{ out: { label: string; amount: number }[]; income: number } | null> {
  if (isDemoMode) return null;
  const supabase = await createClient();
  const base = () => supabase.from("fin_transactions").select("wallet, kind, category, amount").eq("wallet", "personal").in("kind", ["in", "out"]).gte("tx_date", todayJakarta(-30));
  // Hanya dompet Pribadi sendiri (bukan buku keluarga bersama, SQL 029).
  const first = await base().is("book_id", null);
  const data = first.error ? (await base()).data : first.data;
  const rows = (data ?? []) as { wallet: "personal"; kind: "in" | "out"; category: string; amount: number }[];
  if (rows.length < 3) return null;
  const by = new Map<string, number>();
  let income = 0;
  for (const r of rows) {
    if (r.kind === "in") {
      if (!["saldo_awal", "modal"].includes(r.category)) income += Number(r.amount);
    } else {
      const c = catInfo({ wallet: r.wallet, kind: r.kind, category: r.category });
      by.set(`${c.emoji} ${c.label}`, (by.get(`${c.emoji} ${c.label}`) ?? 0) + Number(r.amount));
    }
  }
  return { out: [...by.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount).slice(0, 6), income };
}

// Satu kali per permintaan (halaman memanggilnya dari beberapa komponen).
export const getIncomeProfile = cache(getIncomeProfileRaw);
