"use client";

import { useActionState, useState } from "react";
import { adminSendBroadcast } from "@/app/actions/push";
import { adminSaveNudgeSettings, adminSavePushSettings } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PROVINCES, REGENCIES } from "@/lib/regions";

export function MorningForm({ on, title }: { on: boolean; title: string }) {
  const [state, action] = useActionState(adminSavePushSettings, undefined);
  return (
    <form action={action} className="mt-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-heading">
        <input type="checkbox" name="push_morning" defaultChecked={on} className="h-4 w-4 accent-[#8b2220]" /> Kirim penyemangat pagi setiap hari
      </label>
      <div className="max-w-md">
        <label className="label" htmlFor="push_morning_title">Judul notifikasi</label>
        <input id="push_morning_title" name="push_morning_title" defaultValue={title} maxLength={60} className="input" />
      </div>
      <p className="text-xs text-muted">Jam kirim tetap 07.00 WIB (batas paket Vercel gratis: 1 jadwal per hari). Untuk mengganti pesan pagi pada tanggal tertentu, jadwalkan notifikasi di bawah dan centang &quot;ganti penyemangat pagi&quot;.</p>
      <FormMessage state={state} />
      <SubmitButton>Simpan</SubmitButton>
    </form>
  );
}

export function BroadcastForm() {
  const [state, action] = useActionState(adminSendBroadcast, undefined);
  const [when, setWhen] = useState("now");
  const [prov, setProv] = useState("");
  const minDate = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Judul</label>
          <input id="title" name="title" required maxLength={80} placeholder="Gathering Member Yogyakarta 🎉" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="url">Buka halaman saat diklik</label>
          <input id="url" name="url" defaultValue="/dashboard" placeholder="/event" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="body">Isi pesan</label>
        <textarea id="body" name="body" required maxLength={240} rows={2} placeholder="Tinggal 10 kursi lagi. Daftar sekarang sebelum kehabisan." className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="audience">Penerima</label>
          <select id="audience" name="audience" className="input">
            <option value="all">Semua member</option>
            <option value="plus">Member Plus</option>
            <option value="free">Member gratis</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prov">Provinsi (opsional)</label>
          <select id="prov" name="province" value={prov} onChange={(e) => setProv(e.target.value)} className="input">
            <option value="">Semua wilayah</option>
            {PROVINCES.map(([c, n]) => (
              <option key={c} value={c}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="regency">Kota/kabupaten</label>
          <select id="regency" name="regency" disabled={!prov} className="input disabled:opacity-50">
            <option value="">{prov ? "Semua di provinsi ini" : "Pilih provinsi dulu"}</option>
            {REGENCIES.filter((r) => r[1] === prov).map(([c, , n]) => (
              <option key={c} value={c}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" name="when" value="now" checked={when === "now"} onChange={() => setWhen("now")} className="accent-[#8b2220]" /> Kirim sekarang
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="when" value="schedule" checked={when === "schedule"} onChange={() => setWhen("schedule")} className="accent-[#8b2220]" /> Jadwalkan pagi tanggal
        </label>
        {when === "schedule" && <input type="date" name="send_on" min={minDate} required className="input w-auto py-2" />}
      </div>
      {when === "schedule" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="replace_morning" className="h-4 w-4 accent-[#8b2220]" /> Ganti penyemangat pagi hari itu dengan pesan ini (hanya bila penerimanya semua member)
        </label>
      )}
      <FormMessage state={state} />
      <SubmitButton pendingText="Mengirim…">{when === "now" ? "Kirim notifikasi" : "Jadwalkan"}</SubmitButton>
    </form>
  );
}

export function NudgeForm({ evening, winback }: { evening: boolean; winback: boolean }) {
  const [state, action] = useActionState(adminSaveNudgeSettings, undefined);
  return (
    <form action={action} className="mt-4 space-y-3">
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="push_evening" defaultChecked={evening} className="mt-0.5 h-4 w-4 accent-[#8b2220]" />
        <span>
          <b className="text-heading">Pengingat progres harian</b>
          <span className="block text-xs text-muted">Untuk member yang aktif 0-2 hari terakhir dan belum mencentang aksi hari ini.</span>
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="push_winback" defaultChecked={winback} className="mt-0.5 h-4 w-4 accent-[#8b2220]" />
        <span>
          <b className="text-heading">Ajak kembali member yang lama tidak membuka EClub</b>
          <span className="block text-xs text-muted">Dikirim di hari ke-3, 5, 7, 14, 21, 30, lalu tiap 30 hari sampai 6 bulan.</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton>Simpan</SubmitButton>
    </form>
  );
}
