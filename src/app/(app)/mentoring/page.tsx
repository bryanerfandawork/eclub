import Link from "next/link";
import { CalendarClock, Crown, Video } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { getAccount } from "@/lib/plans";
import { getMentoring, hari, jam, type Slot } from "@/lib/schedule";
import { SlotPicker } from "./client";

export const metadata = { title: "Mentoring" };

export default async function MentoringPage() {
  const [acc, data] = await Promise.all([getAccount(), getMentoring()]);
  const plus = acc.plan === "plus";
  if (!data) return <div className="card p-6 text-sm text-muted">Fitur mentoring sedang disiapkan.</div>;

  const byDay = new Map<string, Slot[]>();
  for (const s of data.slots) byDay.set(hari(s.starts_at), [...(byDay.get(hari(s.starts_at)) ?? []), s]);
  const days = [...byDay.entries()].map(([day, slots]) => ({
    day,
    label: new Date(day + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
    slots: slots.map((s) => ({
      id: s.id,
      topic: s.topic,
      duration: s.duration_min,
      price: plus ? s.plus_price : s.price,
      time: new Date(s.starts_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }),
    })),
  }));
  const minNormal = Math.min(...data.slots.map((s) => s.price));
  const minPlus = Math.min(...data.slots.map((s) => s.plus_price));

  return (
    <>
      <PageHeader eyebrow="Mentoring 1-on-1" title="Ngobrol langsung dengan mentor" desc="Bawa satu masalah usaha yang paling mengganjal. Pulang dengan langkah konkret yang bisa dikerjakan minggu ini." />
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-5 lg:col-span-3">
          {data.mine.length > 0 && (
            <section className="card p-5">
              <h2 className="font-bold text-heading">Sesi saya</h2>
              <ul className="mt-3 space-y-3">
                {data.mine.map((b) => (
                  <li key={b.id} className="rounded-xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-heading">{b.topic} · {b.mentor}</p>
                        <p className="text-sm text-muted">{jam(b.starts_at)} · {b.duration_min} menit</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${b.status === "pending" ? "bg-gold-soft text-heading" : b.status === "done" ? "bg-paper text-muted" : "bg-success/10 text-success"}`}>
                        {b.status === "pending" ? "Menunggu bayar" : b.status === "done" ? "Selesai" : "Terkonfirmasi"}
                      </span>
                    </div>
                    {b.status === "pending" && b.order_id && (
                      <Link href={`/pesanan/${b.order_id}`} className="btn-gold mt-3 py-2">
                        Selesaikan pembayaran
                      </Link>
                    )}
                    {b.status === "confirmed" &&
                      (b.meet_link ? (
                        <a href={b.meet_link} target="_blank" rel="noopener" className="btn-primary mt-3 py-2">
                          <Video className="h-4 w-4" /> Masuk ruang meeting
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-muted">Link meeting akan dikirim lewat WhatsApp sebelum sesi.</p>
                      ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <CalendarClock className="h-5 w-5 text-brand" /> Pilih jadwal
            </h2>
            <div className="mt-4">
              {days.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">Jadwal baru segera dibuka. Cek lagi dalam beberapa hari, atau hubungi admin lewat WhatsApp.</p>
              ) : (
                <SlotPicker days={days} plus={plus} />
              )}
            </div>
          </section>
        </div>
        <aside className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
            <p className="text-xs font-semibold text-gold">Yang Anda dapat</p>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>✓ Sesi video call privat 45–60 menit</li>
              <li>✓ Dibahas sesuai posisi Anda di peta SEF</li>
              <li>✓ 3 langkah aksi tertulis setelah sesi</li>
              <li>✓ Pengingat jadwal lewat WhatsApp</li>
            </ul>
            {data.slots.length > 0 && (
              <div className="mt-5 border-t border-white/15 pt-4 text-sm">
                <p>
                  Mulai <b className="text-lg">{rupiah(plus ? minPlus : minNormal)}</b> per sesi
                </p>
                {!plus && minPlus < minNormal && <p className="mt-1 text-white/70">Member Plus mulai {minPlus > 0 ? rupiah(minPlus) : "gratis"}.</p>}
              </div>
            )}
          </section>
          {!plus && (
            <Link href="/beli/plus" className="card flex items-center gap-3 p-4 hover:border-gold">
              <Crown className="h-6 w-6 shrink-0 text-gold" />
              <span className="text-sm">
                <b className="block text-heading">Hemat dengan EClub Plus</b>
                <span className="text-muted">Harga mentoring khusus member, plus semua fitur premium.</span>
              </span>
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
