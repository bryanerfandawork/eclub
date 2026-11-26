export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getProfile } from "@/lib/data";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { aiConfigured } from "@/lib/ai";
import { getMe } from "@/lib/me";
import { getTeamState } from "@/lib/team";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, account, team] = await Promise.all([getProfile(), getAccount(), getTeamState()]);
  if (!isDemoMode) {
    const supabase = await createClient();
    const b = (await getMe()).row;
    const checkPush = !isAdmin(account.role) && !!b && !(await cookies()).get("eclub_push_skip");
    // Semua dijalankan bersamaan supaya halaman cepat terbuka.
    const [, push] = await Promise.all([
      // Catat "terakhir aktif" (dibatasi tiap 10 menit di database). Abaikan bila SQL 018 belum dijalankan.
      supabase.rpc("touch_last_seen").then(() => null, () => null),
      checkPush ? supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", profile.id) : Promise.resolve(null),
    ]);
    // Data diri wajib (WA, tanggal lahir, domisili) sebelum memakai fitur apa pun. Admin dikecualikan.
    if (!isAdmin(account.role) && b && (!b.whatsapp || !b.birth_date || !b.regency)) redirect("/lengkapi");
    // Notifikasi HP wajib diaktifkan, kecuali perangkat tidak mendukung / izin diblokir (cookie dari halaman aktivasi).
    if (push && !push.error && !push.count) redirect("/aktifkan-notifikasi");
  }
  return (
    <AppShell name={profile.full_name || "Sahabat EClub"} email={profile.email} demo={isDemoMode} plan={account.plan} admin={isAdmin(account.role)} ai={isDemoMode || aiConfigured()} team={team.ready && (team.workspaces + team.invites > 0 || account.plan === "plus" || isAdmin(account.role))} simple={team.simple} unread={team.unread}>
      {children}
    </AppShell>
  );
}
