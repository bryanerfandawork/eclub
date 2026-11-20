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
