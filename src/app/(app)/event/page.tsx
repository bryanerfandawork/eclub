import Link from "next/link";
import { CalendarDays, PlayCircle, Users, Video } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ShareEarn } from "@/components/share-earn";
import { rupiah } from "@/lib/format";
import { getAccount } from "@/lib/plans";
import { getEvents, jam } from "@/lib/schedule";
import { RegisterButton } from "../mentoring/client";
import { regencyName } from "@/lib/regions";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Event & Webinar" };

export default async function EventPage() {
  const [acc, events] = await Promise.all([getAccount(), getEvents()]);
  const plus = acc.plan === "plus";
  let myCity: string | null = null;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const { data: p } = await supabase.from("profiles").select("regency").eq("id", u.user?.id ?? "").maybeSingle();
    myCity = (p?.regency as string | null) ?? null;
  }
  if (!events) return <div className="card p-6 text-sm text-muted">Fitur event sedang disiapkan.</div>;
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() + e.duration_min * 60_000 > now).reverse();
  const past = events.filter((e) => new Date(e.starts_at).getTime() + e.duration_min * 60_000 <= now);

  return (
    <>
      <PageHeader eyebrow="Event & webinar" title="Belajar bareng, live" desc="Sesi langsung bersama mentor dan sesama pelaku usaha. Daftar sekali klik, pengingat dikirim lewat WhatsApp." />
      {upcoming.length > 0 && (
        <div className="mb-4 flex justify-end">
          <ShareEarn path="/acara" text={`Ada event EClub: *${upcoming[0].title}*. Yuk ikut bareng!`} />
        </div>
      )}
      {upcoming.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">Belum ada event terjadwal. Event berikutnya akan diumumkan di sini dan lewat WhatsApp.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {upcoming.map((e) => {
            const price = plus ? e.plus_price : e.price;
            const full = e.capacity !== null && e.seats >= e.capacity && !e.registered;
            const live = new Date(e.starts_at).getTime() <= now;
            return (
              <section key={e.id} className="card flex flex-col overflow-hidden">
                <div className="relative bg-brand p-5 text-white">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <CalendarDays className="h-3.5 w-3.5" /> {jam(e.starts_at)}
                    {live && <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand">LIVE</span>}
                  </p>
                  <h2 className="mt-2 text-lg leading-snug font-bold">{e.title}</h2>
                  {e.speaker && <p className="mt-1 text-sm text-white/70">Bersama {e.speaker}</p>}
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                    {e.regency ? `📍 ${e.location ? `${e.location}, ` : ""}${regencyName(e.regency)}` : "💻 Online"}
                    {e.regency && e.regency === myCity && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-brand-deep">DI KOTA ANDA</span>}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {e.description && <p className="text-sm whitespace-pre-line text-muted">{e.description}</p>}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Users className="h-4 w-4" /> {e.seats} terdaftar{e.capacity ? ` · sisa ${Math.max(0, e.capacity - e.seats)} kursi` : ""}
                    </span>
                    <b className="text-heading">
                      {price > 0 ? rupiah(price) : "Gratis"}
                      {!plus && e.plus_price < e.price && <span className="ml-1 text-xs font-normal text-muted">(Plus: {e.plus_price > 0 ? rupiah(e.plus_price) : "gratis"})</span>}
                    </b>
                  </div>
                  <div className="mt-auto pt-4">
                    {e.registered ? (
                      e.meet_link ? (
                        <a href={e.meet_link} target="_blank" rel="noopener" className="btn-primary w-full">
                          <Video className="h-4 w-4" /> Masuk ruang acara
                        </a>
                      ) : (
                        <p className="rounded-xl bg-success/10 p-3 text-center text-sm font-semibold text-success">✓ Anda terdaftar. Link dikirim sebelum acara.</p>
                      )
                    ) : full ? (
                      <p className="rounded-xl bg-paper p-3 text-center text-sm text-muted">Kursi penuh</p>
                    ) : (
                      <RegisterButton id={e.id} label={price > 0 ? `Daftar · ${rupiah(price)}` : "Daftar gratis"} />
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {past.length > 0 && (
        <section className="card mt-6 p-5">
          <h3 className="font-bold text-heading">Rekaman event sebelumnya</h3>
          <ul className="mt-2 divide-y divide-line">
            {past.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="flex-1">
                  <b className="block text-heading">{e.title}</b>
                  <span className="text-xs text-muted">{jam(e.starts_at)}</span>
                </span>
                {e.recording_url ? (
                  <a href={e.recording_url} target="_blank" rel="noopener" className="btn-ghost py-1.5">
                    <PlayCircle className="h-4 w-4" /> Tonton
                  </a>
                ) : plus ? (
                  <span className="text-xs text-muted">Rekaman belum tersedia</span>
                ) : (
                  <Link href="/beli/plus" className="text-xs font-semibold text-brand">
                    Rekaman untuk member Plus
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
