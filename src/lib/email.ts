import "server-only";
import { createAdminClient } from "./supabase/admin";

/** Email transaksi lewat Resend API. Butuh env RESEND_API_KEY (Vercel). Tanpa kunci: dilewati diam-diam. */
export const emailConfigured = () => !!process.env.RESEND_API_KEY;

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";
const FROM = "EClub Indonesia <noreply@eclub.co.id>";
const idr = (n: number) => "Rp" + n.toLocaleString("id-ID");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) console.error("sendEmail", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("sendEmail", e);
    return false;
  }
}

function layout(title: string, preheader: string, body: string, cta?: { href: string; label: string }) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f6f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2b1d1a;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ec;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(60,20,15,0.08);">
<tr><td style="background:#8B2220;padding:28px 32px;">
<img src="${SITE()}/api/brand/logo?v=dark" alt="EClub" height="44" style="display:block;height:44px;width:auto;border:0;color:#ffffff;font-size:24px;font-weight:800;">
<span style="display:block;margin-top:4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e8c98a;">Personal Growth Companion</span>
</td></tr>
<tr><td style="padding:32px 32px 8px;">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:700;color:#2b1d1a;">${esc(title)}</h1>
${body}
${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 28px;"><tr><td style="border-radius:12px;background:#8B2220;"><a href="${cta.href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${esc(cta.label)}</a></td></tr></table>` : ""}
</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #efe6df;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#9a8b85;">Salam bertumbuh,<br><b style="color:#2b1d1a;">Tim EClub Indonesia</b> &middot; <a href="${SITE()}" style="color:#8B2220;text-decoration:none;">www.eclub.co.id</a></p>
</td></tr></table>
<p style="margin:18px 0 0;font-size:11px;color:#9a8b85;">Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
</td></tr></table></body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4a3a35;">${html}</p>`;
const row = (k: string, v: string) => `<tr><td style="padding:8px 0;font-size:14px;color:#7a6a64;">${k}</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#2b1d1a;text-align:right;">${v}</td></tr>`;

/** Kirim email info pesanan. kind: created | paid | cancelled. Tidak pernah melempar error. */
export async function emailOrder(orderId: string, kind: "created" | "paid" | "cancelled") {
  try {
    const admin = createAdminClient();
    if (!admin || !emailConfigured()) return;
    const { data: o } = await admin.from("orders").select("id, user_id, title, amount, expires_at").eq("id", orderId).maybeSingle();
    if (!o) return;
    const [{ data: u }, { data: prof }] = await Promise.all([admin.auth.admin.getUserById(o.user_id), admin.from("profiles").select("full_name").eq("id", o.user_id).maybeSingle()]);
    const to = u?.user?.email;
    if (!to) return;
    const name = esc(((prof?.full_name as string) || "Sahabat").split(" ")[0]);
    const code = String(o.id).slice(0, 8).toUpperCase();
    const link = `${SITE()}/pesanan/${o.id}`;
    const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;padding:6px 16px;background:#faf6f1;border-radius:12px;">${row("Produk", esc(o.title))}${row("Kode pesanan", code)}${row("Total", idr(o.amount))}</table>`;
    let ok = false;
    if (kind === "created") {
      const until = new Date(o.expires_at).toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
      ok = await sendEmail(
        to,
        `Menunggu pembayaran: ${o.title} (${code})`,
        layout(
          "Pesanan Anda sudah dibuat",
          `Total bayar ${idr(o.amount)}. Selesaikan sebelum ${until} WIB.`,
          p(`Halo ${name}, terima kasih! Pesanan Anda sudah kami catat.`) +
            table +
            p(`Mohon bayar <b>persis ${idr(o.amount)}</b> (termasuk 3 angka terakhir) sebelum <b>${until} WIB</b>. Pilihan QRIS dan nomor rekening ada di halaman pembayaran. Setelah membayar, kirim bukti lewat tombol <b>Konfirmasi via WhatsApp</b>.`),
          { href: link, label: "Lihat cara bayar" },
        ),
      );
    } else if (kind === "paid") {
      ok = await sendEmail(
        to,
        `Pembayaran diterima: ${o.title}`,
        layout("Pembayaran diterima ✅", `${o.title} sudah aktif.`, p(`Halo ${name}, pembayaran Anda sudah kami terima dan aksesnya sudah aktif. Terima kasih sudah bertumbuh bersama EClub!`) + table, { href: `${SITE()}/dashboard`, label: "Buka EClub" }),
      );
    } else {
      ok = await sendEmail(
        to,
        `Pesanan dibatalkan: ${o.title}`,
        layout("Pesanan dibatalkan", `Pesanan ${code} dibatalkan.`, p(`Halo ${name}, pesanan berikut dibatalkan. Jika Anda sudah terlanjur membayar atau merasa ini keliru, hubungi admin EClub lewat WhatsApp.`) + table),
      );
    }
    await admin.from("notification_log").insert({ user_id: o.user_id, kind: `email_order_${kind}`, status: ok ? "sent" : "failed" });
  } catch (e) {
    console.error("emailOrder", e);
  }
}
