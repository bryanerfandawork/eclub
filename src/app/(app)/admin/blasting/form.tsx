"use client";

import { useActionState, useMemo, useState } from "react";
import { Mail, MessageCircle, Send, Users } from "lucide-react";
import { previewBlast, sendBlast, testBlast } from "@/app/actions/blast";
import { FormMessage } from "@/components/ui";
import { PROVINCES, REGENCIES } from "@/lib/regions";
import type { BlastFilters, BlastOptions, Tri } from "@/lib/blast";

function TriPick({ value, onChange }: { value: Tri; onChange: (v: Tri) => void }) {
  const opts: [Tri, string][] = [
    ["", "Semua"],
    ["yes", "Sudah"],
    ["no", "Belum"],
  ];
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-line bg-white p-0.5">
      {opts.map(([v, l]) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${value === v ? (v === "no" ? "bg-heading text-white" : "bg-brand text-white") : "text-muted hover:text-heading"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="min-w-0 text-sm text-ink">
        {label}
        {hint && <span className="ml-1.5 text-xs text-muted">{hint}</span>}
      </p>
      {children}
    </div>
  );
}

export function BlastForm({ options }: { options: BlastOptions }) {
  const [channel, setChannel] = useState<"email" | "whatsapp">("whatsapp");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [f, setF] = useState<BlastFilters>({ tests: {}, features: {}, plan: "" });
  const [preview, previewAction, previewing] = useActionState(previewBlast, undefined);
  const [test, testAction, testing] = useActionState(testBlast, undefined);
  const [sent, sendAction, sending] = useActionState(sendBlast, undefined);
  const set = (patch: Partial<BlastFilters>) => setF((x) => ({ ...x, ...patch }));
  const num = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.min(120, Number(v) || 0)));
  const filtersJson = useMemo(() => JSON.stringify(f), [f]);
  const active = useMemo(
    () =>
      [f.plan, f.ageMin, f.ageMax, f.province, f.joinedDays, f.inactiveDays, f.courseAny, f.courseId && f.courseStatus, ...Object.values(f.tests ?? {}), ...Object.values(f.features ?? {})].filter((v) => v !== undefined && v !== null && v !== "").length,
    [f],
  );

  return (
    <form className="mt-5 space-y-5">
      <input type="hidden" name="channel" value={channel} />
      <input type="hidden" name="filters" value={filtersJson} />

      <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
        {(
          [
            ["whatsapp", "WhatsApp", MessageCircle],
            ["email", "Email", Mail],
          ] as const
        ).map(([v, l, Icon]) => (
          <button key={v} type="button" onClick={() => setChannel(v)} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${channel === v ? "border-brand bg-brand text-white" : "border-line bg-white text-heading hover:bg-paper"}`}>
            <Icon className="h-4 w-4" /> {l}
          </button>
        ))}
      </div>

      {channel === "email" && (
        <div>
          <label className="label" htmlFor="subject">Judul email</label>
          <input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="{nama}, kelas Personal Mapping sudah menunggu Anda" className="input" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="message">Isi pesan</label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder={"Halo {nama}! 👋\n\nAda kabar baik untuk Anda...\n\nCek di https://www.eclub.co.id/learn"}
          className="input resize-y"
        />
        <p className="mt-1 text-xs text-muted">
          Tulis <b>{"{nama}"}</b> untuk memanggil nama depan penerima. {channel === "whatsapp" ? "Untuk huruf tebal pakai *teks*." : "Baris kosong membuat paragraf baru, tautan otomatis bisa diklik."}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-paper/60 p-4 lg:p-5">
        <p className="flex items-center gap-2 font-bold text-heading">
          <Users className="h-4 w-4 text-gold" /> Target penerima {active > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] text-white">{active} filter</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted">Kosongkan semua untuk mengirim ke semua member. Semua filter yang dipilih harus terpenuhi sekaligus.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Paket</label>
            <select value={f.plan} onChange={(e) => set({ plan: e.target.value as BlastFilters["plan"] })} className="input">
              <option value="">Semua paket</option>
              <option value="plus">Member Plus</option>
              <option value="free">Member gratis</option>
            </select>
          </div>
          <div>
            <label className="label">Rentang usia</label>
            <div className="flex items-center gap-2">
              <input type="number" min={10} max={100} placeholder="Dari" value={f.ageMin ?? ""} onChange={(e) => set({ ageMin: num(e.target.value) })} className="input" />
              <span className="text-muted">-</span>
              <input type="number" min={10} max={100} placeholder="Sampai" value={f.ageMax ?? ""} onChange={(e) => set({ ageMax: num(e.target.value) })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Provinsi</label>
            <select value={f.province ?? ""} onChange={(e) => set({ province: e.target.value, regency: "" })} className="input">
              <option value="">Semua wilayah</option>
              {PROVINCES.map(([c, n]) => (
                <option key={c} value={c}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Kota/kabupaten</label>
            <select value={f.regency ?? ""} disabled={!f.province} onChange={(e) => set({ regency: e.target.value })} className="input disabled:opacity-50">
              <option value="">{f.province ? "Semua di provinsi ini" : "Pilih provinsi dulu"}</option>
              {REGENCIES.filter((r) => r[1] === f.province).map(([c, , n]) => (
                <option key={c} value={c}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mendaftar dalam ... hari terakhir</label>
            <input type="number" min={1} placeholder="Misal 7" value={f.joinedDays ?? ""} onChange={(e) => set({ joinedDays: num(e.target.value) })} className="input" />
          </div>
          <div>
            <label className="label">Tidak membuka EClub selama ... hari</label>
            <input type="number" min={1} placeholder="Misal 14" value={f.inactiveDays ?? ""} onChange={(e) => set({ inactiveDays: num(e.target.value) })} className="input" />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-wide text-muted uppercase">Tes</p>
            <div className="mt-1 divide-y divide-line">
              {options.tests.map((t) => (
                <Row key={t.key} label={t.label} hint={`${t.users} org`}>
                  <TriPick value={f.tests?.[t.key] ?? ""} onChange={(v) => set({ tests: { ...f.tests, [t.key]: v } })} />
                </Row>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold tracking-wide text-muted uppercase">Kelas</p>
            <div className="mt-1 divide-y divide-line">
              <Row label="Ikut kelas apa pun">
                <TriPick value={f.courseAny ?? ""} onChange={(v) => set({ courseAny: v })} />
              </Row>
              <div className="grid grid-cols-[1fr_auto] gap-2 py-2">
                <select value={f.courseId ?? ""} onChange={(e) => set({ courseId: e.target.value, courseStatus: e.target.value ? f.courseStatus || "started" : "" })} className="input py-2 text-sm">
                  <option value="">Kelas tertentu (opsional)</option>
                  {options.courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <select value={f.courseStatus ?? ""} disabled={!f.courseId} onChange={(e) => set({ courseStatus: e.target.value as BlastFilters["courseStatus"] })} className="input py-2 text-sm disabled:opacity-50">
                  <option value="started">Sudah mulai</option>
                  <option value="completed">Sudah selesai</option>
                  <option value="not">Belum ikut</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-muted uppercase">Pemakaian fitur</p>
            <div className="mt-1 max-h-[420px] divide-y divide-line overflow-y-auto pr-1">
              {options.features.map((x) => (
                <Row key={x.key} label={x.label} hint={x.key === "__pending_order" ? undefined : `${x.users} org`}>
                  <TriPick value={f.features?.[x.key] ?? ""} onChange={(v) => set({ features: { ...f.features, [x.key]: v } })} />
                </Row>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button formAction={previewAction} disabled={previewing} className="btn border border-line bg-white text-heading hover:bg-paper">
            <Users className="h-4 w-4" /> {previewing ? "Menghitung…" : "Hitung penerima"}
          </button>
          {preview?.count !== undefined && (
            <p className="text-sm">
              <b className="text-heading">{preview.count} orang</b>
              {preview.sample?.length ? <span className="text-muted"> · {preview.sample.join(", ")}{preview.count > preview.sample.length ? ", …" : ""}</span> : null}
            </p>
          )}
        </div>
        {preview?.error && <p className="mt-2 text-sm text-danger">{preview.error}</p>}
        {preview?.message && <p className="mt-2 text-xs text-muted">{preview.message}</p>}
      </div>

      {channel === "whatsapp" && (
        <p className="rounded-xl bg-gold-soft/60 p-3.5 text-xs leading-relaxed text-ink">
          <b>Agar nomor WA tidak diblokir:</b> pesan dikirim bertahap dengan jeda acak 8-20 detik, maksimal 300 orang sekali kirim, dan hanya ke member yang mengizinkan. Sebaiknya blasting WA paling sering 1-2 kali seminggu, pesannya personal (pakai {"{nama}"}), dan berguna bagi penerima.
        </p>
      )}

      <div className="space-y-3 border-t border-line pt-5">
        <FormMessage state={test} />
        <FormMessage state={sent} />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="confirm" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#8b2220]" /> Saya sudah memeriksa isi pesan dan target penerima. Blasting yang sudah terkirim tidak bisa ditarik.
        </label>
        <div className="flex flex-wrap gap-3">
          <button formAction={testAction} disabled={testing} className="btn border border-line bg-white text-heading hover:bg-paper">
            {testing ? "Mengirim…" : channel === "email" ? "Kirim uji ke email saya" : "Kirim uji ke WA admin"}
          </button>
          <button formAction={sendAction} disabled={sending} className="btn-primary">
            <Send className="h-4 w-4" /> {sending ? "Mengirim…" : "Kirim blasting"}
          </button>
        </div>
      </div>
    </form>
  );
}
