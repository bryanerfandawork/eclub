import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWa, waConfigured } from "@/lib/whatsapp";
import { todayJakarta } from "@/lib/format";
import { motivationOfDay } from "@/lib/motivation";

export const runtime = "nodejs";
export const maxDuration = 60;

let MAX_PER_RUN = 40; // diatur admin lewat app_settings.wa_daily_max (maks 70 agar selesai < 60 detik)
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

/** Dipanggil Vercel Cron setiap pagi (07.00 WIB). Mengirim maksimal 1 pengingat per orang per hari. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const admin = createAdminClient();
  if (!admin || !waConfigured()) return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });

  const today = todayJakarta();
  const { data: cfg } = await admin.from("app_settings").select("key, value").in("key", ["wa_daily_max", "renewal_days", "wa_motivation", "birthday_promo"]);
  const setting = (k: string) => (cfg ?? []).find((c) => c.key === k)?.value as unknown;
  MAX_PER_RUN = Math.min(70, Math.max(1, Number(setting("wa_daily_max")) || 40));
  const renewalDays = String(setting("renewal_days") ?? "7,3,1").split(/[,\s]+/).map(Number).filter((n) => n > 0 && n <= 30);
  const motivationOn = setting("wa_motivation") !== false && setting("wa_motivation") !== "false";
  const quote = motivationOfDay(today);
  const dayStart = new Date(today + "T00:00:00+07:00").toISOString();
  const { data: users } = await admin
    .from("profiles")
    .select("id, full_name, whatsapp, wa_daily")
    .eq("wa_opt_in", true)
    .not("whatsapp", "is", null)
    .limit(500);

  let sent = 0;

  // Pengingat pesanan yang belum dibayar (notifikasi transaksi: cukup nomor WA tersimpan, tanpa opt-in harian).
  const { data: pend } = await admin
    .from("orders")
    .select("id, user_id, title, amount")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .lt("created_at", new Date(Date.now() - 3 * 3_600_000).toISOString())
    .limit(50);
  const reminded = new Set<string>();
  for (const o of pend ?? []) {
    if (sent >= MAX_PER_RUN || reminded.has(o.user_id)) continue;
    const { data: logs } = await admin.from("notification_log").select("id").eq("user_id", o.user_id).eq("kind", "order_reminder").gte("created_at", new Date(Date.now() - 20 * 3_600_000).toISOString()).limit(1);
    if (logs?.length) continue;
    const { data: pr } = await admin.from("profiles").select("full_name, whatsapp").eq("id", o.user_id).maybeSingle();
    if (!pr?.whatsapp) continue;
    const name = (pr.full_name || "Sahabat").split(" ")[0];
    const ok = await sendWa(pr.whatsapp, `Halo ${name}, pesanan *${o.title}* (Rp${o.amount.toLocaleString("id-ID")}) masih menunggu pembayaran. Lanjutkan di sini:\n${SITE}/pesanan/${o.id}\n\nSudah bayar? Kirim bukti lewat tombol "Konfirmasi via WhatsApp" di halaman itu.`);
    await admin.from("notification_log").insert({ user_id: o.user_id, kind: "order_reminder", status: ok ? "sent" : "failed" });
    reminded.add(o.user_id);
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700));
  }

  // Ucapan ulang tahun + promo spesial (sekali setahun, untuk member yang menyimpan nomor WA & tanggal lahir).
  const mmdd = today.slice(5);
  const { data: bdays } = await admin.from("profiles").select("id, full_name, whatsapp, birth_date").not("birth_date", "is", null).not("whatsapp", "is", null).limit(5000);
  const promo = String(setting("birthday_promo") ?? "").trim();
  for (const u of (bdays ?? []).filter((b) => String(b.birth_date).slice(5) === mmdd)) {
    if (sent >= MAX_PER_RUN) break;
    const kind = `birthday_${today.slice(0, 4)}`;
    const { data: logs } = await admin.from("notification_log").select("id").eq("user_id", u.id).eq("kind", kind).limit(1);
    if (logs?.length) continue;
    const name = (u.full_name || "Sahabat").split(" ")[0];
    const ok = await sendWa(u.whatsapp as string, `Selamat ulang tahun, ${name}! 🎂🎉\n\nSemoga tahun ini penuh berkah, sehat, dan satu per satu mimpi Anda terwujud. Tim EClub bangga berjalan bersama Anda.${promo ? `\n\n🎁 ${promo}` : ""}\n\n${SITE}/dashboard`);
    await admin.from("notification_log").insert({ user_id: u.id, kind, status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700));
  }

  // Pengingat perpanjangan EClub Plus (H-7, H-3, H-1 sesuai pengaturan) + sehari setelah berakhir.
  const { data: subs } = await admin
    .from("profiles")
    .select("id, full_name, whatsapp, plan_expires_at")
    .eq("plan", "plus")
    .not("whatsapp", "is", null)
    .not("plan_expires_at", "is", null)
    .gt("plan_expires_at", new Date(Date.now() - 2 * 86_400_000).toISOString())
    .lt("plan_expires_at", new Date(Date.now() + 31 * 86_400_000).toISOString())
    .limit(200);
  for (const u of subs ?? []) {
    if (sent >= MAX_PER_RUN) break;
    const exp = new Date(u.plan_expires_at as string);
    const expDay = exp.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
    const days = Math.round((new Date(expDay + "T00:00:00Z").getTime() - new Date(today + "T00:00:00Z").getTime()) / 86_400_000);
    const ended = days === -1;
    if (!ended && !renewalDays.includes(days)) continue;
    const kind = ended ? "renew_ended" : `renew_${days}`;
    const { data: logs } = await admin.from("notification_log").select("id").eq("user_id", u.id).eq("kind", kind).gte("created_at", new Date(Date.now() - 5 * 86_400_000).toISOString()).limit(1);
    if (logs?.length) continue;
    const name = (u.full_name || "Sahabat").split(" ")[0];
    const tgl = exp.toLocaleDateString("id-ID", { day: "numeric", month: "long", timeZone: "Asia/Jakarta" });
    const msg = ended
      ? `Halo ${name}, masa EClub Plus Anda berakhir kemarin. Data Anda tetap aman, tapi fitur Plus (laporan laba rugi, affiliate, harga khusus mentoring) sedang terkunci.\n\nAktifkan lagi di sini: ${SITE}/beli/plus`
      : `Halo ${name} 👋 EClub Plus Anda berakhir ${days === 1 ? "besok" : `dalam ${days} hari`} (${tgl}).\n\nPerpanjang sekarang supaya laporan keuangan, kode kupon affiliate, dan komisi Anda tetap aktif tanpa jeda:\n${SITE}/beli/plus`;
    const ok = await sendWa(u.whatsapp as string, msg);
    await admin.from("notification_log").insert({ user_id: u.id, kind, status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700));
  }

  // Pengingat jadwal mentoring & event yang berlangsung dalam 24 jam ke depan (sekali saja).
  const soon = new Date(Date.now() + 24 * 3_600_000).toISOString();
  const nowIso = new Date().toISOString();
  const jamWib = (iso: string) => new Date(iso).toLocaleString("id-ID", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";
  const { data: books } = await admin
    .from("mentoring_bookings")
    .select("id, user_id, mentoring_slots!inner(mentor, starts_at, meet_link)")
    .eq("status", "confirmed")
    .eq("reminded", false)
    .gt("mentoring_slots.starts_at", nowIso)
    .lt("mentoring_slots.starts_at", soon)
    .limit(30);
  for (const b of (books ?? []) as unknown as { id: string; user_id: string; mentoring_slots: { mentor: string; starts_at: string; meet_link: string | null } }[]) {
    if (sent >= MAX_PER_RUN) break;
    const { data: pr } = await admin.from("profiles").select("full_name, whatsapp").eq("id", b.user_id).maybeSingle();
    await admin.from("mentoring_bookings").update({ reminded: true }).eq("id", b.id);
    if (!pr?.whatsapp) continue;
    const s = b.mentoring_slots;
    const ok = await sendWa(pr.whatsapp, `Halo ${(pr.full_name || "Sahabat").split(" ")[0]}, pengingat sesi mentoring dengan *${s.mentor}* ${jamWib(s.starts_at)} 🗓️\n${s.meet_link ? `Link: ${s.meet_link}` : `Detail: ${SITE}/mentoring`}\n\nSiapkan 1 masalah utama yang ingin dibahas ya.`);
    await admin.from("notification_log").insert({ user_id: b.user_id, kind: "mentoring_reminder", status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700));
  }
  const { data: evs } = await admin.from("events").select("id, title, starts_at, meet_link").gt("starts_at", nowIso).lt("starts_at", soon).limit(5);
  for (const e of evs ?? []) {
    const { data: regs } = await admin.from("event_registrations").select("user_id").eq("event_id", e.id).eq("status", "confirmed").eq("reminded", false).limit(MAX_PER_RUN);
    for (const r of regs ?? []) {
      if (sent >= MAX_PER_RUN) break;
      await admin.from("event_registrations").update({ reminded: true }).eq("event_id", e.id).eq("user_id", r.user_id);
      const { data: pr } = await admin.from("profiles").select("full_name, whatsapp").eq("id", r.user_id).maybeSingle();
      if (!pr?.whatsapp) continue;
      const ok = await sendWa(pr.whatsapp, `Halo ${(pr.full_name || "Sahabat").split(" ")[0]}, jangan lupa *${e.title}* ${jamWib(e.starts_at)} 🎤\n${e.meet_link ? `Link: ${e.meet_link}` : `Detail: ${SITE}/event`}`);
      await admin.from("notification_log").insert({ user_id: r.user_id, kind: "event_reminder", status: ok ? "sent" : "failed" });
      if (ok) sent++;
      await new Promise((res) => setTimeout(res, 700));
    }
  }

  for (const u of users ?? []) {
    if (sent >= MAX_PER_RUN) break;
    const { data: recent } = await admin.from("notification_log").select("kind, created_at").eq("user_id", u.id).gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
    if ((recent ?? []).some((r) => r.created_at >= dayStart)) continue; // sudah dapat pesan hari ini
    const name = (u.full_name || "Sahabat").split(" ")[0];

    // 1) Pengingat tes ulang 8 Wheel setelah 3 bulan (maksimal sebulan sekali)
    let kind: string | null = null;
    let message = "";
    const { data: ew } = await admin
      .from("assessment_results")
      .select("created_at")
      .eq("user_id", u.id)
      .eq("assessment_key", "8-wheel-entrepreneur")
      .order("created_at", { ascending: false })
      .limit(1);
    const due = ew?.[0] && Date.now() - new Date(ew[0].created_at).getTime() > 90 * 86_400_000;
    if (due && !(recent ?? []).some((r) => r.kind === "retest")) {
      kind = "retest";
      message = `Halo ${name} 👋 Sudah 3 bulan sejak tes 8 Wheel Entrepreneur terakhir Anda. Yuk ukur lagi perkembangan Anda (sekitar 7 menit):\n${SITE}/assessment/8-wheel-entrepreneur?ulang=1`;
    } else if (u.wa_daily) {
      // 2) Pengingat aksi harian
      const { count } = await admin.from("daily_actions").select("id", { count: "exact", head: true }).eq("user_id", u.id).eq("action_date", today).eq("done", false);
      kind = "daily";
      const spark = motivationOn ? `✨ _${quote}_\n\n` : "";
      message = count
        ? `Selamat pagi, ${name} 🌱\n\n${spark}Hari ini ada ${count} aksi yang menunggu Anda.\n${SITE}/today`
        : `Selamat pagi, ${name} 🌱\n\n${spark}Apa satu langkah kecil menuju mimpi Anda hari ini?\n${SITE}/today`;
    }
    if (!kind) continue;
    const ok = await sendWa(u.whatsapp as string, message + "\n\nUntuk berhenti, matikan notifikasi di menu Profil EClub.");
    await admin.from("notification_log").insert({ user_id: u.id, kind, status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700)); // jeda agar tidak dianggap spam
  }
  return NextResponse.json({ ok: true, sent });
}
