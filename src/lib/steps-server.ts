import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { getAssessmentResults, getDreams, getProfile, getProgressStats } from "./data";
import { getDiscResult } from "./disc/server";
import { getIncomeProfile } from "./income-server";
import { PLACEMENT_KEY } from "./placement";
import { todayJakarta } from "./format";
import { STEPS, type Step, type StepItem } from "./steps";

export type JourneyItem = StepItem & { done: boolean };
export type JourneyStep = Omit<Step, "items"> & { items: JourneyItem[]; done: number; total: number; complete: boolean };
export type Journey = { steps: JourneyStep[]; next: (JourneyItem & { step: number }) | null; current: number; pct: number };

export async function getJourney(): Promise<Journey> {
  const [profile, dreams, stats, disc, ew, placed, income] = await Promise.all([
    getProfile(),
    getDreams(),
    getProgressStats(),
    getDiscResult(),
    getAssessmentResults("8-wheel-entrepreneur", 1),
    getAssessmentResults(PLACEMENT_KEY, 1),
    getIncomeProfile().catch(() => null),
  ]);
  let finance = false;
  let habit = false;
  let syukur = false;
  if (isDemoMode) {
    finance = true;
    habit = true;
  } else {
    const supabase = await createClient();
    const [f, h, g] = await Promise.all([
      supabase.from("fin_transactions").select("id", { count: "exact", head: true }).gte("tx_date", todayJakarta(-30)),
      supabase.from("habits").select("id", { count: "exact", head: true }).eq("archived", false),
      supabase.from("gratitude_entries").select("id", { count: "exact", head: true }).gte("entry_date", todayJakarta(-6)),
    ]);
    finance = (f.count ?? 0) > 0;
    habit = (h.count ?? 0) > 0;
    syukur = (g.count ?? 0) > 0;
  }
  const chips = income ? income.interests.length + income.hobbies.length + income.talents.length + income.passions.length : 0;
  const sw = income?.swot;
  const as = income?.assets;
  const done: Record<string, boolean> = {
    dream: dreams.length > 0,
    dream_num: dreams.some((d) => d.target_amount && d.target_date),
    life: !!profile.success_definition,
    placement: !!(placed[0]?.scores as unknown as { placement?: string } | undefined)?.placement,
    income: !!income && income.sources.length > 0 && income.expenses.some((e) => e.amount > 0),
    finance,
    gaya: !!disc,
    minat: chips >= 3,
    swot: !!sw && sw.s.length > 0 && sw.w.length > 0 && sw.o.length + sw.t.length > 0,
    aset: !!as && [as.capital, as.social, as.human, as.physical].filter((x) => x.length).length >= 3,
    wheel: ew.length > 0,
    plan: !!income && income.plans.length > 0,
    target: false,
    daily: stats.dailyTotal30 > 0,
    habit,
    streak: stats.last7.filter((d) => d.done > 0).length >= 3,
    syukur,
    review: false,
    retest: !!ew[0] && Date.now() - new Date(ew[0].created_at).getTime() < 90 * 86_400_000,
  };
  const steps: JourneyStep[] = STEPS.map((s) => {
    const items = s.items.map((i) => ({ ...i, done: !!done[i.key] }));
    const req = items.filter((i) => !i.optional);
    const d = req.filter((i) => i.done).length;
    return { ...s, items, done: d, total: req.length, complete: d === req.length };
  });
  let next: Journey["next"] = null;
  for (const s of steps) {
    const i = s.items.find((x) => !x.optional && !x.done);
    if (i) {
      next = { ...i, step: s.no };
      break;
    }
  }
  const req = steps.slice(0, 4).flatMap((s) => s.items.filter((i) => !i.optional));
  const pct = Math.round((req.filter((i) => i.done).length / req.length) * 100);
  const firstOpen = steps.slice(0, 4).find((s) => !s.complete);
  return { steps, next, current: firstOpen ? firstOpen.no : 5, pct };
}
