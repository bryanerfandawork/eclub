export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getProfile } from "@/lib/data";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, account] = await Promise.all([getProfile(), getAccount()]);
  // Data diri wajib (WA, tanggal lahir, domisili) sebelum memakai fitur apa pun. Admin dikecualikan.
  if (!isDemoMode && !isAdmin(account.role)) {
    const supabase = await createClient();
    const { data: b } = await supabase.from("profiles").select("whatsapp, birth_date, regency").eq("id", profile.id).maybeSingle();
    if (b && (!b.whatsapp || !b.birth_date || !b.regency)) redirect("/lengkapi");
  }
  return (
    <AppShell name={profile.full_name || "Sahabat EClub"} email={profile.email} demo={isDemoMode} plan={account.plan} admin={isAdmin(account.role)}>
      {children}
    </AppShell>
  );
}
