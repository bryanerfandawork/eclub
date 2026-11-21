import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWa, waConfigured } from "@/lib/whatsapp";
import { todayJakarta } from "@/lib/format";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PER_RUN = 40; // batas aman per hari di paket gratis Vercel
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
      message = count
        ? `Selamat pagi, ${name} 🌱 Hari ini ada ${count} aksi yang menunggu Anda. Satu langkah kecil hari ini lebih baik dari rencana besar besok.\n${SITE}/today`
        : `Selamat pagi, ${name} 🌱 Apa satu langkah kecil menuju mimpi Anda hari ini? Tulis di EClub supaya rangkaian konsisten Anda terjaga.\n${SITE}/today`;
    }
    if (!kind) continue;
    const ok = await sendWa(u.whatsapp as string, message + "\n\nUntuk berhenti, matikan notifikasi di menu Profil EClub.");
    await admin.from("notification_log").insert({ user_id: u.id, kind, status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700)); // jeda agar tidak dianggap spam
  }
  return NextResponse.json({ ok: true, sent });
}
