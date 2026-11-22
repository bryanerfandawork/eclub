import "server-only";
import { createAdminClient } from "./supabase/admin";
import { rupiah } from "./format";

/** Ubah 08xx / +628xx / 628xx menjadi 628xx. null jika tidak valid. */
export function normalizeWa(input: string): string | null {
  const d = input.replace(/[^\d]/g, "").replace(/^0/, "62");
  return /^62\d{8,13}$/.test(d) ? d : null;
}

export const waConfigured = () => !!process.env.FONNTE_TOKEN;

/** Kirim satu pesan lewat Fonnte. */
export async function sendWa(target: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ target, message, countryCode: "62" });
    const res = await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: token }, body });
    const data = (await res.json().catch(() => ({}))) as { status?: boolean; reason?: string };
    const ok = res.ok && data.status !== false;
    if (!ok) console.error("sendWa gagal", res.status, data.reason ?? "");
    return ok;
  } catch {
    return false;
  }
}

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

/** Konfirmasi pembayaran lunas ke pembeli (jika mengaktifkan WhatsApp). Tidak pernah melempar error. */
export async function notifyOrderPaid(orderId: string) {
  try {
    const admin = createAdminClient();
    if (!admin || !waConfigured()) return;
    const { data: order } = await admin.from("orders").select("user_id, title, amount, status").eq("id", orderId).maybeSingle();
    if (!order || order.status !== "paid") return;
    const { data: p } = await admin.from("profiles").select("full_name, whatsapp").eq("id", order.user_id).maybeSingle();
    if (!p?.whatsapp) return; // notifikasi transaksi: cukup nomor tersimpan
    const name = (p.full_name || "Sahabat").split(" ")[0];
    const ok = await sendWa(
      p.whatsapp,
      `Halo ${name}, pembayaran ${rupiah(order.amount)} untuk *${order.title}* sudah kami terima. Terima kasih! ✅\n\nAkses Anda sudah aktif: ${SITE()}/dashboard`,
    );
    await admin.from("notification_log").insert({ user_id: order.user_id, kind: "payment", status: ok ? "sent" : "failed" });
  } catch (e) {
    console.error("notifyOrderPaid", e);
  }
}

const idr = (n: number) => "Rp" + n.toLocaleString("id-ID");

async function orderContext(orderId: string) {
  const admin = createAdminClient();
  if (!admin || !waConfigured()) return null;
  const { data: order } = await admin.from("orders").select("id, user_id, title, amount, status, created_at, expires_at").eq("id", orderId).maybeSingle();
  if (!order) return null;
  const { data: p } = await admin.from("profiles").select("full_name, whatsapp").eq("id", order.user_id).maybeSingle();
  const { data: s } = await admin.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
  const adminWa = normalizeWa(String((s?.value as string) ?? ""));
  return { admin, order, name: (p?.full_name || "Sahabat").split(" ")[0], userWa: (p?.whatsapp as string | null) ?? null, adminWa };
}

/** Pesanan baru: instruksi bayar ke pembeli + kabar ke admin. Notifikasi transaksi dikirim bila nomor tersimpan. */
export async function notifyOrderCreated(orderId: string, notifyAdmin = true) {
  try {
    const c = await orderContext(orderId);
    if (!c) return;
    const link = `${SITE()}/pesanan/${c.order.id}`;
    if (c.userWa) {
      const ok = await sendWa(
        c.userWa,
        `Halo ${c.name}, pesanan *${c.order.title}* sudah dibuat.\n\nTotal bayar: *${idr(c.order.amount)}* (mohon transfer persis termasuk 3 angka terakhir).\n\nCara bayar & konfirmasi: ${link}\n\nSetelah membayar, kirim bukti transfer lewat tombol "Konfirmasi via WhatsApp" di halaman tersebut.`,
      );
      await c.admin.from("notification_log").insert({ user_id: c.order.user_id, kind: "order_created", status: ok ? "sent" : "failed" });
    }
    if (notifyAdmin && c.adminWa) await sendWa(c.adminWa, `🛒 Pesanan baru: ${c.order.title} · ${idr(c.order.amount)} dari ${c.name}.\nKode: ${c.order.id.slice(0, 8).toUpperCase()}\nCek di ${SITE()}/admin/pesanan`);
  } catch (e) {
    console.error("notifyOrderCreated", e);
  }
}

export async function notifyOrderCancelled(orderId: string) {
  try {
    const c = await orderContext(orderId);
    if (!c || !c.userWa) return;
    const ok = await sendWa(c.userWa, `Halo ${c.name}, pesanan *${c.order.title}* (${idr(c.order.amount)}) dibatalkan. Jika Anda sudah terlanjur membayar atau merasa ini keliru, balas pesan ini atau hubungi admin EClub.`);
    await c.admin.from("notification_log").insert({ user_id: c.order.user_id, kind: "order_cancelled", status: ok ? "sent" : "failed" });
  } catch (e) {
    console.error("notifyOrderCancelled", e);
  }
}

/** Kabar komisi affiliate ke pengajak saat pesanan orang yang diajak lunas. */
export async function notifyCommission(orderId: string) {
  try {
    const admin = createAdminClient();
    if (!admin || !waConfigured()) return;
    const { data: c } = await admin.from("affiliate_commissions").select("referrer_id, amount, available_at").eq("order_id", orderId).maybeSingle();
    if (!c) return;
    const { data: p } = await admin.from("profiles").select("full_name, whatsapp").eq("id", c.referrer_id).maybeSingle();
    if (!p?.whatsapp) return;
    const name = (p.full_name || "Sahabat").split(" ")[0];
    await sendWa(p.whatsapp, `Selamat ${name}! 🎉 Ada komisi affiliate baru *${idr(Number(c.amount))}* dari orang yang Anda ajak. Bisa dicairkan mulai ${new Date(c.available_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}.\n\nLihat: ${SITE()}/affiliate`);
  } catch (e) {
    console.error("notifyCommission", e);
  }
}

/** Permintaan pencairan: kabar ke admin. Status diproses: kabar ke member. */
export async function notifyPayout(payoutId: string, event: "requested" | "processed") {
  try {
    const admin = createAdminClient();
    if (!admin || !waConfigured()) return;
    const { data: o } = await admin.from("affiliate_payouts").select("user_id, amount, status, note").eq("id", payoutId).maybeSingle();
    if (!o) return;
    const { data: p } = await admin.from("profiles").select("full_name, whatsapp").eq("id", o.user_id).maybeSingle();
    const name = (p?.full_name || "Sahabat").split(" ")[0];
    if (event === "requested") {
      const { data: s } = await admin.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
      const adminWa = normalizeWa(String((s?.value as string) ?? ""));
      if (adminWa) await sendWa(adminWa, `💸 Permintaan pencairan affiliate ${idr(Number(o.amount))} dari ${p?.full_name ?? "member"}.\nProses di ${SITE()}/admin/affiliate`);
    } else if (p?.whatsapp) {
      await sendWa(
        p.whatsapp,
        o.status === "paid"
          ? `Halo ${name}, pencairan komisi *${idr(Number(o.amount))}* sudah kami transfer ke rekening Anda. Terima kasih sudah mengajak teman bertumbuh bersama EClub! 🙏`
          : `Halo ${name}, permintaan pencairan ${idr(Number(o.amount))} belum bisa kami proses.${o.note ? ` Catatan: ${o.note}` : ""} Saldo kembali ke akun affiliate Anda: ${SITE()}/affiliate`,
      );
    }
  } catch (e) {
    console.error("notifyPayout", e);
  }
}

const wib = (iso: string) => new Date(iso).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";

/** Konfirmasi jadwal mentoring / event (gratis langsung, atau setelah lunas) ke member + admin. */
export async function notifyScheduleConfirmed(kind: "mentoring" | "event", refId: string, userId?: string) {
  try {
    const admin = createAdminClient();
    if (!admin || !waConfigured()) return;
    let uid = userId;
    if (!uid) {
      const supa = await (await import("./supabase/server")).createClient();
      uid = (await supa.auth.getUser()).data.user?.id;
    }
    if (!uid) return;
    const { data: p } = await admin.from("profiles").select("full_name, whatsapp").eq("id", uid).maybeSingle();
    const name = (p?.full_name || "Sahabat").split(" ")[0];
    const { data: s } = await admin.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
    const adminWa = normalizeWa(String((s?.value as string) ?? ""));
    if (kind === "mentoring") {
      const { data: slot } = await admin.from("mentoring_slots").select("mentor, starts_at, meet_link").eq("id", refId).maybeSingle();
      if (!slot) return;
      if (p?.whatsapp) await sendWa(p.whatsapp, `Halo ${name}, sesi mentoring Anda dengan *${slot.mentor}* terkonfirmasi ✅\n\n🗓️ ${wib(slot.starts_at)}\n${slot.meet_link ? `🔗 ${slot.meet_link}` : "Link meeting akan dikirim sebelum sesi."}\n\nDetail: ${SITE()}/mentoring`);
      if (adminWa) await sendWa(adminWa, `📅 Booking mentoring: ${p?.full_name ?? "member"} · ${wib(slot.starts_at)}. Lihat ${SITE()}/admin/jadwal`);
    } else {
      const { data: e } = await admin.from("events").select("title, starts_at, meet_link").eq("id", refId).maybeSingle();
      if (!e) return;
      if (p?.whatsapp) await sendWa(p.whatsapp, `Halo ${name}, Anda terdaftar di *${e.title}* ✅\n\n🗓️ ${wib(e.starts_at)}\n${e.meet_link ? `🔗 ${e.meet_link}` : "Link akan dikirim sebelum acara."}\n\nDetail: ${SITE()}/event`);
    }
  } catch (e) {
    console.error("notifyScheduleConfirmed", e);
  }
}

/** Setelah pesanan mentoring/event lunas. */
export async function notifyItemPaid(orderId: string) {
  try {
    const admin = createAdminClient();
    if (!admin) return;
    const { data: o } = await admin.from("orders").select("product, ref_id, user_id, status").eq("id", orderId).maybeSingle();
    if (!o || o.status !== "paid" || !o.ref_id || (o.product !== "mentoring" && o.product !== "event")) return;
    await notifyScheduleConfirmed(o.product, o.ref_id, o.user_id);
  } catch (e) {
    console.error("notifyItemPaid", e);
  }
}

/** Kabar ke admin saat ada permintaan in-house training / kolaborasi. */
export async function notifyInquiry(summary: string) {
  try {
    const admin = createAdminClient();
    if (!admin || !waConfigured()) return;
    const { data: s } = await admin.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
    const adminWa = normalizeWa(String((s?.value as string) ?? ""));
    if (adminWa) await sendWa(adminWa, `🤝 Permintaan kolaborasi baru\n${summary}\n\nLihat: ${SITE()}/admin/kolaborasi`);
  } catch (e) {
    console.error("notifyInquiry", e);
  }
}

/** Kabarkan event ke member yang berdomisili di kota/kabupaten event (maks 60 pesan per kirim). */
export async function notifyEventCity(eventId: string): Promise<{ sent: number; total: number }> {
  const admin = createAdminClient();
  if (!admin || !waConfigured()) return { sent: 0, total: 0 };
  const { data: e } = await admin.from("events").select("id, title, starts_at, regency, location, price, plus_price").eq("id", eventId).maybeSingle();
  if (!e?.regency) return { sent: 0, total: 0 };
  const { data: users } = await admin.from("profiles").select("id, full_name, whatsapp").eq("regency", e.regency).eq("wa_opt_in", true).not("whatsapp", "is", null).limit(300);
  const { data: logs } = await admin.from("notification_log").select("user_id").eq("kind", `event_city_${e.id.slice(0, 8)}`);
  const done = new Set((logs ?? []).map((l) => l.user_id));
  const todo = (users ?? []).filter((u) => !done.has(u.id));
  let sent = 0;
  for (const u of todo.slice(0, 60)) {
    const name = (u.full_name || "Sahabat").split(" ")[0];
    const ok = await sendWa(
      u.whatsapp as string,
      `Halo ${name} 👋 Ada event EClub di kota Anda!\n\n*${e.title}*\n🗓️ ${wib(e.starts_at)}${e.location ? `\n📍 ${e.location}` : ""}\n${e.price > 0 ? `💳 ${idr(e.price)} (member Plus ${e.plus_price > 0 ? idr(e.plus_price) : "gratis"})` : "🎟️ Gratis"}\n\nDaftar: ${SITE()}/event`,
    );
    await admin.from("notification_log").insert({ user_id: u.id, kind: `event_city_${e.id.slice(0, 8)}`, status: ok ? "sent" : "failed" });
    if (ok) sent++;
    await new Promise((r) => setTimeout(r, 700));
  }
  return { sent, total: todo.length };
}
