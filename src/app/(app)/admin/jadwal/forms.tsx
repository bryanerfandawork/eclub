"use client";

import { useActionState } from "react";
import { adminAddSlots, adminSaveEvent } from "@/app/actions/schedule";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";
import { useState } from "react";
import { PROVINCES, REGENCIES } from "@/lib/regions";

export function SlotForm() {
  const [state, action] = useActionState<FormState, FormData>(adminAddSlots, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="label">Tanggal</label>
        <input type="date" name="date" required className="input" />
      </div>
      <div className="sm:col-span-1 lg:col-span-2">
        <label className="label">Jam (WIB), pisahkan koma</label>
        <input name="times" required className="input" placeholder="10:00, 13:00, 19:30" />
      </div>
      <div>
        <label className="label">Durasi (menit)</label>
        <input name="duration" inputMode="numeric" defaultValue="60" className="input" />
      </div>
      <div>
        <label className="label">Mentor</label>
        <input name="mentor" className="input" placeholder="Nama mentor" />
      </div>
      <div>
        <label className="label">Topik</label>
        <input name="topic" className="input" defaultValue="Mentoring bisnis 1-on-1" />
      </div>
      <div>
        <label className="label">Harga umum (Rp)</label>
        <input name="price" inputMode="numeric" defaultValue="399000" className="input" />
      </div>
      <div>
        <label className="label">Harga member Plus (Rp)</label>
        <input name="plus_price" inputMode="numeric" defaultValue="299000" className="input" />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label">Link meeting (Zoom/Google Meet, opsional)</label>
        <input name="meet_link" className="input" placeholder="https://meet.google.com/..." />
      </div>
      <div className="flex items-end">
        <SubmitButton className="btn-primary w-full">Tambah slot</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function EventForm() {
  const [state, action] = useActionState<FormState, FormData>(adminSaveEvent, {});
  const [prov, setProv] = useState("");
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <label className="label">Judul</label>
        <input name="title" required className="input" placeholder="Webinar: Menemukan Spark" />
      </div>
      <div>
        <label className="label">Tanggal</label>
        <input type="date" name="date" required className="input" />
      </div>
      <div>
        <label className="label">Jam (WIB)</label>
        <input type="time" name="time" defaultValue="19:00" className="input" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <label className="label">Deskripsi</label>
        <textarea name="description" rows={2} className="input" />
      </div>
      <div>
        <label className="label">Pembicara</label>
        <input name="speaker" className="input" />
      </div>
      <div>
        <label className="label">Durasi (menit)</label>
        <input name="duration" inputMode="numeric" defaultValue="90" className="input" />
      </div>
      <div>
        <label className="label">Harga umum (Rp, 0 = gratis)</label>
        <input name="price" inputMode="numeric" defaultValue="0" className="input" />
      </div>
      <div>
        <label className="label">Harga member Plus (Rp)</label>
        <input name="plus_price" inputMode="numeric" defaultValue="0" className="input" />
      </div>
      <div>
        <label className="label">Kuota kursi (kosong = bebas)</label>
        <input name="capacity" inputMode="numeric" className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Link acara (Zoom/Meet)</label>
        <input name="meet_link" className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="label">Link rekaman (setelah acara)</label>
        <input name="recording_url" className="input" placeholder="https://youtube.com/..." />
      </div>
      <div>
        <label className="label">Provinsi (event offline)</label>
        <select value={prov} onChange={(e) => setProv(e.target.value)} className="input">
          <option value="">Online / semua kota</option>
          {PROVINCES.map(([c, n]) => (
            <option key={c} value={c}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Kota / kabupaten</label>
        <select name="regency" disabled={!prov} className="input disabled:opacity-50">
          <option value="">-</option>
          {REGENCIES.filter((r) => r[1] === prov).map(([c, , n]) => (
            <option key={c} value={c}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Lokasi / alamat</label>
        <input name="location" className="input" placeholder="Misal: Hotel X, Jl. Asia Afrika, Bandung" />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-4">
        <input type="checkbox" name="notify_city" className="h-4 w-4 accent-[#8b2220]" /> Kabari member yang tinggal di kota ini lewat WhatsApp setelah disimpan
      </label>
      <div className="sm:col-span-2 lg:col-span-4">
        <SubmitButton className="btn-primary">Simpan event</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
