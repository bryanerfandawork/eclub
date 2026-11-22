import "server-only";
import { demoDaily, demoHabits, demoWorks } from "./demo";
import { getDailyRange, getDreams } from "./data";
import { todayJakarta } from "./format";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import type { DailyAction, HabitItem, Work } from "./types";

/** Status satu rencana aksi (kompatibel dengan data lama yang belum punya kolom status). */
export const statusOf = (a: DailyAction) => (a.status === "closed" ? "closed" : a.done ? "done" : "open");
export const originOf = (a: DailyAction) => a.origin_date || a.created_at?.slice(0, 10) || a.action_date;
export const daysBetween = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000));

export async function getWorks(): Promise<Work[]> {
  if (isDemoMode) return demoWorks;
  const supabase = await createClient();
  const { data, error } = await supabase.from("works").select("id, name, dream_id").eq("archived", false).order("created_at");
  return error ? [] : ((data ?? []) as Work[]);
}

export async function getHabitsToday(): Promise<{ habits: HabitItem[]; logs: { habit_id: string; log_date: string }[] }> {
  if (isDemoMode)
    return { habits: demoHabits, logs: [0, -1, -2, -3].flatMap((d) => [{ habit_id: "h1", log_date: todayJakarta(d) }, ...(d ? [{ habit_id: "h2", log_date: todayJakarta(d) }] : [])]) };
  const supabase = await createClient();
  const [h, l] = await Promise.all([
    supabase.from("habits").select("*").eq("archived", false).order("created_at"),
    supabase.from("habit_logs").select("habit_id, log_date").gte("log_date", todayJakarta(-29)),
  ]);
  return { habits: (h.data ?? []) as HabitItem[], logs: l.data ?? [] };
}

export type AssistantStats = {
  today: { total: number; done: number; open: number };
  overdue: DailyAction[];
  total30: number;
  done30: number;
  closed30: number;
  rate: number; // % selesai dari rencana yang jatuh tempo (30 hari), tanpa yang ditutup
  dreamPct: number; // % rencana yang mendukung mimpi
  followups: number;
  longest: (DailyAction & { age: number })[];
  byWork: { id: string; name: string; total: number; done: number }[];
  week: { total: number; done: number; rate: number; topDream: { title: string; done: number } | null };
  habits: { count: number; doneToday: number; rate7: number };
};

/** Ringkasan "asisten pribadi": dipakai Home dan Laporan Harian. */
export async function getAssistantStats(): Promise<AssistantStats> {
  const today = todayJakarta();
  const [items, works, dreams, hb] = await Promise.all([
    isDemoMode ? Promise.resolve(demoDaily) : getDailyRange(todayJakarta(-29), today),
    getWorks(),
    getDreams(),
    getHabitsToday(),
  ]);
  const workDream = new Map(works.map((w) => [w.id, w.dream_id]));
  const dreamOf = (a: DailyAction) => a.dream_id || (a.work_id ? workDream.get(a.work_id) : null) || null;
  const due = items.filter((a) => a.action_date <= today);
  const done = due.filter((a) => statusOf(a) === "done");
  const closed = due.filter((a) => statusOf(a) === "closed");
  const todays = items.filter((a) => a.action_date === today && statusOf(a) !== "closed");
  const open = items.filter((a) => statusOf(a) === "open");
  const overdue = open.filter((a) => a.action_date < today);
  const weekFrom = todayJakarta(-6);
  const week = due.filter((a) => a.action_date >= weekFrom && statusOf(a) !== "closed");
  const weekDone = week.filter((a) => statusOf(a) === "done");
  const perDream = new Map<string, number>();
  for (const a of weekDone) {
    const d = dreamOf(a);
    if (d) perDream.set(d, (perDream.get(d) ?? 0) + 1);
  }
  const top = [...perDream.entries()].sort((a, b) => b[1] - a[1])[0];
  const hDone = (d: string) => hb.logs.filter((l) => l.log_date === d && hb.habits.some((h) => h.id === l.habit_id)).length;
  const last7 = Array.from({ length: 7 }, (_, i) => todayJakarta(-i));
  return {
    today: { total: todays.length, done: todays.filter((a) => statusOf(a) === "done").length, open: todays.filter((a) => statusOf(a) === "open").length },
    overdue,
    total30: due.length,
    done30: done.length,
    closed30: closed.length,
    rate: due.length - closed.length ? Math.round((done.length / (due.length - closed.length)) * 100) : 0, // yang ditutup tidak dihitung gagal
    dreamPct: items.length ? Math.round((items.filter((a) => dreamOf(a)).length / items.length) * 100) : 0,
    followups: items.reduce((n, a) => n + (a.followups ?? 0), 0),
    longest: open
      .map((a) => ({ ...a, age: daysBetween(originOf(a), today) }))
      .filter((a) => a.age > 0)
      .sort((a, b) => b.age - a.age || (b.followups ?? 0) - (a.followups ?? 0))
      .slice(0, 3),
    byWork: works
      .map((w) => {
        const mine = due.filter((a) => a.work_id === w.id);
        return { id: w.id, name: w.name, total: mine.length, done: mine.filter((a) => statusOf(a) === "done").length };
      })
      .filter((w) => w.total > 0),
    week: {
      total: week.length,
      done: weekDone.length,
      rate: week.length ? Math.round((weekDone.length / week.length) * 100) : 0,
      topDream: top ? { title: dreams.find((d) => d.id === top[0])?.title ?? "Mimpi Anda", done: top[1] } : null,
    },
    habits: {
      count: hb.habits.length,
      doneToday: hDone(today),
      rate7: hb.habits.length ? Math.round((last7.reduce((n, d) => n + hDone(d), 0) / (hb.habits.length * 7)) * 100) : 0,
    },
  };
}
