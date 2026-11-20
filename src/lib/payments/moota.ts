import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingPayment, PaymentProvider } from "./types";

/**
 * Moota mengirim webhook berisi daftar mutasi rekening.
 * Keaslian dicek dengan header "Signature" = HMAC-SHA256(body mentah, secret webhook).
 */
export const moota: PaymentProvider = {
  name: "moota",
  verify(rawBody, headers) {
    const secret = process.env.MOOTA_WEBHOOK_SECRET;
    const sig = headers.get("signature") ?? headers.get("x-moota-signature");
    if (!secret || !sig) return false;
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(sig.trim().toLowerCase());
    return a.length === b.length && timingSafeEqual(a, b);
  },
  parse(rawBody) {
    let data: unknown;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return [];
    }
    const list = Array.isArray(data) ? data : Array.isArray((data as { data?: unknown })?.data) ? (data as { data: unknown[] }).data : [data];
    const out: IncomingPayment[] = [];
    for (const m of list as Record<string, unknown>[]) {
      if (!m || typeof m !== "object") continue;
      const type = String(m.type ?? "CR").toUpperCase();
      if (type !== "CR") continue; // hanya uang masuk
      const amount = Math.round(Number(String(m.amount ?? "").replace(/[^\d.]/g, "")));
      const ref = String(m.mutation_id ?? m.id ?? `${m.bank_id ?? ""}-${m.date ?? m.created_at ?? ""}-${amount}`);
      if (amount > 0 && ref) out.push({ ref, amount, raw: m });
    }
    return out;
  },
};
