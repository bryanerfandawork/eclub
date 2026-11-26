import "server-only";
import { after } from "next/server";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { sendPushToSubs } from "./push";

/**
 * Kirim pemberitahuan ke anggota tim: masuk ke lonceng di aplikasi (lewat fungsi database yang
 * memastikan penerima satu tim) + notifikasi HP. Pengirim tidak ikut menerima.
 */
export async function notifyTeam(ws: string, users: (string | null | undefined)[], me: string, title: string, body: string, url: string) {
  const ids = [...new Set(users.filter((u): u is string => !!u && u !== me))];
  if (!ids.length) return;
  const supabase = await createClient();
  const { data: n } = await supabase.rpc("ws_notify", { p_ws: ws, p_users: ids, p_title: title, p_body: body, p_url: url });
  if (!n) return;
  // Notifikasi HP dikirim setelah halaman selesai dimuat, supaya tombol tidak terasa lambat.
  after(async () => {
    const admin = createAdminClient();
    if (!admin) return;
    const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").in("user_id", ids);
    if (subs?.length) await sendPushToSubs(admin, subs, { title, body, url, tag: `tim-${ws}` }).catch(() => 0);
  });
}
