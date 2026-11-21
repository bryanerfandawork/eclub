import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Certificate } from "@/components/certificate";
import { PrintButton } from "@/components/print-button";
import { getProfile } from "@/lib/data";
import { phaseName, SEF_STEPS } from "@/lib/sef";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sertifikat" };

export default async function CertPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const s = SEF_STEPS.find((x) => x.key === step);
  if (!s) notFound();
  let cert: { name: string; code: string; issued_at: string } | null = null;
  let error = "";
  if (isDemoMode) {
    const p = await getProfile();
    cert = { name: p.full_name ?? "Sahabat EClub", code: "EC-DEMO1234", issued_at: new Date().toISOString() };
  } else {
    const supabase = await createClient();
    const res = await supabase.rpc("claim_certificate", { p_step: step });
    if (res.error) error = res.error.message.includes("function") ? "Fitur sertifikat belum aktif." : res.error.message;
    else cert = res.data as { name: string; code: string; issued_at: string };
  }
  return (
    <>
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link href="/sertifikat" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Semua sertifikat
        </Link>
        {cert && <PrintButton />}
      </div>
      {cert ? (
        <>
          <Certificate
            name={cert.name}
            stepName={s.name}
            phase={phaseName(s.phase)}
            no={s.no}
            code={cert.code}
            issued={new Date(cert.issued_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}
          />
          <p className="mt-4 text-center text-xs text-muted print:hidden">Tip: saat mencetak, pilih orientasi “Landscape” lalu “Simpan sebagai PDF”. Nama mengikuti profil Anda saat sertifikat diterbitkan.</p>
        </>
      ) : (
        <div className="card p-6 text-center text-sm text-muted">{error}</div>
      )}
    </>
  );
}
