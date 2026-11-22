import Link from "next/link";
import { setEmailOptOut } from "@/app/actions/blast";
import { checkUnsubToken } from "@/lib/blast";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logo } from "@/components/logo";

export const metadata = { title: "Pengaturan email", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ u?: string; t?: string }> }) {
  const { u = "", t = "" } = await searchParams;
  const valid = /^[0-9a-f-]{36}$/.test(u) && t.length === 32 && checkUnsubToken(u, t);
  let out = false;
  if (valid) {
    const admin = createAdminClient();
    const { data } = admin ? await admin.from("profiles").select("email_opt_out").eq("id", u).maybeSingle() : { data: null };
    out = !!data?.email_opt_out;
  }
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        {!valid ? (
          <>
            <h1 className="mt-6 text-xl font-bold text-heading">Tautan tidak valid</h1>
            <p className="mt-2 text-sm text-muted">Gunakan tautan dari email terbaru Anda, atau hubungi admin EClub.</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-bold text-heading">{out ? "Anda sudah berhenti berlangganan" : "Berhenti menerima email promosi?"}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {out
                ? "Kami tidak akan mengirimi Anda email kabar dan promo lagi. Email penting soal akun dan pesanan tetap dikirim."
                : "Anda tidak akan lagi menerima email kabar dan promo dari EClub. Email penting soal akun dan pesanan tetap dikirim."}
            </p>
            <form action={setEmailOptOut} className="mt-6">
              <input type="hidden" name="u" value={u} />
              <input type="hidden" name="t" value={t} />
              <input type="hidden" name="out" value={out ? "0" : "1"} />
              <button className={out ? "btn-primary w-full" : "btn w-full border border-line bg-white text-heading hover:bg-paper"}>{out ? "Saya ingin menerima email lagi" : "Ya, berhenti berlangganan"}</button>
            </form>
          </>
        )}
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-brand">Ke beranda EClub</Link>
      </div>
    </main>
  );
}
