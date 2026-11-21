import Link from "next/link";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NewPasswordForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat kata sandi baru" };

export default async function SetPasswordPage() {
  let ok = isDemoMode;
  if (!isDemoMode) {
    const supabase = await createClient();
    ok = !!(await supabase.auth.getUser()).data.user;
  }
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] font-bold tracking-tight text-heading">Buat kata sandi baru</h1>
      {ok ? (
        <>
          <p className="mt-1.5 mb-8 text-muted">Minimal 8 karakter. Setelah disimpan, Anda langsung masuk.</p>
          <NewPasswordForm />
        </>
      ) : (
        <p className="mt-3 text-muted">
          Tautan sudah kedaluwarsa atau tidak valid.{" "}
          <Link href="/lupa-sandi" className="font-semibold text-heading hover:underline">
            Minta tautan baru
          </Link>
        </p>
      )}
    </div>
  );
}
