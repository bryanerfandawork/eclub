import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";

export type Affiliate = {
  code: string;
  referrals: number;
  buyers: number;
  pending: number;
  available: number;
  requested: number;
  paid: number;
  commissions: { created_at: string; product: string; amount: number; status: string; available_at: string; buyer: string }[];
  payouts: { id: string; amount: number; status: "requested" | "paid" | "rejected"; note: string | null; created_at: string }[];
};

export const PRODUCT_LABEL: Record<string, string> = {
  plus_monthly: "EClub Plus 1 bulan",
  plus_yearly: "EClub Plus 1 tahun",
  course: "Course",
  disc_report: "Laporan DISC",
};

export async function getAffiliate(): Promise<Affiliate | null> {
  if (isDemoMode) {
    const d = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
    return {
      code: "SAHABAT123",
      referrals: 7,
      buyers: 3,
      pending: 99_800,
      available: 129_600,
      requested: 0,
      paid: 100_000,
      commissions: [
        { created_at: d(2), product: "plus_yearly", amount: 99_800, status: "active", available_at: d(-5), buyer: "R•••" },
        { created_at: d(12), product: "plus_monthly", amount: 9_800, status: "active", available_at: d(5), buyer: "A•••" },
        { created_at: d(20), product: "course", amount: 39_800, status: "active", available_at: d(13), buyer: "D•••" },
      ],
      payouts: [{ id: "p1", amount: 100_000, status: "paid", note: null, created_at: d(15) }],
    };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_affiliate");
  if (error || !data) return null;
  return data as Affiliate;
}
