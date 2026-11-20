export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getProfile } from "@/lib/data";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, account] = await Promise.all([getProfile(), getAccount()]);
  return (
    <AppShell name={profile.full_name || "Sahabat EClub"} email={profile.email} demo={isDemoMode} plan={account.plan} admin={isAdmin(account.role)}>
      {children}
    </AppShell>
  );
}
