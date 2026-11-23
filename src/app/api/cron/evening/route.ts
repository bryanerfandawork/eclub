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
 * - Aktif 0-2 hari terakhir: pengingat pribadi (rencana yang belum selesai / kebiasaan belum dicentang);
 *   belum ada rencana sama sekali: kalimat bergilir. Semua beres: tidak dikirim.
 * - Hari Minggu: Rapor Mingguan (persen rencana selesai + mimpi yang paling maju).
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
  const nowDay = wibDay(Date.now());
  const sunday = new Date(Date.now() + 7 * 3600_000).getUTCDay() === 0;
  const evening: string[] = [];
  const winback = new Map<number, string[]>();
  for (const id of userIds) {
    const t = last.get(id);
    if (!t) continue;
    const days = nowDay - wibDay(t);
    const tier = winbackTier(days);
    if (tier && winbackOn) winback.set(tier, [...(winback.get(tier) ?? []), id]);
    else if (days <= 2 && eveningOn) evening.push(id);
  }

  // Data laporan harian para pengguna aktif (select * agar tetap jalan sebelum/ sesudah SQL 021).
  type Row = { user_id: string; title: string; done: boolean; status?: string; dream_id: string | null; work_id?: string | null; action_date: string };
  const rows: Row[] = [];
  const habitsOf = new Map<string, number>();
  const logsOf = new Map<string, number>();
  const dreamTitle = new Map<string, string>();
  const workDream = new Map<string, string | null>();
  const finDone = new Set<string>();
  for (let i = 0; i < evening.length; i += 200) {
    const ids = evening.slice(i, i + 200);
    const [d, h, l, w, ft, fc] = await Promise.all([
      admin.from("daily_actions").select("*").in("user_id", ids).gte("action_date", sunday ? todayJakarta(-6) : today).lte("action_date", today),
      admin.from("habits").select("user_id").in("user_id", ids).eq("archived", false),
      admin.from("habit_logs").select("user_id").in("user_id", ids).eq("log_date", today),
      admin.from("works").select("id, dream_id").in("user_id", ids),
      admin.from("fin_transactions").select("user_id").in("user_id", ids).eq("tx_date", today),
      admin.from("fin_checks").select("user_id").in("user_id", ids).eq("check_date", today),
    ]);
    for (const r of [...(ft.data ?? []), ...(fc.data ?? [])]) finDone.add(r.user_id as string);
    rows.push(...((d.data ?? []) as Row[]));
    for (const r of h.data ?? []) habitsOf.set(r.user_id as string, (habitsOf.get(r.user_id as string) ?? 0) + 1);
    for (const r of l.data ?? []) logsOf.set(r.user_id as string, (logsOf.get(r.user_id as string) ?? 0) + 1);
    for (const r of w.data ?? []) workDream.set(r.id as string, (r.dream_id as string | null) ?? null);
  }
  if (sunday) {
    const ids = [...new Set(rows.map((r) => r.dream_id).concat([...workDream.values()]).filter(Boolean))] as string[];
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await admin.from("dreams").select("id, title").in("id", ids.slice(i, i + 200));
      for (const r of data ?? []) dreamTitle.set(r.id as string, r.title as string);
    }
  }
  const st = (r: Row) => (r.status === "closed" ? "closed" : r.done ? "done" : "open");
  const short = (t: string) => (t.length > 40 ? t.slice(0, 38) + "…" : t);

  const subsOf = (ids: string[]) => {
    const set = new Set(ids);
    return subs.filter((s) => set.has(s.user_id));
  };
  let pushed = 0;
  let personal = 0;
  const generic: string[] = [];
  for (const id of evening) {
    const mine = rows.filter((r) => r.user_id === id);
    const todays = mine.filter((r) => r.action_date === today && st(r) !== "closed");
    const open = todays.filter((r) => st(r) === "open");
    const habitLeft = Math.max(0, (habitsOf.get(id) ?? 0) - (logsOf.get(id) ?? 0));
    const finLeft = !finDone.has(id);
    let msg: { title: string; body: string; url: string; tag: string } | null = null;
    if (sunday) {
      // Rapor Mingguan: % rencana selesai + mimpi yang paling maju.
      const week = mine.filter((r) => st(r) !== "closed"); // yang ditutup tidak dihitung gagal
      const done = week.filter((r) => st(r) === "done");
      const per = new Map<string, number>();
      for (const r of done) {
        const dr = r.dream_id || (r.work_id ? workDream.get(r.work_id) : null);
        if (dr) per.set(dr, (per.get(dr) ?? 0) + 1);
      }
      const top = [...per.entries()].sort((a, b) => b[1] - a[1])[0];
      const pct = week.length ? Math.round((done.length / week.length) * 100) : 0;
      msg = week.length
        ? {
            title: `Rapor Mingguan: ${pct}% rencana selesai 📊`,
            body: `${done.length} dari ${week.length} rencana aksi tuntas minggu ini.${top && dreamTitle.get(top[0]) ? ` Paling maju: ${short(dreamTitle.get(top[0])!)}.` : ""} Yuk evaluasi 2 menit.`,
            url: "/evaluasi#mingguan",
            tag: "weekly",
          }
        : { title: "Rapor Mingguan 📊", body: "Minggu ini belum ada rencana aksi yang dilaporkan. Luangkan 2 menit untuk evaluasi dan susun rencana minggu depan.", url: "/evaluasi#mingguan", tag: "weekly" };
    } else if (open.length) {
      msg = {
        title: `Masih ada ${open.length} rencana hari ini ⏳`,
        body: `"${short(open[0].title)}"${open.length > 1 ? ` dan ${open.length - 1} lainnya` : ""}. Tandai selesai, lanjut besok, atau tutup.${finLeft ? " Jangan lupa lapor keuangan." : ""}`,
        url: "/today",
        tag: "evening",
      };
    } else if (todays.length && (habitLeft || finLeft)) {
      const left = [habitLeft ? `${habitLeft} kebiasaan belum dicentang` : "", finLeft ? "keuangan hari ini belum dilaporkan" : ""].filter(Boolean).join(" dan ");
      msg = { title: "Rencana beres, tinggal sedikit lagi ✅", body: `${left[0].toUpperCase()}${left.slice(1)}. 1 menit saja.`, url: "/today", tag: "evening" };
    } else if (!todays.length) {
      generic.push(id);
    }
    if (msg) {
      pushed += await sendPushToSubs(admin, subsOf([id]), msg);
      personal++;
    }
  }
  if (generic.length) {
    const [title, body] = pickLine(EVENING, nowDay);
    pushed += await sendPushToSubs(admin, subsOf(generic), { title, body, url: "/today", tag: "evening" });
  }
  for (const [tier, ids] of winback) {
    const [title, body] = pickLine(WINBACK[tier], nowDay);
    pushed += await sendPushToSubs(admin, subsOf(ids), { title, body, url: "/dashboard", tag: "winback" });
  }
  return NextResponse.json({ ok: true, pushed, sunday, personal, generic: generic.length, winback: Object.fromEntries([...winback].map(([k, v]) => [k, v.length])) });
}
