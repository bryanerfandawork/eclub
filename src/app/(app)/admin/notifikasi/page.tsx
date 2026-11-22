import { adminCancelBroadcast } from "@/app/actions/push";
import { getSettings } from "@/lib/plans";
import { motivationOfDay, MOTIVATIONS } from "@/lib/motivation";
import { todayJakarta } from "@/lib/format";
import { provinceName, regencyName } from "@/lib/regions";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { BroadcastForm, MorningForm, NudgeForm } from "./forms";
import { EVENING, pickLine } from "@/lib/nudges";

export const metadata = { title: "Admin · Notifikasi" };

type Bc = { id: string; title: string; body: string; audience: string; province: string | null; regency: string | null; send_on: string | null; replace_morning: boolean; status: string; sent_count: number; created_at: string };
const AUD: Record<string, string> = { all: "Semua", plus: "Plus", free: "Gratis" };

export default async function AdminPush() {
  const settings = await getSettings();
  let rows: Bc[] = [];
  let devices = 0;
  let failed = false;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("push_broadcasts").select("*").order("created_at", { ascending: false }).limit(50);
    failed = !!error;
    rows = (data ?? []) as Bc[];
    const { data: n } = await supabase.rpc("push_device_count");
    devices = Number(n) || 0;
  }
  const today = todayJakarta();
  const tomorrow = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return (
    <div className="space-y-5">
      {failed && <p className="card p-4 text-sm text-danger">Jalankan SQL tahap 16 dulu.</p>}
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Penyemangat pagi (notifikasi HP)</h2>
        <p className="mt-1 text-sm text-muted">
          Dikirim otomatis setiap hari pukul 07.00 WIB ke {devices} perangkat yang mengaktifkan notifikasi. Ada {MOTIVATIONS.length} kalimat, satu per hari, berulang setiap tahun.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="text-xs font-semibold text-muted">Hari ini</p>
            <p className="mt-1 text-ink">{motivationOfDay(today)}</p>
          </div>
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="text-xs font-semibold text-muted">Besok pagi</p>
            <p className="mt-1 text-ink">{motivationOfDay(tomorrow)}</p>
          </div>
        </div>
        <MorningForm on={settings.push_morning !== false && settings.push_morning !== "false"} title={String(settings.push_morning_title ?? "Selamat pagi dari EClub ☀️")} />
      </section>
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Pengingat malam (19.00 WIB)</h2>
        <p className="mt-1 text-sm text-muted">Dikirim otomatis setiap malam, jam orang biasanya santai memegang HP. Tiap orang maksimal 1 notifikasi malam, dan yang sudah mencentang aksi hari ini tidak diganggu. Ada {EVENING.length} kalimat yang bergilir setiap hari.</p>
        <div className="mt-3 rounded-xl bg-paper p-4 text-sm">
          <p className="text-xs font-semibold text-muted">Contoh malam ini</p>
          <p className="mt-1 font-semibold text-heading">{pickLine(EVENING, Math.floor((Date.now() + 7 * 3600_000) / 86_400_000))[0]}</p>
          <p className="text-ink">{pickLine(EVENING, Math.floor((Date.now() + 7 * 3600_000) / 86_400_000))[1]}</p>
        </div>
        <NudgeForm evening={settings.push_evening !== false && settings.push_evening !== "false"} winback={settings.push_winback !== false && settings.push_winback !== "false"} />
      </section>

      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Kirim notifikasi</h2>
        <p className="mt-1 text-sm text-muted">Untuk promo, event, atau pengumuman. Bisa langsung dikirim atau dijadwalkan untuk pagi tanggal tertentu.</p>
        <BroadcastForm />
      </section>

      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Riwayat & jadwal</h2>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Belum ada notifikasi.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-3 py-3">
                <span className="min-w-[220px] flex-1">
                  <b className="text-heading">{r.title}</b>
                  <span className="block text-ink">{r.body}</span>
                  <span className="block text-xs text-muted">
                    {AUD[r.audience]}
                    {r.regency ? ` · ${regencyName(r.regency)}` : r.province ? ` · ${provinceName(r.province)}` : ""}
                    {r.send_on ? ` · ${new Date(r.send_on + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                    {r.replace_morning ? " · ganti penyemangat pagi" : ""}
                  </span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status === "sent" ? "bg-success/10 text-success" : r.status === "scheduled" ? "bg-gold-soft text-brand" : "bg-paper text-muted"}`}>
                  {r.status === "sent" ? `Terkirim · ${r.sent_count}` : r.status === "scheduled" ? "Terjadwal" : "Dibatalkan"}
                </span>
                {r.status === "scheduled" && (
                  <form action={adminCancelBroadcast}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs font-medium text-danger hover:underline">Batalkan</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
