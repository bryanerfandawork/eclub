"use client";

import { useActionState, useState } from "react";
import { addHabit } from "@/app/actions/habits";
import { addWork } from "@/app/actions/works";
import { notifySaved } from "@/components/step-bar";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

type Dream = { id: string; title: string };

function DreamSelect({ dreams }: { dreams: Dream[] }) {
  if (!dreams.length) return null;
  return (
    <select name="dream_id" className="input text-sm" defaultValue={dreams.length === 1 ? dreams[0].id : ""}>
      <option value="">Mendukung mimpi… (opsional)</option>
      {dreams.map((d) => (
        <option key={d.id} value={d.id}>
          {d.title}
        </option>
      ))}
    </select>
  );
}

function Chips({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((n) => (
        <button key={n} type="button" onClick={() => onPick(n)} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium hover:border-gold">
          {n}
        </button>
      ))}
    </div>
  );
}

const WORK_IDEAS = ["Usaha / jualan", "Pekerjaan kantor", "Kuliah & tugas", "Latihan olahraga", "Konten media sosial", "Belajar skill baru", "Urusan rumah & keluarga", "Organisasi / komunitas"];

export function AddWork({ existing, dreams }: { existing: string[]; dreams: Dream[] }) {
  const [state, action] = useActionState<FormState, FormData>(addWork, {});
  const [name, setName] = useState("");
  const [open, setOpen] = useState(existing.length === 0);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-muted hover:border-gold hover:text-heading">
        + Tambah pekerjaan / aktivitas
      </button>
    );
  return (
    <form
      action={async (fd) => {
        await action(fd);
        notifySaved();
        setName("");
      }}
      className="mt-4 space-y-3 rounded-2xl bg-paper p-4"
    >
      <p className="text-xs font-medium text-muted">Contoh (ketuk untuk memakai):</p>
      <Chips items={WORK_IDEAS.filter((n) => !existing.includes(n))} onPick={setName} />
      <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Misal: Usaha katering, Latihan sepak bola" maxLength={60} />
      <DreamSelect dreams={dreams} />
      <SubmitButton className="btn-primary w-full" pendingText="Menyimpan…">
        Simpan pekerjaan
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

const HABIT_IDEAS: [string, string][] = [
  ["🙏", "Ibadah tepat waktu"],
  ["📖", "Baca 10 halaman"],
  ["🏃", "Olahraga 15 menit"],
  ["💧", "Minum 8 gelas air"],
  ["💰", "Catat keuangan"],
  ["📞", "Follow-up 5 pelanggan"],
  ["📱", "Posting konten jualan"],
  ["😴", "Tidur sebelum jam 11"],
];
const EMOJIS = ["✅", "🙏", "📖", "🏃", "💧", "💰", "📞", "📱", "😴", "🧘", "🥗", "✍️"];

export function AddHabit({ existing, dreams }: { existing: string[]; dreams: Dream[] }) {
  const [state, action] = useActionState<FormState, FormData>(addHabit, {});
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [open, setOpen] = useState(existing.length === 0);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-muted hover:border-gold hover:text-heading">
        + Tambah kebiasaan
      </button>
    );
  return (
    <form
      action={async (fd) => {
        await action(fd);
        notifySaved();
        setName("");
      }}
      className="mt-4 space-y-3 rounded-2xl bg-paper p-4"
    >
      <p className="text-xs font-medium text-muted">Ide cepat (ketuk untuk memakai):</p>
      <div className="flex flex-wrap gap-2">
        {HABIT_IDEAS.filter(([, n]) => !existing.includes(n)).map(([e, n]) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setEmoji(e);
              setName(n);
            }}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium hover:border-gold"
          >
            {e} {n}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select name="emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="input w-16 px-2 text-center text-lg">
          {EMOJIS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" placeholder="Kebiasaan baru" maxLength={60} />
      </div>
      <DreamSelect dreams={dreams} />
      <SubmitButton className="btn-primary w-full" pendingText="Menyimpan…">
        Simpan kebiasaan
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
