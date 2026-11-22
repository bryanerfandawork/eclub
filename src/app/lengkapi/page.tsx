import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAssessmentResults, getProfile } from "@/lib/data";
import { PLACEMENT_KEY } from "@/lib/placement";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./form";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lengkapi data diri" };

export default async function OnboardingPage() {
  const [profile, placed] = await Promise.all([
    getProfile(),
    getAssessmentResults(PLACEMENT_KEY, 1),
  ]);
  const saved = (await cookies()).get("eclub_next")?.value;
  const next = saved && saved.startsWith("/") && !saved.startsWith("//") ? saved : placed.length ? "/dashboard" : "/posisi";
  let init = { whatsapp: "", birth_date: "", province: "", regency: "" };
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("whatsapp, birth_date, province, regency")
      .eq("id", profile.id)
      .maybeSingle();
    if (data) {
      if (data.whatsapp && data.birth_date && data.regency) redirect(next);
      init = {
        whatsapp: data.whatsapp ?? "",
        birth_date: data.birth_date ?? "",
        province: data.province ?? "",
        regency: data.regency ?? "",
      };
    }
  }
  const firstName = (profile.full_name || "").split(" ")[0];
  return (
    <div className="min-h-dvh bg-paper px-5 py-8 lg:py-14">
      <div className="mx-auto max-w-lg">
        <Logo />
        <div className="mt-8" />
        <p className="eyebrow">
          {placed.length ? "Data diri" : "Langkah 1 dari 3"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading lg:text-3xl">
          Selamat datang{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p className="mt-2 leading-relaxed text-muted">
          Dalam persiapan menyusun masa depan Anda, silakan isi data di bawah
          ini.
        </p>
        <OnboardingForm init={init} next={next} />
        <form action={signOut} className="mt-4 text-center">
          <button className="text-xs text-muted hover:text-brand">Bukan akun Anda? Keluar</button>
        </form>
      </div>
    </div>
  );
}
