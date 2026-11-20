import { LogOut, Mail } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/ui";
import { getProfile } from "@/lib/data";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await getProfile();
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
          <form action={signOut} className="mt-6 border-t border-line pt-4">
            <button className="btn-ghost w-full">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </form>
        </aside>
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </>
  );
}
