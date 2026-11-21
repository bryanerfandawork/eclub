import Link from "next/link";
import { Crown, LogOut, Mail, ShieldCheck } from "lucide-react";
import { PlanBadge } from "@/components/plan-badge";
import { getAccount, isAdmin } from "@/lib/plans";
import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/ui";
import { getProfile } from "@/lib/data";
import { ProfileForm } from "./profile-form";
import { BioForm, type Bio } from "./bio-form";
import { WhatsAppForm, type WaSettings } from "./whatsapp-form";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [profile, account] = await Promise.all([getProfile(), getAccount()]);
  let wa: WaSettings = { whatsapp: null, wa_opt_in: false, wa_daily: true };
  let bio: Bio = { birth_date: null, province: null, regency: null };
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("whatsapp, wa_opt_in, wa_daily").eq("id", profile.id).maybeSingle();
    if (data) wa = data as WaSettings;
    const { data: b } = await supabase.from("profiles").select("birth_date, province, regency").eq("id", profile.id).maybeSingle();
    if (b) bio = b as Bio;
  }
  const initials = (profile.full_name || "E")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <>
      <PageHeader eyebrow="Profile & Settings" title="Profil saya" />
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <aside className="card h-fit p-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-soft text-2xl font-bold text-heading">{initials}</div>
          <p className="mt-4 text-lg font-bold text-heading">{profile.full_name || "Sahabat EClub"}</p>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm text-muted">
            <Mail className="h-3.5 w-3.5" /> {profile.email}
          </p>
          {profile.segment && (
            <span className="mt-3 inline-block rounded-full bg-paper px-3 py-1 text-xs font-semibold text-heading">{profile.segment}</span>
          )}
          <div className="mt-4 flex justify-center">
            <PlanBadge plan={account.plan} />
          </div>
          <div className="mt-5 space-y-2 border-t border-line pt-4">
            <Link href="/paket" className="btn-ghost w-full">
              <Crown className="h-4 w-4 text-gold" /> {account.plan === "plus" ? "Paket saya" : "Upgrade ke Plus"}
            </Link>
            {isAdmin(account.role) && (
              <Link href="/admin" className="btn-ghost w-full">
                <ShieldCheck className="h-4 w-4 text-brand" /> Panel Admin
              </Link>
            )}
          </div>
          <form action={signOut} className="mt-2">
            <button className="btn-ghost w-full">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </form>
        </aside>
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} />
          <WhatsAppForm s={wa} />
          <BioForm bio={bio} />
        </div>
      </div>
    </>
  );
}
