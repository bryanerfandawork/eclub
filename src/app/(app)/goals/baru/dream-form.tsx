"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { HelpCircle, Lightbulb } from "lucide-react";
import { createDream } from "@/app/actions/dreams";
import { MoneyInput } from "@/components/money-input";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { DREAM_CATEGORIES } from "@/lib/types";
import { monthsUntil, rupiah } from "@/lib/format";
import { HELP } from "@/lib/income";

export function DreamForm() {
  const [state, action] = useActionState(createDream, undefined);
  const [target, setTarget] = useState(0);
  const [saved, setSaved] = useState(0);
  const [date, setDate] = useState("");
  const months = monthsUntil(date || null);
  const perMonth = target && months ? Math.ceil(Math.max(0, target - saved) / months) : 0;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-5">
      <div className="card space-y-5 p-5 lg:col-span-3 lg:p-7">
        <div>
          <label className="label" htmlFor="title">Apa yang ingin Anda capai?</label>
          <input id="title" name="title" className="input" placeholder="Contoh: Membuka usaha katering sehat" maxLength={120} required />
        </div>
        <div>
          <span className="label">Kategori</span>
          <div className="flex flex-wrap gap-2">
            {DREAM_CATEGORIES.map((c, i) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
                <span className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
                  {c}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="why">Mengapa mimpi ini penting bagi Anda?</label>
          <textarea id="why" name="why" rows={3} className="input resize-none" placeholder="Alasan yang kuat membuat Anda tetap bergerak saat sulit." />
        </div>
        <div className="rounded-2xl border border-line bg-paper/60 p-4">
          <label className="label" htmlFor="target_amount">
            Kebutuhan dana <span className="font-normal text-danger">*</span>
          </label>
          <p className="-mt-1 mb-2 text-xs leading-relaxed text-muted">
            Total uang yang dibutuhkan agar mimpi ini terwujud. Tidak perlu persis, perkiraan dari harga saat ini sudah cukup.
          </p>
          <MoneyInput id="target_amount" name="target_amount" placeholder="Misal: 450.000.000" onValue={setTarget} required />
          <details className="group mt-2 text-xs leading-relaxed text-ink">
            <summary className="cursor-pointer list-none font-semibold text-brand [&::-webkit-details-marker]:hidden">
              <HelpCircle className="mr-1 inline h-3.5 w-3.5" /> Cara cepat menentukan angkanya
            </summary>
            <ul className="mt-2 space-y-1.5 pl-1">
              <li>🏠 <b>Barang / rumah / kendaraan:</b> cek harga sekarang di marketplace atau iklan properti, lalu ambil harga rata-rata 3 pilihan.</li>
              <li>🎓 <b>Biaya rutin (sekolah, umroh, liburan):</b> biaya per tahun × jumlah tahun. Misal kuliah Rp20 juta × 4 tahun = Rp80 juta.</li>
              <li>🏪 <b>Usaha:</b> modal awal (alat, tempat, stok) + biaya jalan 3 bulan pertama.</li>
              <li>📈 <b>Target lebih dari 2 tahun lagi:</b> tambahkan sekitar 5% per tahun untuk kenaikan harga.</li>
              <li>💭 <b>Mimpi tanpa uang</b> (misal lebih sabar): isi biaya pendukungnya, seperti buku, kelas, atau mentor.</li>
            </ul>
            <Link href={`/artikel/${HELP.dana.slug}`} target="_blank" className="mt-2 inline-flex items-center gap-1 font-semibold text-brand hover:underline">
              Baca panduan lengkap menentukan dana →
            </Link>
          </details>
          <div className="mt-4">
            <label className="label">Sudah terkumpul <span className="font-normal text-muted">(boleh 0)</span></label>
            <MoneyInput name="saved_amount" placeholder="0" onValue={setSaved} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="target_date">Target tercapai</label>
          <input id="target_date" name="target_date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="first_step">Langkah pertama minggu ini</label>
          <input id="first_step" name="first_step" className="input" placeholder="Contoh: Survei harga bahan baku di 3 pasar" maxLength={160} />
        </div>
        <FormMessage state={state} />
        <SubmitButton className="btn-primary w-full sm:w-auto">Simpan mimpi</SubmitButton>
      </div>

      <aside className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl bg-brand p-6 text-white shadow-lift lg:sticky lg:top-10">
          <p className="eyebrow">Kalkulator mimpi</p>
          <p className="mt-3 text-sm text-white/70">Perlu disisihkan setiap bulan</p>
          <p className="mt-1 text-3xl font-bold">{perMonth ? rupiah(perMonth) : "–"}</p>
          <p className="mt-3 text-xs leading-relaxed text-white/60">
            {perMonth
              ? `Selama ${months} bulan untuk mencapai ${rupiah(target)}.`
              : "Isi kebutuhan dana dan tanggal target untuk melihat perhitungannya."}
          </p>
          <div className="mt-5 flex gap-3 rounded-xl bg-white/8 p-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-gold" />
            <p className="text-xs leading-relaxed text-white/80">
              Tulis mimpi sejelas mungkin: apa, kapan, dan berapa. Mimpi yang spesifik lebih mudah dipecah menjadi langkah harian.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
