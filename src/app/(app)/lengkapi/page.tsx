import { redirect } from "next/navigation";
import { getAssessmentResults, getProfile } from "@/lib/data";
import { PLACEMENT_KEY } from "@/lib/placement";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./form";

export const metadata = { title: "Lengkapi data diri" };

export default async function OnboardingPage() {
  const [profile, placed] = await Promise.all([getProfile(), getAssessmentResults(PLACEMENT_KEY, 1)]);
  const next = placed.length ? "/dashboard" : "/posisi";
  let init = { whatsapp: "", birth_date: "", province: "", regency: "" };
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("whatsapp, birth_date, province, regency").eq("id", profile.id).maybeSingle();
    if (data) {
      if (data.whatsapp && data.birth_date && data.regency) redirect(next);
      init = { whatsapp: data.whatsapp ?? "", birth_date: data.birth_date ?? "", province: data.province ?? "", regency: data.regency ?? "" };
    }
  }
  const firstName = (profile.full_name || "").split(" ")[0];
  return (
    <div className="mx-auto max-w-lg py-4 lg:py-10">
      <p className="eyebrow">{placed.length ? "Data diri" : "Langkah 1 dari 2"}</p>
      <h1 className="mt-2 text-2xl font-bold text-heading lg:text-3xl">Selamat datang{firstName ? `, ${firstName}` : ""}! 👋</h1>
      <p className="mt-2 leading-relaxed text-muted">
        Lengkapi data singkat ini sekali saja. Kami pakai untuk mengirim pengingat dan hadiah ulang tahun lewat WhatsApp, serta kabar event EClub di kota Anda.
      </p>
      <OnboardingForm init={init} next={next} />
    </div>
  );
}
