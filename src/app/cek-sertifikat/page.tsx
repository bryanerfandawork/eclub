import Link from "next/link";
import { BadgeCheck, SearchX } from "lucide-react";
import { Logo } from "@/components/logo";
import { SEF_STEPS, phaseName } from "@/lib/sef";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Cek Keaslian Sertifikat" };

export default async function CekSertifikat({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const { kode = "" } = await searchParams;
  let result: { name: string; step: string; issued_at: string } | null = null;
  if (kode && !isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("verify_certificate", { p_code: kode });
    result = ((data as { name: string; step: string; issued_at: string }[]) ?? [])[0] ?? null;
  }
  const s = result ? SEF_STEPS.find((x) => x.key === result!.step) : null;
  return (
    <main className="mx-auto min-h-dvh max-w-lg px-5 py-10">
      <Link href="/">
        <Logo />
      </Link>
      <h1 className="mt-8 text-2xl font-bold text-heading">Cek keaslian sertifikat</h1>
      <p className="mt-1 text-sm text-muted">Masukkan nomor sertifikat EClub (contoh: EC-1A2B3C4D).</p>
      <form className="mt-5 flex gap-2">
        <input name="kode" defaultValue={kode} required className="input flex-1 uppercase" placeholder="EC-XXXXXXXX" />
        <button className="btn-primary">Cek</button>
      </form>
      {kode &&
        (result && s ? (
          <div className="card mt-6 flex gap-3 border-success/40 p-5">
            <BadgeCheck className="h-7 w-7 shrink-0 text-success" />
            <div className="text-sm">
              <p className="font-bold text-success">Sertifikat asli</p>
              <p className="mt-1 text-ink">
                Diterbitkan untuk <b>{result.name}</b> atas penyelesaian Langkah {s.no}: {s.name} (fase {phaseName(s.phase)}) pada{" "}
                {new Date(result.issued_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.
              </p>
            </div>
          </div>
        ) : (
          <div className="card mt-6 flex gap-3 p-5">
            <SearchX className="h-7 w-7 shrink-0 text-danger" />
            <p className="text-sm text-ink">Nomor sertifikat tidak ditemukan. Periksa kembali penulisannya.</p>
          </div>
        ))}
    </main>
  );
}
