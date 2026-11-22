import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { JoinCta } from "@/components/join-cta";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/supabase/config";
import { getEvents } from "@/lib/schedule";
import { regencyName } from "@/lib/regions";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event & Webinar EClub", description: "Gathering, workshop, dan webinar untuk pelaku usaha yang ingin bertumbuh." };

type Ev = { id: string; title: string; description: string | null; speaker: string | null; starts_at: string; duration_min: number; price: number; plus_price: number; capacity: number | null; regency?: string | null; location?: string | null };

const tgl = (iso: string) => new Date(iso).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function PublicEvents() {
  let events: Ev[] = [];
  if (isDemoMode) events = ((await getEvents()) ?? []) as Ev[];
  else {
    const admin = createAdminClient();
    // Hanya kolom aman untuk publik (tanpa link meeting / rekaman).
    const { data } = admin ? await admin.from("events").select("id, title, description, speaker, starts_at, duration_min, price, plus_price, capacity, regency, location").eq("published", true).gt("starts_at", new Date(Date.now() - 3 * 3600_000).toISOString()).order("starts_at") : { data: [] };
    events = (data ?? []) as Ev[];
  }
  return (
    <div className="pb-20 lg:pb-0">
      <p className="eyebrow">Event & webinar</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading lg:text-4xl">Belajar langsung, bertemu sesama pejuang usaha</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">Gathering, workshop, dan webinar bersama mentor EClub. Member Plus mendapat harga khusus.</p>
      <div className="mt-8 space-y-5">
        {events.length === 0 && <div className="card p-8 text-center text-sm text-muted">Jadwal event berikutnya segera diumumkan. Daftar gratis supaya dapat kabarnya lewat notifikasi.</div>}
        {events.map((e) => (
          <article key={e.id} className="card overflow-hidden lg:flex">
            <div className="bg-brand p-6 text-white lg:w-64 lg:shrink-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                <CalendarDays className="h-4 w-4" /> {tgl(e.starts_at)} WIB
              </p>
              <p className="mt-4 text-3xl font-bold">{e.price ? rupiah(e.price) : "Gratis"}</p>
              {e.price > 0 && <p className="text-sm text-white/75">Member Plus: {e.plus_price ? rupiah(e.plus_price) : "gratis"}</p>}
            </div>
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold text-heading">{e.title}</h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                {e.speaker && <span>Bersama {e.speaker}</span>}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {e.duration_min} menit
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {e.location || regencyName(e.regency) || "Online"}
                </span>
                {e.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {e.capacity} kursi
                  </span>
                )}
              </div>
              {e.description && <p className="mt-3 leading-relaxed whitespace-pre-line text-ink">{e.description}</p>}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <JoinCta next="/event" title="Daftar event dari akun EClub" desc="Buat akun gratis, lalu pilih event dan selesaikan pendaftaran. Anda langsung kembali ke halaman event." />
      </div>
      <JoinCta next="/event" title="Ikut event EClub" sticky />
    </div>
  );
}
