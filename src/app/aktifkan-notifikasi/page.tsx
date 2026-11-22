import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAssessmentResults, getProfile } from "@/lib/data";
import { PLACEMENT_KEY } from "@/lib/placement";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getVapidPublicKey } from "@/lib/push";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/actions/auth";
import { EnablePush } from "./enable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aktifkan penyemangat pagi" };

export default async function EnablePushPage() {
  const [profile, placed, vapid] = await Promise.all([getProfile(), getAssessmentResults(PLACEMENT_KEY, 1), isDemoMode ? null : getVapidPublicKey()]);
  const saved = (await cookies()).get("eclub_next")?.value;
  const next = saved && saved.startsWith("/") && !saved.startsWith("//") ? saved : "/dashboard";
  if (!isDemoMode) {
    const supabase = await createClient();
    const { count } = await supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", profile.id);
    if (count) redirect(next);
  }
  return (
    <div className="min-h-dvh bg-paper px-5 py-8 lg:py-14">
      <div className="mx-auto max-w-lg">
        <Logo />
        <p className="eyebrow mt-8">{placed.length ? "Satu langkah lagi" : "Langkah 2 dari 3"}</p>
        <h1 className="mt-2 text-2xl font-bold text-heading lg:text-3xl">Aktifkan penyemangat pagi ☀️</h1>
        <p className="mt-2 leading-relaxed text-muted">
          Setiap pukul 07.00 WIB, EClub mengirim satu kalimat penyemangat ke HP Anda, supaya mimpi Anda tidak terlupakan di tengah kesibukan. Notifikasi ini wajib diaktifkan sebelum memakai fitur EClub.
        </p>
        <EnablePush publicKey={vapid} next={next} />
        <form action={signOut} className="mt-6 text-center">
          <button className="text-xs text-muted hover:text-brand">Bukan akun Anda? Keluar</button>
        </form>
      </div>
    </div>
  );
}
