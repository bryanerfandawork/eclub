"use client";

import { useActionState, useEffect, useOptimistic, useRef, startTransition } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { addDaily, deleteDaily, toggleDaily } from "@/app/actions/growth";
import { SubmitButton } from "./submit-button";
import { FormMessage } from "./ui";
import type { DailyAction } from "@/lib/types";

export function DailyList({
  items,
  dreams = [],
  date,
  compact = false,
}: {
  items: DailyAction[];
  dreams?: { id: string; title: string }[];
  date: string;
  compact?: boolean;
}) {
  const [optimistic, toggle] = useOptimistic(items, (state, id: string) =>
    state.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
  );
  const dreamTitle = (id: string | null) => dreams.find((d) => d.id === id)?.title;

  return (
    <div>
      {optimistic.length === 0 && (
        <p className="py-2 text-sm text-muted">Belum ada aksi untuk hari ini. Mulai dari satu hal kecil.</p>
      )}
      <ul className="divide-y divide-line">
        {optimistic.map((a) => (
          <li key={a.id} className="group flex items-center gap-3 py-2.5">
            <button
              type="button"
              onClick={() => {
                const fd = new FormData();
                fd.set("id", a.id);
                fd.set("done", String(a.done));
                startTransition(async () => {
                  toggle(a.id);
                  await toggleDaily(fd);
                });
              }}
              aria-label={a.done ? "Tandai belum" : "Tandai selesai"}
              className="grid place-items-center"
            >
              {a.done ? (
                <CheckCircle2 className="h-[22px] w-[22px] text-success" />
              ) : (
                <Circle className="h-[22px] w-[22px] text-line hover:text-brand/40" strokeWidth={2.2} />
              )}
            </button>
            <span className="min-w-0 flex-1">
              <span className={`block text-[15px] ${a.done ? "text-muted line-through" : "text-ink"}`}>{a.title}</span>
              {!compact && dreamTitle(a.dream_id) && <span className="block truncate text-xs text-muted">↳ {dreamTitle(a.dream_id)}</span>}
            </span>
            {!compact && (
              <form action={deleteDaily}>
                <input type="hidden" name="id" value={a.id} />
                <button className="rounded-lg p-1.5 text-muted opacity-60 hover:bg-paper hover:text-danger lg:opacity-0 lg:group-hover:opacity-100" aria-label="Hapus">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <AddDailyForm date={date} dreams={compact ? [] : dreams} />
    </div>
  );
}

function AddDailyForm({ date, dreams }: { date: string; dreams: { id: string; title: string }[] }) {
  const [state, action] = useActionState(addDaily, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="mt-3 space-y-2">
      <input type="hidden" name="date" value={date} />
      <div className="flex gap-2">
        <input name="title" className="input" placeholder="Tambah aksi hari ini…" maxLength={160} required />
        <SubmitButton className="btn-primary shrink-0 px-3" pendingText="">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Tambah</span>
        </SubmitButton>
      </div>
      {dreams.length > 0 && (
        <select name="dream_id" className="input text-sm text-muted" defaultValue="">
          <option value="">Terkait mimpi (opsional)</option>
          {dreams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      )}
      {state?.error && <FormMessage state={state} />}
    </form>
  );
}
