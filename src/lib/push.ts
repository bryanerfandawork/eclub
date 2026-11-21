import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const SUBJECT = "mailto:eclubsukses@gmail.com";
let cached: { publicKey: string; privateKey: string } | null = null;

/** Kunci VAPID dibuat sekali lalu disimpan di tabel push_secrets (hanya bisa dibaca service role). */
export async function getVapid(admin?: SupabaseClient | null): Promise<{ publicKey: string; privateKey: string } | null> {
  if (cached) return cached;
  const db = admin ?? createAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("push_secrets").select("key, value").in("key", ["vapid_public", "vapid_private"]);
  if (error) return null;
  const pub = data?.find((r) => r.key === "vapid_public")?.value;
  const priv = data?.find((r) => r.key === "vapid_private")?.value;
  if (pub && priv) return (cached = { publicKey: pub, privateKey: priv });
  const keys = webpush.generateVAPIDKeys();
  // ignoreDuplicates: kalau dua permintaan bersamaan, yang pertama menang.
  await db.from("push_secrets").upsert([{ key: "vapid_public", value: keys.publicKey }, { key: "vapid_private", value: keys.privateKey }], { onConflict: "key", ignoreDuplicates: true });
  const { data: again } = await db.from("push_secrets").select("key, value").in("key", ["vapid_public", "vapid_private"]);
  const p2 = again?.find((r) => r.key === "vapid_public")?.value;
  const k2 = again?.find((r) => r.key === "vapid_private")?.value;
  return p2 && k2 ? (cached = { publicKey: p2, privateKey: k2 }) : null;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

/** Kirim ke banyak langganan sekaligus. Langganan yang sudah tidak berlaku dihapus. */
export async function sendPushToSubs(admin: SupabaseClient, subs: Sub[], payload: PushPayload): Promise<number> {
  const vapid = await getVapid(admin);
  if (!vapid || !subs.length) return 0;
  webpush.setVapidDetails(SUBJECT, vapid.publicKey, vapid.privateKey);
  const body = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/dashboard", tag: payload.tag });
  let ok = 0;
  const dead: string[] = [];
  for (let i = 0; i < subs.length; i += 50) {
    const chunk = subs.slice(i, i + 50);
    const res = await Promise.allSettled(chunk.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 6 * 3600, urgency: "normal" })));
    res.forEach((r, k) => {
      if (r.status === "fulfilled") ok++;
      else {
        const code = (r.reason as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(chunk[k].id);
      }
    });
  }
  if (dead.length) await admin.from("push_subscriptions").delete().in("id", dead);
  return ok;
}

/** Ambil langganan sesuai sasaran: semua, Plus, gratis, dan/atau kota tertentu. */
export async function subsFor(admin: SupabaseClient, audience: "all" | "plus" | "free", regency?: string | null, province?: string | null): Promise<Sub[]> {
  const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth, user_id").limit(20000);
  if (!subs?.length) return [];
  if (audience === "all" && !regency && !province) return subs;
  const ids = [...new Set(subs.map((s) => s.user_id))];
  const keep = new Set<string>();
  for (let i = 0; i < ids.length; i += 500) {
    let q = admin.from("profiles").select("id, plan, plan_expires_at, regency").in("id", ids.slice(i, i + 500));
    if (regency) q = q.eq("regency", regency);
    else if (province) q = q.eq("province", province);
    const { data } = await q;
    for (const p of data ?? []) {
      const plus = p.plan === "plus" && (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date());
      if (audience === "all" || (audience === "plus" && plus) || (audience === "free" && !plus)) keep.add(p.id);
    }
  }
  return subs.filter((s) => keep.has(s.user_id));
}

/** Kunci publik untuk browser (aman dibagikan). null bila server belum siap. */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    return (await getVapid())?.publicKey ?? null;
  } catch {
    return null;
  }
}
