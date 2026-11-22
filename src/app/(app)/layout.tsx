export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getProfile } from "@/lib/data";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { aiConfigured } from "@/lib/ai";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, account] = await Promise.all([getProfile(), getAccount()]);
  // Catat "terakhir aktif" (dibatasi tiap 10 menit di database). Abaikan bila SQL 018 belum dijalankan.
  if (!isDemoMode) await (await createClient()).rpc("touch_last_seen").then(() => null, () => null);
  // Data diri wajib (WA, tanggal lahir, domisili) sebelum memakai fitur apa pun. Admin dikecualikan.
  if (!isDemoMode && !isAdmin(account.role)) {
    const supabase = await createClient();
    const { data: b } = await supabase.from("profiles").select("whatsapp, birth_date, regency").eq("id", profile.id).maybeSingle();
    if (b && (!b.whatsapp || !b.birth_date || !b.regency)) redirect("/lengkapi");
    // Notifikasi HP wajib diaktifkan, kecuali perangkat tidak mendukung / izin diblokir (cookie dari halaman aktivasi).
    if (b && !(await cookies()).get("eclub_push_skip")) {
      const { count, error } = await supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", profile.id);
      if (!error && !count) redirect("/aktifkan-notifikasi");
    }
  }
  return (
    <AppShell name={profile.full_name || "Sahabat EClub"} email={profile.email} demo={isDemoMode} plan={account.plan} admin={isAdmin(account.role)} ai={isDemoMode || aiConfigured()}>
      {children}
    </AppShell>
  );
}
