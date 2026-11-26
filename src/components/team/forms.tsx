"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Send, UserPlus } from "lucide-react";
import { addComment, addGoal, addItem, postMessage, addSection, addTask, createWorkspace, inviteByUsername, joinByCode, saveTaskResult, setUsername, updateTask, updateWorkspace } from "@/app/actions/team";
import { rupiah } from "@/lib/format";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

type Opt = { id: string; name: string };
type Person = { id: string; name: string; pending?: boolean };

function DreamSelect({ dreams, value }: { dreams: Opt[]; value?: string | null }) {
  return (
    <label className="block">
      <span className="label">Pekerjaan ini mendukung mimpi apa?</span>
      <select name="dream_id" defaultValue={value ?? ""} className="input">
        <option value="">Tidak dikaitkan ke mimpi (tidak apa-apa)</option>
        {dreams.map((d) => (
          <option key={d.id} value={d.id}>
            ✨ {d.name}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs text-muted">Hanya Anda yang melihat mimpi ini, bukan anggota tim.</span>
    </label>
  );
}

/** Tahapan/area, penanggung jawab, target, berulang & tanda penting, dipakai di form tambah & ubah tugas. */
function TaskFields({
  people,
  sections,
  goals,
  me,
  d,
  fixedSection,
  level = "Tahapan",
}: {
  people: Person[];
  sections: Opt[] | null;
  goals: Opt[];
  me?: string;
  d?: { assignee_id: string | null; section_id?: string | null; goal_id?: string | null; important?: boolean; repeat?: string | null };
  /** Form di dalam kartu tahapan/area: sudah pasti. */
  fixedSection?: string;
  /** "Tahapan" (project) atau "Area kerja" (perusahaan). */
  level?: string;
}) {
  return (
    <>
      {fixedSection && <input type="hidden" name="section_id" value={fixedSection} />}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Dikerjakan oleh *</span>
          <select name="assignee" className="input text-sm" required defaultValue={d ? (d.assignee_id ?? "") : (people.find((p) => p.id !== me)?.id ?? me ?? "")}>
            {d && !d.assignee_id && (
              <option value="" disabled>
                Pilih orang
              </option>
            )}
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.id === me ? " (saya)" : ""}
                {p.pending ? " · belum menerima undangan" : ""}
              </option>
            ))}
          </select>
        </label>
        {sections !== null && !fixedSection && (
          <label className="block">
            <span className="text-xs text-muted">{level} *</span>
            <select name="section_id" className="input text-sm" required defaultValue={d?.section_id ?? ""}>
              <option value="" disabled>
                Pilih {level.toLowerCase()}
              </option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {sections !== null && (
        <div className="flex flex-wrap items-center gap-3">
          {goals.length > 0 && (
            <select name="goal_id" className="input max-w-xs flex-1 text-sm" defaultValue={d?.goal_id ?? ""}>
              <option value="">Target: tidak dikaitkan</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name}
                </option>
              ))}
            </select>
          )}
          <select name="repeat" className="input w-auto text-sm" defaultValue={d?.repeat ?? ""} aria-label="Berulang">
            <option value="">Sekali saja</option>
            <option value="daily">🔁 Setiap hari</option>
            <option value="weekly">🔁 Setiap minggu</option>
            <option value="monthly">🔁 Setiap bulan</option>
          </select>
          <input type="hidden" name="important_field" value="1" />
          <label className="flex items-center gap-2 text-sm font-semibold text-heading">
            <input type="checkbox" name="important" defaultChecked={d?.important} className="h-4 w-4 accent-[#8B2220]" /> Penting
          </label>
        </div>
      )}
    </>
  );
}

/** Reset form setelah berhasil. */
function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) ref.current?.reset();
  }, [state]);
  return ref;
}

export function CreateWorkspaceForm({ dreams }: { dreams: Opt[] }) {
  const [state, action] = useActionState<FormState, FormData>(createWorkspace, undefined);
  const [kind, setKind] = useState<"company" | "project">("company");
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["company", "🏢 Perusahaan", "Jangka panjang, mis. usaha Anda"],
            ["project", "🎯 Project", "Ada tanggal selesai, mis. event"],
          ] as const
        ).map(([k, t, d]) => (
          <label key={k} className={`cursor-pointer rounded-xl border p-3 text-sm ${kind === k ? "border-brand bg-brand/5" : "border-line"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            <b className="block text-heading">{t}</b>
            <span className="text-xs text-muted">{d}</span>
          </label>
        ))}
      </div>
      <input name="name" className="input" placeholder={kind === "project" ? "Nama project, mis. Bazar Ramadan 2027" : "Nama perusahaan, mis. Katering Bu Ani"} maxLength={60} required />
      {kind === "project" && (
        <label className="block">
          <span className="label">Tanggal selesai (boleh dikosongkan)</span>
          <input type="date" name="end_date" className="input" />
        </label>
      )}
      <textarea name="description" rows={2} className="input text-sm" placeholder="Keterangan singkat (opsional)" maxLength={300} />
      <DreamSelect dreams={dreams} />
      <SubmitButton className="btn-primary w-full">Buat ruang kerja</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function WorkspaceSettingsForm({ id, name, kind, end, description, dreams, dreamId }: { id: string; name: string; kind: "company" | "project"; end: string | null; description: string | null; dreams: Opt[]; dreamId: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(updateWorkspace, undefined);
  const [k, setK] = useState(kind);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="label">Nama</span>
        <input name="name" defaultValue={name} className="input" maxLength={60} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Jenis</span>
          <select name="kind" value={k} onChange={(e) => setK(e.target.value as "company" | "project")} className="input">
            <option value="company">Perusahaan (jangka panjang)</option>
            <option value="project">Project (ada tanggal selesai)</option>
          </select>
        </label>
        {k === "project" && (
          <label className="block">
            <span className="label">Tanggal selesai</span>
            <input type="date" name="end_date" defaultValue={end ?? ""} className="input" />
          </label>
        )}
      </div>
      <label className="block">
        <span className="label">Keterangan</span>
        <textarea name="description" rows={2} defaultValue={description ?? ""} className="input text-sm" maxLength={300} />
      </label>
      <DreamSelect dreams={dreams} value={dreamId} />
      <SubmitButton>Simpan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function InviteForm({ ws }: { ws: string }) {
  const [state, action] = useActionState<FormState, FormData>(inviteByUsername, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="ws" value={ws} />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">@</span>
          <input name="username" className="input pl-7" placeholder="username EClub" autoCapitalize="none" autoCorrect="off" maxLength={30} required />
        </div>
        <SubmitButton className="btn-primary shrink-0" pendingText="">
          <UserPlus className="h-4 w-4" /> Undang
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function AddTaskForm({
  ws,
  people,
  me,
  today,
  sections,
  goals,
  section,
  collapsed = false,
  level,
}: {
  ws: string;
  people: Person[];
  me: string;
  today: string;
  sections: Opt[] | null;
  goals: Opt[];
  /** Tahapan / area tempat tugas ini ditambahkan. */
  section?: string;
  /** Tampil sebagai tombol "+ Tambah tugas" dulu. */
  collapsed?: boolean;
  level?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(addTask, undefined);
  const ref = useResetOnSuccess(state);
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState(!collapsed);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-dashed border-line py-2.5 text-sm font-semibold text-muted hover:border-gold hover:text-heading">
        + Tambah tugas
      </button>
    );
  return (
    <form ref={ref} action={action} className="mt-3 space-y-2 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="ws" value={ws} />
      <input name="title" className="input" placeholder="Tugas, mis. Mendaftarkan NIB / Press pin order 50 pcs" maxLength={160} required autoFocus={collapsed} />
      <TaskFields people={people} sections={sections} goals={goals} me={me} fixedSection={section} level={level} />
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-muted">Mulai dikerjakan</span>
          <input type="date" name="plan_date" defaultValue={today} min={today} className="input text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Deadline *</span>
          <input type="date" name="due_date" min={today} className="input text-sm" required />
        </label>
      </div>
      {more ? (
        <textarea name="description" rows={3} className="input text-sm" placeholder="Detail tugas (opsional)" maxLength={2000} />
      ) : (
        <button type="button" onClick={() => setMore(true)} className="text-xs font-semibold text-brand">
          + Tambah detail
        </button>
      )}
      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">Tambah tugas</SubmitButton>
        {collapsed && (
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
            Tutup
          </button>
        )}
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function EditTaskForm({
  ws,
  task,
  people,
  sections,
  goals,
  level,
}: {
  ws: string;
  task: { id: string; title: string; description: string | null; assignee_id: string | null; plan_date: string; due_date: string | null; section_id?: string | null; goal_id?: string | null; important?: boolean; repeat?: string | null };
  people: Person[];
  sections: Opt[] | null;
  goals: Opt[];
  level?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateTask, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ws" value={ws} />
      <input type="hidden" name="id" value={task.id} />
      <label className="block">
        <span className="label">Judul</span>
        <input name="title" defaultValue={task.title} className="input" maxLength={160} required />
      </label>
      <label className="block">
        <span className="label">Detail</span>
        <textarea name="description" rows={3} defaultValue={task.description ?? ""} className="input text-sm" maxLength={2000} />
      </label>
      <TaskFields people={people} sections={sections} goals={goals} d={task} level={level} />
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-muted">Jadwal dikerjakan</span>
          <input type="date" name="plan_date" defaultValue={task.plan_date} className="input text-sm" required />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Deadline *</span>
          <input type="date" name="due_date" defaultValue={task.due_date ?? ""} className="input text-sm" required />
        </label>
      </div>
      <SubmitButton>Simpan perubahan</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function CommentForm({ ws, task }: { ws: string; task: string }) {
  const [state, action] = useActionState<FormState, FormData>(addComment, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="ws" value={ws} />
      <input type="hidden" name="task" value={task} />
      <div className="flex items-end gap-2">
        <textarea name="body" rows={2} className="input text-sm" placeholder="Tulis komentar, pertanyaan, atau kabar progres…" maxLength={1000} required />
        <SubmitButton className="btn-primary shrink-0 px-3" pendingText="">
          <Send className="h-4 w-4" />
          <span className="sr-only">Kirim</span>
        </SubmitButton>
      </div>
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}

export function JoinForm({ code }: { code: string }) {
  const [state, action] = useActionState<FormState, FormData>(joinByCode, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="code" value={code} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Bergabung…">
        Terima undangan & gabung
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function UsernameForm({ current }: { current: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(setUsername, undefined);
  return (
    <form action={action} id="username" className="card mt-5 scroll-mt-24 space-y-3 p-5 lg:p-7">
      <div>
        <h2 className="font-bold text-heading">Username EClub</h2>
        <p className="mt-0.5 text-xs text-muted">Dipakai teman untuk mengundang Anda ke ruang kerja tim. Huruf kecil, angka, titik, atau garis bawah.</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">@</span>
          <input name="username" defaultValue={current ?? ""} className="input pl-7" autoCapitalize="none" autoCorrect="off" minLength={3} maxLength={20} pattern="[a-zA-Z0-9_.]{3,20}" required />
        </div>
        <SubmitButton className="btn-primary shrink-0">Simpan</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

const TAHAPAN_IDEAS = {
  project: ["Persiapan", "Melengkapi dokumen", "Pelaksanaan", "Promosi", "Laporan & evaluasi"],
  company: ["Pengerjaan orderan", "Promosi & konten", "Pengadaan bahan", "Pengiriman", "Administrasi & keuangan", "Rutin harian"],
} as const;

/** Tambah tahapan (project) atau area kerja (perusahaan). Bisa ketuk contoh, atau tulis beberapa sekaligus dipisah koma. */
export function SectionForm({ ws, existing, kind }: { ws: string; existing: string[]; kind: "company" | "project" }) {
  const [state, action] = useActionState<FormState, FormData>(addSection, undefined);
  const ref = useResetOnSuccess(state);
  const [val, setVal] = useState("");
  useEffect(() => {
    if (state?.message) setVal("");
  }, [state]);
  const ideas = TAHAPAN_IDEAS[kind].filter((i) => !existing.some((e) => e.toLowerCase() === i.toLowerCase()));
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="ws" value={ws} />
      <div className="flex gap-2">
        <input name="name" value={val} onChange={(e) => setVal(e.target.value)} className="input" placeholder={kind === "project" ? "Tahapan, mis. Melengkapi dokumen" : "Area kerja, mis. Pengerjaan orderan"} maxLength={200} required />
        <SubmitButton className="btn-primary shrink-0" pendingText="">
          Tambah
        </SubmitButton>
      </div>
      {ideas.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">Contoh:</span>
          {ideas.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setVal((v) => (v.split(",").map((x) => x.trim()).includes(i) ? v : v.trim() ? `${v.replace(/,\s*$/, "")}, ${i}` : i))}
              className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-heading hover:border-gold"
            >
              + {i}
            </button>
          ))}
        </div>
      )}
      <FormMessage state={state} />
    </form>
  );
}

export function GoalForm({ ws }: { ws: string }) {
  const [state, action] = useActionState<FormState, FormData>(addGoal, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-2 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="ws" value={ws} />
      <input name="title" className="input" placeholder="Target, mis. Omzet Desember / 100 pelanggan baru" maxLength={120} required />
      <div className="grid grid-cols-3 gap-2">
        <input name="target" inputMode="decimal" className="input text-sm" placeholder="Angka target" />
        <input name="unit" className="input text-sm" placeholder="Satuan (Rp, pcs…)" maxLength={20} />
        <input type="date" name="due_date" className="input text-sm" aria-label="Batas waktu" />
      </div>
      <SubmitButton className="btn-primary w-full">Tambah target</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

type PocketOpt = { id: string; name: string; wallet: string };

/** Pemilik: setelah tugas selesai, ada hasil yang mau ditabung untuk mimpi? */
export function ResultForm({ ws, task, pockets, dreams, dreamId }: { ws: string; task: string; pockets: PocketOpt[]; dreams: Opt[]; dreamId: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveTaskResult, undefined);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  if (state?.message) return <p className="rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success">{state.message}</p>;
  if (!open)
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 py-2 text-sm">
          Ya, tabung untuk mimpi
        </button>
        <form action={action}>
          <input type="hidden" name="ws" value={ws} />
          <input type="hidden" name="id" value={task} />
          <input type="hidden" name="skip" value="1" />
          <SubmitButton className="btn-ghost px-4 py-2 text-sm" pendingText="…">
            Tidak, lewati
          </SubmitButton>
        </form>
      </div>
    );
  if (!pockets.length || !dreams.length)
    return <p className="text-sm text-muted">{!dreams.length ? "Tulis mimpi Anda dulu di My Dreams, lalu kembali ke sini." : "Buat kantong keuangan dulu di menu Keuangan."}</p>;
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="ws" value={ws} />
      <input type="hidden" name="id" value={task} />
      <label className="block">
        <span className="text-xs text-muted">Nominal yang ditabung</span>
        <input name="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} className="input" placeholder="mis. 500000" required />
        {Number(amount) > 0 && <span className="mt-0.5 block text-xs text-muted">{rupiah(Number(amount))}</span>}
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Disimpan di kantong / rekening</span>
          <select name="pocket_id" className="input text-sm" defaultValue={pockets[0].id}>
            {pockets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.wallet === "business" ? "🏪" : "🙂"} {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">Untuk mimpi</span>
          <select name="dream_id" className="input text-sm" defaultValue={dreamId ?? dreams[0].id}>
            {dreams.map((d) => (
              <option key={d.id} value={d.id}>
                ✨ {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" name="as_income" defaultChecked className="mt-0.5 h-4 w-4 accent-[#8B2220]" />
        <span>Catat juga sebagai uang masuk di kantong ini (hapus centang kalau uangnya sudah pernah dicatat).</span>
      </label>
      <div className="flex gap-2">
        <SubmitButton className="btn-primary flex-1">Simpan</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Batal
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

/** Tambah langkah checklist (boleh beberapa baris sekaligus). */
export function ItemForm({ ws, task }: { ws: string; task: string }) {
  const [state, action] = useActionState<FormState, FormData>(addItem, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="mt-2 space-y-1">
      <input type="hidden" name="ws" value={ws} />
      <input type="hidden" name="task" value={task} />
      <div className="flex gap-2">
        <input name="title" className="input h-10 text-sm" placeholder="+ Langkah kecil, mis. Siapkan KTP" maxLength={160} required />
        <SubmitButton className="btn-ghost shrink-0 px-3 text-sm" pendingText="">
          Tambah
        </SubmitButton>
      </div>
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}

export function MessageForm({ ws }: { ws: string }) {
  const [state, action] = useActionState<FormState, FormData>(postMessage, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="ws" value={ws} />
      <div className="flex items-end gap-2">
        <textarea name="body" rows={2} className="input text-sm" placeholder="Tulis pesan untuk seluruh tim…" maxLength={2000} required />
        <SubmitButton className="btn-primary shrink-0 px-3" pendingText="">
          <Send className="h-4 w-4" />
          <span className="sr-only">Kirim</span>
        </SubmitButton>
      </div>
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}
