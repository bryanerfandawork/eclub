import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { JoinForm } from "@/components/team/forms";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Undangan tim", robots: { index: false } };

type Info = { id: string; name: string; kind: string; owner_name: string | null; members: number };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = /^[a-z0-9]{6,20}$/.test(code) ? code : "";
  let info: Info | null = null;
  let loggedIn = false;
  if (!isDemoMode && clean) {
    const supabase = await createClient();
    const [{ data }, { data: auth }] = await Promise.all([supabase.rpc("ws_invite_info", { p_code: clean }), supabase.auth.getUser()]);
    info = ((data ?? []) as Info[])[0] ?? null;
    loggedIn = !!auth.user;
    if (info && auth.user) {
      const { data: m } = await supabase.from("workspace_members").select("status").eq("workspace_id", info.id).eq("user_id", auth.user.id).maybeSingle();
      if (m?.status === "active") redirect(`/tim/${info.id}`);
    }
  }
  const next = encodeURIComponent(`/gabung/${clean}`);
  return (
    <div className="min-h-dvh bg-paper px-5 py-8 lg:py-14">
      <div className="mx-auto max-w-md">
        <Logo />
        <div className="card mt-8 p-6 lg:p-8">
          {!info ? (
            <>
              <h1 className="text-xl font-bold text-heading">Link undangan tidak berlaku</h1>
              <p className="mt-2 text-sm text-muted">Mungkin link sudah diganti atau ruang kerjanya diarsipkan. Minta link baru ke pemilik tim.</p>
              <Link href="/" className="btn-ghost mt-5 w-full">
                Kenali EClub
              </Link>
            </>
          ) : (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-brand">
                <Users className="h-6 w-6" />
              </span>
              <p className="eyebrow mt-4">Undangan {info.kind === "project" ? "project" : "tim"}</p>
              <h1 className="mt-1 text-2xl font-bold text-heading">{info.name}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {info.owner_name ? <b className="text-heading">{info.owner_name}</b> : "Pemilik tim"} mengajak Anda bergabung ({info.members} orang sudah di dalam). Tugas dari tim akan muncul langsung di Laporan Harian Anda, dan Anda bisa berdiskusi di setiap tugas.
              </p>
              <div className="mt-6">
                {loggedIn ? (
                  <JoinForm code={clean} />
                ) : (
                  <div className="space-y-2">
                    <Link href={`/daftar?next=${next}`} className="btn-primary w-full py-3">
                      Daftar gratis & gabung
                    </Link>
                    <Link href={`/masuk?next=${next}`} className="btn-ghost w-full">
                      Sudah punya akun? Masuk
                    </Link>
                  </div>
                )}
              </div>
              <p className="mt-5 text-xs text-muted">Akun gratis sudah cukup untuk bergabung. Pemilik tim hanya melihat tugas tim, bukan data pribadi Anda.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
