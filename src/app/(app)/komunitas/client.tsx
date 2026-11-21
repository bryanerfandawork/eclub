"use client";

import { useActionState, useRef, useState } from "react";
import { createComment, createPost } from "@/app/actions/community";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/app/actions/auth";

const KINDS = [
  { key: "cerita", label: "Cerita", emoji: "💬", ph: "Apa kabar usaha Anda hari ini?" },
  { key: "menang", label: "Kemenangan", emoji: "🎉", ph: "Rayakan kemenangan kecil Anda, misal: pelanggan pertama, omzet naik…" },
  { key: "tanya", label: "Tanya", emoji: "❓", ph: "Tanyakan apa saja ke sesama pelaku usaha…" },
  { key: "insight", label: "Insight", emoji: "💡", ph: "Bagikan pelajaran yang Anda dapat minggu ini…" },
];

export function Composer({ circle, circles }: { circle: string; circles: { key: string; label: string }[] }) {
  const [kind, setKind] = useState("cerita");
  const [c, setC] = useState(circle === "umum" ? "umum" : circle);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const r = await createPost(p, fd);
    if (r?.message) {
      ref.current?.reset();
      setFocus(false);
    }
    return r;
  }, {});
  const k = KINDS.find((x) => x.key === kind)!;
  return (
    <form ref={ref} action={action} className="card p-4">
      <input type="hidden" name="kind" value={kind} />
      <textarea name="body" rows={focus ? 4 : 2} onFocus={() => setFocus(true)} maxLength={2000} className="input resize-none border-0 px-1 shadow-none focus:ring-0" placeholder={k.ph} />
      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {KINDS.map((x) => (
          <button key={x.key} type="button" onClick={() => setKind(x.key)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${kind === x.key ? "bg-brand text-white" : "bg-paper text-ink hover:bg-line"}`}>
            {x.emoji} {x.label}
          </button>
        ))}
        <select name="circle" value={c} onChange={(e) => setC(e.target.value)} className="ml-auto rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold">
          {circles.map((x) => (
            <option key={x.key} value={x.key}>
              {x.key === "umum" ? "Umum" : `Circle ${x.label}`}
            </option>
          ))}
        </select>
        <SubmitButton className="btn-primary px-4 py-1.5 text-xs" pendingText="…">
          Kirim
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function CommentForm({ post }: { post: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const r = await createComment(p, fd);
    if (r?.message) ref.current?.reset();
    return r;
  }, {});
  return (
    <form ref={ref} action={action} className="flex gap-2">
      <input type="hidden" name="post" value={post} />
      <input name="body" required maxLength={1000} className="input flex-1" placeholder="Tulis komentar yang membangun…" />
      <SubmitButton className="btn-primary shrink-0" pendingText="…">
        Kirim
      </SubmitButton>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
