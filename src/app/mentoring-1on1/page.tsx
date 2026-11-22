import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { JoinCta } from "@/components/join-cta";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/supabase/config";
import { getMentoring } from "@/lib/schedule";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mentoring 1-on-1 EClub", description: "Bawa satu masalah usaha, pulang dengan langkah konkret bersama mentor EClub." };

type S = { id: string; mentor: string; topic: string; starts_at: string; duration_min: number; price: number; plus_price: number };
const tgl = (iso: string) => new Date(iso).toLocaleString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function PublicMentoring() {
  let slots: S[] = [];
  if (isDemoMode) slots = (await getMentoring())?.slots ?? [];
  else {
    const admin = createAdminClient();
    const { data } = admin ? await admin.from("mentoring_slots").select("id, mentor, topic, starts_at, duration_min, price, plus_price").gt("starts_at", new Date().toISOString()).order("starts_at").limit(6) : { data: [] };
    slots = (data ?? []) as S[];
  }
  return (
    <div className="pb-20 lg:pb-0">
      <p className="eyebrow">Mentoring 1-on-1</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading lg:text-4xl">Bawa satu masalah usaha, pulang dengan langkah konkret</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">Sesi pribadi bersama mentor EClub lewat video call. Ceritakan tantangan Anda, kita susun langkah yang realistis untuk minggu depan.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="font-bold text-heading">Yang Anda dapat</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-ink">
            {["Diagnosa singkat: di mana posisi usaha Anda di peta SEF", "Fokus pada 1 masalah terpenting, bukan semuanya sekaligus", "Rencana aksi 7 hari yang bisa langsung dijalankan", "Rekomendasi kelas & alat EClub yang paling relevan"].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-heading">Jadwal terdekat</h2>
          {slots.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Jadwal baru segera dibuka.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-heading">{tgl(s.starts_at)} WIB</span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" /> {s.duration_min} menit · {s.mentor}
                    </span>
                  </span>
                  <span className="text-right text-xs">
                    <b className="block text-heading">{s.price ? rupiah(s.price) : "Gratis"}</b>
                    {s.price > 0 && <span className="text-muted">Plus {s.plus_price ? rupiah(s.plus_price) : "gratis"}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-8">
        <JoinCta next="/mentoring" title="Pesan jadwal mentoring" desc="Buat akun gratis, pilih jam yang cocok, dan ceritakan yang ingin dibahas." />
      </div>
      <JoinCta next="/mentoring" title="Pesan mentoring 1-on-1" sticky />
    </div>
  );
}
