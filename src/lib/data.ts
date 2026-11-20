import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { demoActions, demoDaily, demoDreams, demoLifePlan, demoProfile, demoWheel } from "./demo";
import type { DailyAction, Dream, DreamAction, LifePlan, Profile, WheelAssessment } from "./types";
import { todayJakarta } from "./format";

export const getProfile = cache(async (): Promise<Profile & { email: string }> => {
  if (isDemoMode) return { ...demoProfile, email: "demo@eclub.id" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, segment, success_definition")
    .eq("id", user.id)
    .maybeSingle();
  return {
    id: user.id,
    full_name: data?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
    segment: data?.segment ?? null,
    success_definition: data?.success_definition ?? null,
    email: user.email ?? "",
  };
});

export async function getDreams(): Promise<Dream[]> {
  if (isDemoMode) return demoDreams;
  const supabase = await createClient();
  const { data } = await supabase.from("dreams").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(normalizeDream);
}

export async function getDream(id: string): Promise<{ dream: Dream; actions: DreamAction[] } | null> {
  if (isDemoMode) {
    const dream = demoDreams.find((d) => d.id === id);
    return dream ? { dream, actions: demoActions.filter((a) => a.dream_id === id) } : null;
  }
  const supabase = await createClient();
  const { data: dream } = await supabase.from("dreams").select("*").eq("id", id).maybeSingle();
  if (!dream) return null;
  const { data: actions } = await supabase
    .from("dream_actions")
    .select("*")
    .eq("dream_id", id)
    .order("created_at", { ascending: true });
  return { dream: normalizeDream(dream), actions: (actions ?? []) as DreamAction[] };
}

export async function getOpenActions(limit = 5): Promise<(DreamAction & { dream_title: string })[]> {
  if (isDemoMode) {
    return demoActions
      .filter((a) => !a.done)
      .slice(0, limit)
      .map((a) => ({ ...a, dream_title: demoDreams.find((d) => d.id === a.dream_id)?.title ?? "" }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("dream_actions")
    .select("*, dreams(title)")
    .eq("done", false)
    .order("created_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map((a) => ({
    ...(a as DreamAction),
    dream_title: (a as { dreams?: { title?: string } }).dreams?.title ?? "",
  }));
}

// Supabase mengembalikan kolom numeric sebagai string.
function normalizeDream(d: Record<string, unknown>): Dream {
  return {
    ...(d as Dream),
    target_amount: d.target_amount == null ? null : Number(d.target_amount),
    saved_amount: Number(d.saved_amount ?? 0),
  };
}

export async function getWheelHistory(limit = 6): Promise<WheelAssessment[]> {
  if (isDemoMode) return demoWheel.slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("wheel_assessments")
    .select("id, scores, note, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as WheelAssessment[];
}

/** Aksi harian dalam rentang tanggal (inklusif), terbaru dulu. */
export async function getDailyRange(from: string, to: string): Promise<DailyAction[]> {
  if (isDemoMode) return demoDaily.filter((a) => a.action_date >= from && a.action_date <= to);
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_actions")
    .select("id, title, action_date, done, dream_id, created_at")
    .gte("action_date", from)
    .lte("action_date", to)
    .order("action_date", { ascending: false })
    .order("created_at", { ascending: true });
  return (data ?? []) as DailyAction[];
}

export async function getProgressStats() {
  const today = todayJakarta();
  const [daily, dreams] = await Promise.all([getDailyRange(todayJakarta(-29), today), getDreams()]);
  let dreamActionsDone = 0;
  if (isDemoMode) dreamActionsDone = demoActions.filter((a) => a.done).length;
  else {
    const supabase = await createClient();
    const { count } = await supabase.from("dream_actions").select("id", { count: "exact", head: true }).eq("done", true);
    dreamActionsDone = count ?? 0;
  }
  const doneDays = new Set(daily.filter((a) => a.done).map((a) => a.action_date));
  let streak = 0;
  // Hari ini belum selesai tidak memutus rangkaian; mulai hitung dari kemarin bila perlu.
  for (let i = doneDays.has(today) ? 0 : 1; i < 30 && doneDays.has(todayJakarta(-i)); i++) streak++;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = todayJakarta(i - 6);
    const items = daily.filter((a) => a.action_date === date);
    return { date, total: items.length, done: items.filter((a) => a.done).length };
  });
  return {
    streak,
    last7,
    dailyDone30: daily.filter((a) => a.done).length,
    dailyTotal30: daily.length,
    dreamActionsDone,
    dreamsAchieved: dreams.filter((d) => d.status === "achieved").length,
    dreamsActive: dreams.filter((d) => d.status === "active").length,
  };
}

export async function getLifePlan(): Promise<LifePlan | null> {
  if (isDemoMode) return demoLifePlan;
  const supabase = await createClient();
  const { data } = await supabase.from("life_plans").select("core_values, vision, priorities, updated_at").maybeSingle();
  return (data as LifePlan | null) ?? null;
}
