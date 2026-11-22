import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayJakarta } from "@/lib/format";
import { sendPushToSubs } from "@/lib/push";
import { EVENING, WINBACK, pickLine, winbackTier } from "@/lib/nudges";

export const runtime = "nodejs";
export const maxDuration = 60;

type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };
const DAY = 86_400_000;
const wibDay = (t: number) => Math.floor((t + 7 * 3600_000) / DAY);

/**
 * Dipanggil Vercel Cron setiap malam (19.00 WIB).
 * - Aktif 0-2 hari terakhir dan belum mencentang aksi hari ini: pengingat progres harian (kalimat bergilir).
 * - Tidak membuka EClub 3, 5, 7, 14, 21, 30 hari (lalu tiap 30 hari s.d. 180 hari): pengingat untuk kembali.
 * Hari lain: tidak dikirim apa-apa, supaya tidak mengganggu. Maksimal 1 notifikasi malam per orang.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });

  const { data: cfg } = await admin.from("app_settings").select("key, value").in("key", ["push_evening", "push_winback"]);
  const on = (k: string) => {
    const v = (cfg ?? []).find((c) => c.key === k)?.value as unknown;
    return v !== false && v !== "false";
  };
  const eveningOn = on("push_evening");
  const winbackOn = on("push_winback");
  if (!eveningOn && !winbackOn) return NextResponse.json({ ok: true, skipped: true });

  const subs: Sub[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth").range(from, from + 999);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    subs.push(...((data ?? []) as Sub[]));
    if (!data || data.length < 1000) break;
  }
  const userIds = [...new Set(subs.map((s) => s.user_id))];
  if (!userIds.length) return NextResponse.json({ ok: true, pushed: 0 });

  // Terakhir aktif = yang paling baru antara buka aplikasi (last_seen_at), login, atau tanggal daftar.
  const last = new Map<string, number>();
  for (let i = 0; i < userIds.length; i += 200) {
    const ids = userIds.slice(i, i + 200);
    const { data } = await admin.from("profiles").select("id, last_seen_at, created_at").in("id", ids);
    for (const p of (data ?? []) as { id: string; last_seen_at?: string | null; created_at: string }[]) {
      last.set(p.id, Math.max(p.last_seen_at ? Date.parse(p.last_seen_at) : 0, Date.parse(p.created_at)));
    }
  }
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    for (const u of data.users) if (u.last_sign_in_at && last.has(u.id)) last.set(u.id, Math.max(last.get(u.id)!, Date.parse(u.last_sign_in_at)));
    if (data.users.length < 1000) break;
  }

  const today = todayJakarta();
  const doneToday = new Set<string>();
  {
    const { data } = await admin.from("daily_actions").select("user_id").eq("action_date", today).eq("done", true);
    for (const r of data ?? []) doneToday.add(r.user_id as string);
  }

  const nowDay = wibDay(Date.now());
  const evening: string[] = [];
  const winback = new Map<number, string[]>();
  for (const id of userIds) {
    const t = last.get(id);
    if (!t) continue;
    const days = nowDay - wibDay(t);
    const tier = winbackTier(days);
    if (tier && winbackOn) winback.set(tier, [...(winback.get(tier) ?? []), id]);
    else if (days <= 2 && eveningOn && !doneToday.has(id)) evening.push(id);
  }

  const subsOf = (ids: string[]) => {
    const set = new Set(ids);
    return subs.filter((s) => set.has(s.user_id));
  };
  let pushed = 0;
  if (evening.length) {
    const [title, body] = pickLine(EVENING, nowDay);
    pushed += await sendPushToSubs(admin, subsOf(evening), { title, body, url: "/today", tag: "evening" });
  }
  for (const [tier, ids] of winback) {
    const [title, body] = pickLine(WINBACK[tier], nowDay);
    pushed += await sendPushToSubs(admin, subsOf(ids), { title, body, url: "/dashboard", tag: "winback" });
  }
  return NextResponse.json({ ok: true, pushed, evening: evening.length, winback: Object.fromEntries([...winback].map(([k, v]) => [k, v.length])) });
}
