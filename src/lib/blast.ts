import "server-only";
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeWa } from "./whatsapp";

/**
 * Blasting (email + WhatsApp) untuk remarketing.
 *
 * Filter fitur dibuat otomatis: setiap tabel di database yang punya kolom user_id
 * (lihat SQL 018, admin_blast_features) langsung muncul sebagai pilihan "sudah / belum".
 * Tes baru, kelas baru, dan kota baru juga otomatis ikut. Untuk memberi nama yang enak dibaca
 * pada fitur baru, cukup tambah satu baris di FEATURE_LABELS (kalau tidak, nama tabel dipakai).
 */

export type Tri = "" | "yes" | "no";
export type Channel = "email" | "whatsapp";
export type BlastFilters = {
  ageMin?: number | null;
  ageMax?: number | null;
  province?: string;
  regency?: string;
  plan?: "" | "plus" | "free";
  joinedDays?: number | null;
  inactiveDays?: number | null;
  tests?: Record<string, Tri>;
  courseAny?: Tri;
  courseId?: string;
  courseStatus?: "" | "started" | "completed" | "not";
  features?: Record<string, Tri>;
};

export const FEATURE_LABELS: Record<string, string> = {
  fin_transactions: "Mencatat keuangan",
  fin_products: "Input produk / HPP",
  dreams: "Membuat impian (Dream Planner)",
  dream_actions: "Menyusun langkah aksi impian",
  daily_actions: "Memakai Daily Action",
  habits: "Membuat kebiasaan",
  habit_logs: "Mencentang kebiasaan",
  gratitude_entries: "Menulis jurnal syukur",
  life_plans: "Mengisi My Life",
  lesson_progress: "Belajar di Learning Center",
  assessment_results: "Mengerjakan tes apa pun",
  community_posts: "Posting di Komunitas",
  community_comments: "Komentar di Komunitas",
  community_likes: "Memberi semangat di Komunitas",
  mentoring_bookings: "Booking mentoring",
  event_registrations: "Daftar event",
  certificates: "Punya sertifikat SEF",
  orders: "Pernah membuat pesanan",
  report_unlocks: "Punya Laporan Lengkap DISC",
  course_entitlements: "Punya akses kelas berbayar",
  push_subscriptions: "Notifikasi HP aktif",
  ai_messages: "Memakai AI Companion",
  referrals: "Datang lewat ajakan teman",
  affiliate_commissions: "Pernah dapat komisi affiliate",
  affiliate_payouts: "Pernah menarik komisi",
  wheel_assessments: "Mengisi Wheel of Life (lama)",
  testimonials: "Memberi testimoni",
  collab_inquiries: "Mengirim form kolaborasi",
};
/** Filter khusus yang tidak berasal dari tabel. */
export const SPECIAL_FEATURES: Record<string, string> = { __pending_order: "Punya pesanan belum dibayar" };

export const TEST_LABELS: Record<string, string> = {
  "cek-posisi": "Cek Posisi",
  disc: "Tes DISC",
  "8-wheel-entrepreneur": "8 Wheel Entrepreneur",
};

export const featureLabel = (t: string) => FEATURE_LABELS[t] ?? SPECIAL_FEATURES[t] ?? t.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
export const testLabel = (k: string) => TEST_LABELS[k] ?? k.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export type BlastOptions = {
  features: { key: string; label: string; users: number }[];
  tests: { key: string; label: string; users: number }[];
  courses: { id: string; title: string }[];
};

/** Pilihan filter untuk halaman admin. `supabase` = klien sesi admin (RPC memeriksa is_staff). */
export async function loadBlastOptions(supabase: SupabaseClient): Promise<BlastOptions> {
  const [f, t, c] = await Promise.all([
    supabase.rpc("admin_blast_features"),
    supabase.rpc("admin_blast_tests"),
    supabase.from("courses").select("id, title, status").order("title"),
  ]);
  const features = ((f.data ?? []) as { table_name: string; users: number }[])
    .map((r) => ({ key: r.table_name, label: featureLabel(r.table_name), users: Number(r.users) || 0 }))
    .concat([{ key: "__pending_order", label: SPECIAL_FEATURES.__pending_order, users: 0 }])
    .sort((a, b) => a.label.localeCompare(b.label, "id"));
  const testCount = new Map<string, number>(Object.keys(TEST_LABELS).map((k) => [k, 0]));
  for (const r of (t.data ?? []) as { assessment_key: string }[]) testCount.set(r.assessment_key, (testCount.get(r.assessment_key) ?? 0) + 1);
  return {
    features,
    tests: [...testCount].map(([key, users]) => ({ key, label: testLabel(key), users })),
    courses: ((c.data ?? []) as { id: string; title: string; status: string }[]).map((x) => ({ id: x.id, title: x.title + (x.status === "published" ? "" : " (draft)") })),
  };
}

export type Recipient = { id: string; name: string; email: string | null; wa: string | null };

type Prof = { id: string; full_name: string | null; plan: string | null; plan_expires_at: string | null; birth_date: string | null; province: string | null; regency: string | null; whatsapp: string | null; wa_opt_in: boolean | null; email_opt_out: boolean | null; created_at: string };

async function allRows<T>(q: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await q(from, from + 999);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

function ageOf(birth: string, today: Date) {
  const b = new Date(birth + "T00:00:00Z");
  let a = today.getUTCFullYear() - b.getUTCFullYear();
  const m = today.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < b.getUTCDate())) a--;
  return a;
}

/**
 * Hitung penerima. `supabase` = klien sesi admin (untuk RPC), `admin` = service role (profil + email).
 * Hanya yang mengizinkan: WA butuh wa_opt_in, email tidak boleh email_opt_out.
 */
export async function resolveAudience(supabase: SupabaseClient, admin: SupabaseClient, f: BlastFilters, channel: Channel): Promise<Recipient[]> {
  const profiles = await allRows<Prof>((a, b) =>
    admin.from("profiles").select("id, full_name, plan, plan_expires_at, birth_date, province, regency, whatsapp, wa_opt_in, email_opt_out, created_at").range(a, b),
  );
  const users = new Map<string, { email: string | null; last: string | null }>();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) users.set(u.id, { email: u.email ?? null, last: u.last_sign_in_at ?? null });
    if (data.users.length < 1000) break;
  }

  const now = new Date();
  const todayJkt = new Date(now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) + "T00:00:00Z");
  const sets: { ids: Set<string>; want: boolean }[] = [];

  for (const [key, v] of Object.entries(f.features ?? {})) {
    if (!v) continue;
    let ids: string[];
    if (key === "__pending_order") {
      const rows = await allRows<{ user_id: string }>((a, b) => admin.from("orders").select("user_id").eq("status", "pending").gt("expires_at", now.toISOString()).range(a, b));
      ids = rows.map((r) => r.user_id);
    } else {
      const { data, error } = await supabase.rpc("admin_blast_feature_users", { p_table: key });
      if (error) throw error;
      ids = ((data ?? []) as unknown[]).map((x) => (typeof x === "string" ? x : (Object.values(x as object)[0] as string)));
    }
    sets.push({ ids: new Set(ids), want: v === "yes" });
  }

  const testEntries = Object.entries(f.tests ?? {}).filter(([, v]) => v);
  if (testEntries.length) {
    const { data, error } = await supabase.rpc("admin_blast_tests");
    if (error) throw error;
    const rows = (data ?? []) as { user_id: string; assessment_key: string }[];
    for (const [key, v] of testEntries) sets.push({ ids: new Set(rows.filter((r) => r.assessment_key === key).map((r) => r.user_id)), want: v === "yes" });
  }

  if (f.courseAny || (f.courseId && f.courseStatus)) {
    const { data, error } = await supabase.rpc("admin_blast_courses");
    if (error) throw error;
    const rows = (data ?? []) as { user_id: string; course_id: string; done: number; total: number }[];
    if (f.courseAny) sets.push({ ids: new Set(rows.map((r) => r.user_id)), want: f.courseAny === "yes" });
    if (f.courseId && f.courseStatus) {
      const inCourse = rows.filter((r) => r.course_id === f.courseId);
      if (f.courseStatus === "completed") sets.push({ ids: new Set(inCourse.filter((r) => r.total > 0 && r.done >= r.total).map((r) => r.user_id)), want: true });
      else sets.push({ ids: new Set(inCourse.map((r) => r.user_id)), want: f.courseStatus === "started" });
    }
  }

  const out: Recipient[] = [];
  for (const p of profiles) {
    const u = users.get(p.id);
    const plus = p.plan === "plus" && (!p.plan_expires_at || new Date(p.plan_expires_at) > now);
    if (f.plan === "plus" && !plus) continue;
    if (f.plan === "free" && plus) continue;
    if (f.ageMin != null || f.ageMax != null) {
      if (!p.birth_date) continue;
      const age = ageOf(p.birth_date, todayJkt);
      if (f.ageMin != null && age < f.ageMin) continue;
      if (f.ageMax != null && age > f.ageMax) continue;
    }
    if (f.province && p.province !== f.province) continue;
    if (f.regency && p.regency !== f.regency) continue;
    if (f.joinedDays && now.getTime() - new Date(p.created_at).getTime() > f.joinedDays * 86_400_000) continue;
    if (f.inactiveDays) {
      const last = u?.last ? new Date(u.last).getTime() : 0;
      if (now.getTime() - last < f.inactiveDays * 86_400_000) continue;
    }
    if (sets.some((s) => s.ids.has(p.id) !== s.want)) continue;
    const name = (p.full_name || "Sahabat").trim().split(/\s+/)[0];
    const wa = p.whatsapp ? normalizeWa(p.whatsapp) : null;
    const email = u?.email ?? null;
    if (channel === "whatsapp" && (!wa || !p.wa_opt_in)) continue;
    if (channel === "email" && (!email || p.email_opt_out)) continue;
    out.push({ id: p.id, name, email, wa });
  }
  return out;
}

/** Ringkasan filter dalam kalimat, untuk riwayat. */
export function describeFilters(f: BlastFilters, opts?: { courseTitle?: string; provinceName?: string | null; regencyName?: string | null }): string {
  const parts: string[] = [];
  if (f.plan) parts.push(f.plan === "plus" ? "Plus" : "Gratis");
  if (f.ageMin != null || f.ageMax != null) parts.push(`usia ${f.ageMin ?? "?"}-${f.ageMax ?? "?"}`);
  if (opts?.regencyName) parts.push(opts.regencyName);
  else if (opts?.provinceName) parts.push(opts.provinceName);
  if (f.joinedDays) parts.push(`daftar ≤${f.joinedDays} hari`);
  if (f.inactiveDays) parts.push(`tidak aktif ≥${f.inactiveDays} hari`);
  for (const [k, v] of Object.entries(f.tests ?? {})) if (v) parts.push(`${v === "yes" ? "sudah" : "belum"} ${testLabel(k)}`);
  if (f.courseAny) parts.push(f.courseAny === "yes" ? "sudah ikut kelas" : "belum ikut kelas");
  if (f.courseId && f.courseStatus) parts.push(`${{ started: "mulai", completed: "selesai", not: "belum ikut", "": "" }[f.courseStatus]} ${opts?.courseTitle ?? "kelas"}`);
  for (const [k, v] of Object.entries(f.features ?? {})) if (v) parts.push(`${v === "yes" ? "sudah" : "belum"}: ${featureLabel(k)}`);
  return parts.join(" · ") || "Semua member";
}

/** Token berhenti langganan email (tanpa login). */
export function unsubToken(userId: string) {
  return crypto.createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eclub").update("unsub:" + userId).digest("hex").slice(0, 32);
}
export function checkUnsubToken(userId: string, token: string) {
  const a = Buffer.from(unsubToken(userId));
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
