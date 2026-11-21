import { adminDeleteEvent, adminDeleteSlot, adminNotifyCity } from "@/app/actions/schedule";
import { regencyName } from "@/lib/regions";
import { rupiah } from "@/lib/format";
import { jam } from "@/lib/schedule";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { EventForm, SlotForm } from "./forms";

export const metadata = { title: "Admin · Jadwal" };

type AdminSlot = { id: string; mentor: string; topic: string; starts_at: string; duration_min: number; price: number; plus_price: number; meet_link: string | null; booking: { name: string | null; whatsapp: string | null; goal: string | null; status: string } | null };
type Ev = { id: string; title: string; starts_at: string; price: number; plus_price: number; capacity: number | null; regency: string | null };

export default async function AdminJadwal() {
  let slots: AdminSlot[] = [];
  let events: (Ev & { attendees: { name: string | null; whatsapp: string | null }[] })[] = [];
  let ready = true;
  if (!isDemoMode) {
    const supabase = await createClient();
    const res = await supabase.rpc("admin_mentoring");
    if (res.error) ready = false;
    else {
      slots = res.data as AdminSlot[];
      const { data } = await supabase.from("events").select("id, title, starts_at, price, plus_price, capacity, regency").order("starts_at", { ascending: false }).limit(20);
      events = await Promise.all(
        ((data ?? []) as Ev[]).map(async (e) => ({ ...e, attendees: ((await supabase.rpc("admin_event_attendees", { p_event: e.id })).data ?? []) as { name: string | null; whatsapp: string | null }[] })),
      );
    }
  }
  if (!ready) return <section className="card p-6 text-sm text-muted">Data jadwal belum bisa dimuat. Pastikan SQL tahap 9 (WhatsApp) dan tahap 13 sudah dijalankan.</section>;
  const upcoming = slots.filter((s) => new Date(s.starts_at) > new Date()).reverse();
  const past = slots.filter((s) => new Date(s.starts_at) <= new Date() && s.booking);

  return (
    <div className="space-y-5">
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Buka slot mentoring</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Tambahkan beberapa jam sekaligus untuk satu tanggal. Slot yang sudah dipesan otomatis hilang dari daftar member.</p>
        <SlotForm />
      </section>
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Slot mendatang ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Belum ada slot.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-sm">
            {upcoming.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="min-w-[220px] flex-1">
                  <b className="text-heading">{jam(s.starts_at)}</b> · {s.mentor} · {s.duration_min} mnt
                  <span className="block text-xs text-muted">
                    {rupiah(s.price)} / Plus {rupiah(s.plus_price)} {s.meet_link ? "· link ✓" : "· belum ada link"}
                  </span>
                  {s.booking && (
                    <span className="mt-1 block rounded-lg bg-success/10 px-2.5 py-1.5 text-xs text-success">
                      Dipesan: <b>{s.booking.name}</b>
                      {s.booking.whatsapp ? ` · WA ${s.booking.whatsapp}` : ""} — “{s.booking.goal}”
                    </span>
                  )}
                </span>
                {!s.booking && (
                  <form action={adminDeleteSlot}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-ghost py-1.5 text-xs">Hapus</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {past.length > 0 && <p className="mt-3 text-xs text-muted">{past.length} sesi sudah berlangsung dalam 60 hari terakhir.</p>}
      </section>
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Buat event / webinar</h2>
        <div className="mt-4">
          <EventForm />
        </div>
      </section>
      {events.length > 0 && (
        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Event</h2>
          <ul className="mt-2 divide-y divide-line text-sm">
            {events.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex-1">
                    <b className="text-heading">{e.title}</b>
                    <span className="block text-xs text-muted">
                      {jam(e.starts_at)} · {e.price ? rupiah(e.price) : "gratis"} · {e.attendees.length}
                      {e.capacity ? `/${e.capacity}` : ""} peserta{e.regency ? ` · 📍 ${regencyName(e.regency)}` : ""}
                    </span>
                  </span>
                  {e.regency && new Date(e.starts_at) > new Date() && (
                    <form action={adminNotifyCity}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="btn-ghost py-1.5 text-xs">Kabari kota via WA</button>
                    </form>
                  )}
                  <form action={adminDeleteEvent}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="btn-ghost py-1.5 text-xs">Hapus</button>
                  </form>
                </div>
                {e.attendees.length > 0 && (
                  <details className="mt-1 text-xs text-muted">
                    <summary className="cursor-pointer">Lihat peserta</summary>
                    <p className="mt-1">{e.attendees.map((a) => `${a.name ?? "Member"}${a.whatsapp ? ` (${a.whatsapp})` : ""}`).join(", ")}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
