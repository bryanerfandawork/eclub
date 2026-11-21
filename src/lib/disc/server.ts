import "server-only";
import { isDemoMode } from "../supabase/config";
import { createClient } from "../supabase/server";
import { getAccount, getSettings, isAdmin } from "../plans";
import { scoreDisc, type DiscResult } from "./score";

export const DISC_KEY = "disc";

export async function getDiscResult(): Promise<{ result: DiscResult; created_at: string } | null> {
  if (isDemoMode) return { result: scoreDisc({ most: Array(24).fill(1), least: Array(24).fill(2) }), created_at: new Date().toISOString() };
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_results")
    .select("scores, created_at")
    .eq("assessment_key", DISC_KEY)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { result: data.scores as DiscResult, created_at: data.created_at } : null;
}

/** Laporan lengkap terbuka untuk member Plus, pembeli laporan, atau admin. */
export async function hasDiscReport(): Promise<boolean> {
  const account = await getAccount();
  if (account.plan === "plus" || isAdmin(account.role)) return true;
  if (isDemoMode) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("report_unlocks").select("report_key").eq("report_key", DISC_KEY).maybeSingle();
  return !!data;
}

export async function discPrice(): Promise<number> {
  const s = await getSettings();
  return Number(s.disc_report_price) || 29000;
}
