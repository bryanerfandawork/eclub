import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { getAssessmentResults, getDreams, getProfile, getProgressStats } from "./data";
import { getDiscResult } from "./disc/server";
import { getIncomeProfile } from "./income-server";
import { sourcesFilled } from "./income";
import { isEmergency } from "./types";
import { PLACEMENT_KEY } from "./placement";

export const REVIEW_KEY = "weekly_review";
export const REKAP_KEY = "rekap_ack";
export const RITME_KEY = "ritme_ack";
import { todayJakarta } from "./format";
import { STEPS, type Step, type StepItem } from "./steps";

export type JourneyItem = StepItem & { done: boolean };
export type JourneyStep = Omit<Step, "items"> & { items: JourneyItem[]; done: number; total: number; complete: boolean };
export type Journey = { steps: JourneyStep[]; next: (JourneyItem & { step: number }) | null; current: number; pct: number; setupDone: boolean };

/** Status setiap isian perjalanan (dipakai Home, halaman Perjalanan, dan tombol Lanjut). */
/** Hitungan baris untuk status perjalanan (dimulai bersamaan dengan pengambilan data lain). */
async function countRows() {
  const supabase = await createClient();
  return Promise.all([
      supabase.from("fin_transactions").select("id", { count: "exact", head: true }).gte("tx_date", todayJakarta(-30)),
      supabase.from("habits").select("id", { count: "exact", head: true }).eq("archived", false),
      supabase.from("gratitude_entries").select("id", { count: "exact", head: true }).gte("entry_date", todayJakarta(-6)),
      supabase.from("works").select("id", { count: "exact", head: true }).eq("archived", false),
      supabase.from("fin_products").select("id", { count: "exact", head: true }),
      // Target Harian: tombol "Jadikan aksi harian" membuat rencana "Jual ..."; atau produk HPP tersimpan.
      supabase.from("daily_actions").select("id", { count: "exact", head: true }).ilike("title", "Jual %"),
  ]);
}

async function getDoneMapRaw(): Promise<Record<string, boolean>> {
  const counts = isDemoMode ? null : countRows();
  const [profile, dreams, stats, disc, ew, placed, income, review, rekapAck, ritmeAck] = await Promise.all([
    getProfile(),
    getDreams(),
    getProgressStats(),
    getDiscResult(),
    getAssessmentResults("8-wheel-entrepreneur", 1),
    getAssessmentResults(PLACEMENT_KEY, 1),
    getIncomeProfile().catch(() => null),
    getAssessmentResults(REVIEW_KEY, 1),
    getAssessmentResults(REKAP_KEY, 1),
    getAssessmentResults(RITME_KEY, 1),
  ]);
  let finance = false;
  let habit = false;
  let work = false;
  let syukur = false;
  let target = false;
  if (isDemoMode) {
    finance = true;
    habit = true;
    work = true;
    target = true;
  } else {
    const [f, h, g, w, tp, td] = await counts!;
    target = (tp.count ?? 0) > 0 || (td.count ?? 0) > 0;
    finance = (f.count ?? 0) > 0;
    habit = (h.count ?? 0) > 0;
    // Sebelum SQL 021 dijalankan tabel works belum ada: cukup kebiasaan saja.
    work = w.error ? habit : (w.count ?? 0) > 0;
    syukur = (g.count ?? 0) > 0;
  }
  const chips = income ? income.interests.length + income.hobbies.length + income.talents.length + income.passions.length : 0;
  const sw = income?.swot;
  const as = income?.assets;
  const done: Record<string, boolean> = {
    dream: dreams.some((d) => !isEmergency(d)),
    dream_num: dreams.some((d) => !isEmergency(d) && d.target_amount && d.target_date),
    life: !!profile.success_definition,
    placement: !!(placed[0]?.scores as unknown as { placement?: string } | undefined)?.placement,
    income: !!income && !!(income.situation.role || income.sources.some((x) => x.role)) && sourcesFilled(income.sources) && income.expenses.some((e) => e.amount > 0),
    finance,
    gaya: !!disc,
    minat: chips >= 3,
    swot: !!sw && sw.s.length > 0 && sw.w.length > 0 && sw.o.length + sw.t.length > 0,
    aset: !!as && [as.capital, as.social, as.human, as.physical].filter((x) => x.length).length >= 3,
    wheel: ew.length > 0,
    plan: !!income && income.plans.length > 0,
    target,
    rekap: isDemoMode || rekapAck.length > 0,
    review: !!review[0] && Date.now() - new Date(review[0].created_at).getTime() < 7 * 86_400_000,
    rutinitas: work && habit,
    ritme: ritmeAck.length > 0,
    report: stats.last7.some((d) => d.done > 0),
    daily: stats.dailyTotal30 > 0,
    habit,
    streak: stats.last7.filter((d) => d.done > 0).length >= 3,
    syukur,
    progress: false,
    retest: !!ew[0] && Date.now() - new Date(ew[0].created_at).getTime() < 90 * 86_400_000,
  };
  return done;
}

async function getJourneyRaw(): Promise<Journey> {
  const done = await getDoneMap();
  const steps: JourneyStep[] = STEPS.map((s) => {
    const items = s.items.map((i) => ({ ...i, done: !!done[i.key] }));
    const req = items.filter((i) => !i.optional);
    const d = req.filter((i) => i.done).length;
    return { ...s, items, done: d, total: req.length, complete: req.length > 0 && d === req.length };
  });
  let next: Journey["next"] = null;
  for (const s of steps) {
    const i = s.items.find((x) => !x.optional && !x.done);
    if (i) {
      next = { ...i, step: s.no };
      break;
    }
  }
  const req = steps.flatMap((s) => s.items.filter((i) => !i.optional));
  const pct = Math.round((req.filter((i) => i.done).length / req.length) * 100);
  const firstOpen = steps.find((s) => !s.complete);
  return { steps, next, current: firstOpen ? firstOpen.no : 5, pct, setupDone: !firstOpen };
}

// Satu kali per permintaan (halaman memanggilnya dari beberapa komponen).
export const getDoneMap = cache(getDoneMapRaw);
export const getJourney = cache(getJourneyRaw);
