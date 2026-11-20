export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getProfile } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <AppShell name={profile.full_name || "Sahabat EClub"} email={profile.email} demo={isDemoMode}>
      {children}
    </AppShell>
  );
}
