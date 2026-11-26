"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Send, UserPlus } from "lucide-react";
import { addComment, addTask, createWorkspace, inviteByUsername, joinByCode, setUsername, updateTask, updateWorkspace } from "@/app/actions/team";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

type Opt = { id: string; name: string };

/** Reset form setelah berhasil. */
function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) ref.current?.reset();
  }, [state]);
  return ref;
}

export function CreateWorkspaceForm() {
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
      <SubmitButton className="btn-primary w-full">Buat ruang kerja</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function WorkspaceSettingsForm({ id, name, kind, end, description }: { id: string; name: string; kind: "company" | "project"; end: string | null; description: string | null }) {
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

export function AddTaskForm({ ws, people, me, today }: { ws: string; people: Opt[]; me: string; today: string }) {
  const [state, action] = useActionState<FormState, FormData>(addTask, undefined);
  const ref = useResetOnSuccess(state);
  const [more, setMore] = useState(false);
  return (
    <form ref={ref} action={action} className="space-y-2 rounded-2xl bg-paper p-3.5">
      <input type="hidden" name="ws" value={ws} />
      <input name="title" className="input" placeholder="Tugas baru, mis. Kirim penawaran ke 5 klien" maxLength={160} required />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs text-muted">Dikerjakan oleh</span>
          <select name="assignee" className="input text-sm" defaultValue={people.find((p) => p.id !== me)?.id ?? me}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id === me ? `${p.name} (saya)` : p.name}
              </option>
            ))}
            <option value="">Belum ditentukan</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">Muncul di harian mulai</span>
          <input type="date" name="plan_date" defaultValue={today} min={today} className="input text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Tenggat (opsional)</span>
          <input type="date" name="due_date" min={today} className="input text-sm" />
        </label>
      </div>
      {more ? (
        <textarea name="description" rows={3} className="input text-sm" placeholder="Detail tugas (opsional)" maxLength={2000} />
      ) : (
        <button type="button" onClick={() => setMore(true)} className="text-xs font-semibold text-brand">
          + Tambah detail
        </button>
      )}
      <SubmitButton className="btn-primary w-full">Tambah tugas</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function EditTaskForm({
  ws,
  task,
  people,
}: {
  ws: string;
  task: { id: string; title: string; description: string | null; assignee_id: string | null; plan_date: string; due_date: string | null };
  people: Opt[];
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
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="label">Dikerjakan oleh</span>
          <select name="assignee" defaultValue={task.assignee_id ?? ""} className="input text-sm">
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="">Belum ditentukan</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Muncul di harian</span>
          <input type="date" name="plan_date" defaultValue={task.plan_date} className="input text-sm" required />
        </label>
        <label className="block">
          <span className="label">Tenggat</span>
          <input type="date" name="due_date" defaultValue={task.due_date ?? ""} className="input text-sm" />
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
