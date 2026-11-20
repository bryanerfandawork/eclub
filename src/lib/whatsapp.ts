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
    const data = (await res.json().catch(() => ({}))) as { status?: boolean };
    return res.ok && data.status !== false;
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
    const { data: p } = await admin.from("profiles").select("full_name, whatsapp, wa_opt_in").eq("id", order.user_id).maybeSingle();
    if (!p?.wa_opt_in || !p.whatsapp) return;
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
