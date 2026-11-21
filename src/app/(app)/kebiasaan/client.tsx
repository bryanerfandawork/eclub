"use client";

import { useActionState, useState } from "react";
import { addHabit, saveGratitude } from "@/app/actions/habits";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

const IDEAS = [
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

export function AddHabit({ existing }: { existing: string[] }) {
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
        setName("");
      }}
      className="mt-4 space-y-3 rounded-2xl bg-paper p-4"
    >
      <p className="text-xs font-medium text-muted">Ide cepat (ketuk untuk memakai):</p>
      <div className="flex flex-wrap gap-2">
        {IDEAS.filter(([, n]) => !existing.includes(n)).map(([e, n]) => (
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
        <SubmitButton className="btn-primary shrink-0" pendingText="…">
          Tambah
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

const MOODS = ["😞", "😕", "😐", "🙂", "😄"];

export function GratitudeForm({ items, mood }: { items: string[]; mood: number | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveGratitude, {});
  const [m, setM] = useState(mood ?? 0);
  return (
    <form action={action} className="space-y-3">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Bagaimana perasaan Anda hari ini?</p>
        <input type="hidden" name="mood" value={m || ""} />
        <div className="flex gap-2">
          {MOODS.map((e, i) => (
            <button key={e} type="button" onClick={() => setM(i + 1)} className={`grid h-11 w-11 place-items-center rounded-full text-2xl transition ${m === i + 1 ? "scale-110 bg-gold-soft ring-2 ring-gold" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm font-medium text-ink">Hari ini saya bersyukur atas…</p>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-bold text-gold">{i}.</span>
          <input name={`item${i}`} defaultValue={items[i - 1] ?? ""} maxLength={200} className="input" placeholder={i === 1 ? "Misal: ada pelanggan baru yang puas" : i === 2 ? "Misal: keluarga sehat" : "Hal kecil pun berarti"} />
        </div>
      ))}
      <SubmitButton className="btn-primary w-full">{items.length ? "Perbarui jurnal hari ini" : "Simpan jurnal"}</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
