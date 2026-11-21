"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToSubs, subsFor } from "@/lib/push";
import { todayJakarta } from "@/lib/format";
import type { FormState } from "./auth";
import { getAccount, isAdmin } from "@/lib/plans";

type SubJson = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function savePushSubscription(sub: SubJson, userAgent: string): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode) return { ok: false, error: "Mode demo." };
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false, error: "Langganan tidak valid." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesi berakhir." };
  // Perangkat yang sama bisa berpindah akun: hapus dulu lewat service role lalu simpan untuk akun ini.
  const admin = createAdminClient();
  if (admin) await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint).neq("user_id", user.id);
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_agent: userAgent.slice(0, 200) }, { onConflict: "endpoint" });
  if (error) return { ok: false, error: "Gagal menyimpan. Pastikan SQL tahap 16 sudah dijalankan." };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/** Kirim notifikasi uji ke semua perangkat milik akun yang sedang login. */
export async function testPushToMe(): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode) return { ok: false, error: "Mode demo." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) return { ok: false, error: "Server belum siap." };
  const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", user.id);
  const n = await sendPushToSubs(admin, subs ?? [], { title: "Notifikasi EClub aktif ✅", body: "Mulai besok pagi, penyemangat harian akan muncul di sini.", url: "/dashboard", tag: "test" });
  return n ? { ok: true } : { ok: false, error: "Belum ada perangkat yang aktif." };
}

async function staffOrNull() {
  const account = await getAccount();
  return isAdmin(account.role) ? await createClient() : null;
}

export async function adminSendBroadcast(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: tidak bisa mengirim." };
  const supabase = await staffOrNull();
  const admin = createAdminClient();
  if (!supabase || !admin) return { error: "Hanya admin." };
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  const title = f("title").slice(0, 80);
  const body = f("body").slice(0, 240);
  const url = f("url").startsWith("/") ? f("url").slice(0, 200) : "/dashboard";
  const audience = (["all", "plus", "free"].includes(f("audience")) ? f("audience") : "all") as "all" | "plus" | "free";
  const province = /^\d{2}$/.test(f("province")) ? f("province") : null;
  const regency = province && /^\d{2}\.\d{2}$/.test(f("regency")) && f("regency").startsWith(province + ".") ? f("regency") : null;
  const when = f("when") === "schedule" ? f("send_on") : "";
  if (!title || !body) return { error: "Judul dan isi wajib diisi." };
  if (when && (!/^\d{4}-\d{2}-\d{2}$/.test(when) || when <= todayJakarta())) return { error: "Tanggal jadwal harus setelah hari ini." };
  const row = { title, body, url, audience, province, regency, send_on: when || null, replace_morning: formData.get("replace_morning") === "on" };
  if (when) {
    const { error } = await supabase.from("push_broadcasts").insert(row);
    if (error) return { error: "Gagal menyimpan. Pastikan SQL tahap 16 sudah dijalankan." };
    revalidatePath("/admin/notifikasi");
    return { message: `Dijadwalkan untuk pagi ${new Date(when + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" })} (07.00 WIB).` };
  }
  const subs = await subsFor(admin, audience, regency, province);
  const n = await sendPushToSubs(admin, subs, { title, body, url, tag: "broadcast" });
  await supabase.from("push_broadcasts").insert({ ...row, send_on: todayJakarta(), status: "sent", sent_count: n, sent_at: new Date().toISOString() });
  revalidatePath("/admin/notifikasi");
  return { message: `Terkirim ke ${n} perangkat.` };
}

export async function adminCancelBroadcast(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await staffOrNull();
  if (!supabase) return;
  await supabase.from("push_broadcasts").update({ status: "cancelled" }).eq("id", String(formData.get("id"))).eq("status", "scheduled");
  revalidatePath("/admin/notifikasi");
}

/** Perangkat tidak mendukung notifikasi atau izin diblokir: boleh lanjut, diingatkan lagi 30 hari kemudian. */
export async function skipPushStep(next: string) {
  (await cookies()).set("eclub_push_skip", "1", { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}
