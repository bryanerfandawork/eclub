import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";

export type PlanFeature = {
  key: string;
  label: string;
  description: string | null;
  free_limit: number | null;
  plus_limit: number | null;
  unit: string | null;
  enforced: boolean;
  sort: number;
};

export type Role = "member" | "mentor" | "admin" | "super_admin";
export type PlanKey = "free" | "plus";

/** Nilai bawaan bila tabel paket belum dibuat (dipakai juga di mode demo). */
export const DEFAULT_FEATURES: PlanFeature[] = [
  { key: "dreams", label: "Dream Planner", description: "Jumlah mimpi yang bisa direncanakan", free_limit: 1, plus_limit: null, unit: "mimpi", enforced: true, sort: 10 },
  { key: "daily_action", label: "Daily Action", description: "Aksi harian & rangkaian konsisten", free_limit: null, plus_limit: null, unit: null, enforced: true, sort: 20 },
  { key: "my_life", label: "My Life", description: "Definisi sukses, nilai, visi, dan dokumen hidup", free_limit: null, plus_limit: null, unit: null, enforced: true, sort: 30 },
  { key: "wheel_history", label: "Wheel of Life", description: "Riwayat penilaian yang bisa dibandingkan", free_limit: 2, plus_limit: 24, unit: "riwayat", enforced: true, sort: 40 },
  { key: "assessment_attempts", label: "8 Wheel Entrepreneur", description: "Jumlah tes dalam 3 bulan", free_limit: 1, plus_limit: null, unit: "kali / 3 bulan", enforced: true, sort: 50 },
  { key: "ai_messages", label: "AI Companion", description: "Kuota pesan AI per hari", free_limit: 5, plus_limit: 50, unit: "pesan/hari", enforced: true, sort: 60 },
  { key: "premium_articles", label: "Artikel premium", description: "Akses artikel premium", free_limit: 0, plus_limit: null, unit: null, enforced: false, sort: 70 },
  { key: "paid_courses", label: "Course berbayar", description: "Akses course khusus member", free_limit: 0, plus_limit: null, unit: null, enforced: false, sort: 80 },
];

export const getFeatures = cache(async (): Promise<PlanFeature[]> => {
  if (isDemoMode) return DEFAULT_FEATURES;
  const supabase = await createClient();
  const { data, error } = await supabase.from("plan_features").select("*").order("sort");
  return error || !data?.length ? DEFAULT_FEATURES : (data as PlanFeature[]);
});

export const getSettings = cache(async (): Promise<Record<string, unknown>> => {
  const defaults = { plus_price_monthly: 49000, plus_price_yearly: 499000, upgrade_contact: "", bank_accounts: "" };
  if (isDemoMode) return defaults;
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  return { ...defaults, ...Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) };
});

/** Paket & peran pengguna yang sedang login. */
export const getAccount = cache(async (): Promise<{ role: Role; plan: PlanKey; expiresAt: string | null }> => {
  if (isDemoMode) return { role: "super_admin", plan: "free", expiresAt: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { role: "member", plan: "free", expiresAt: null };
  const { data } = await supabase.from("profiles").select("role, plan, plan_expires_at").eq("id", user.id).maybeSingle();
  const expired = data?.plan_expires_at ? new Date(data.plan_expires_at) < new Date() : false;
  return {
    role: (data?.role as Role) ?? "member",
    plan: data?.plan === "plus" && !expired ? "plus" : "free",
    expiresAt: data?.plan_expires_at ?? null,
  };
});

/** Batas fitur untuk pengguna ini. null = tanpa batas. */
export async function getLimit(key: string): Promise<number | null> {
  const [features, account] = await Promise.all([getFeatures(), getAccount()]);
  const f = features.find((x) => x.key === key);
  if (!f || !f.enforced) return null;
  return account.plan === "plus" ? f.plus_limit : f.free_limit;
}

export function isAdmin(role: Role) {
  return role === "admin" || role === "super_admin";
}

export const UPGRADE_HINT = "Upgrade ke EClub Plus untuk membuka batas ini.";
