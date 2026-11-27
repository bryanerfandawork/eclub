"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Lock, SendHorizontal, Sparkles } from "lucide-react";
import type { Draft } from "@/lib/fin-parse";

type Status = { ai: boolean; plus?: boolean; used: number; limit: number | null };

/** Perkecil foto di HP sebelum dikirim (lebih cepat & hemat kuota internet). */
async function shrink(file: File): Promise<{ data: string; media: string }> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) {
    const buf = await file.arrayBuffer();
    let bin = "";
    new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
    return { data: btoa(bin), media: file.type || "image/jpeg" };
  }
  const max = 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return { data: c.toDataURL("image/jpeg", 0.82).split(",")[1], media: "image/jpeg" };
}

const EXAMPLES = ["beli bensin 30rb cash", "gaji masuk 5jt ke BCA", "jual 10 kue 150rb usaha"];

/** Gelembung chat dari asisten. */
export function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-gold">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-heading shadow-soft">{children}</div>
    </div>
  );
}

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm leading-relaxed text-white">{children}</div>
    </div>
  );
}

/**
 * Asisten Catat (khusus Plus): cerita transaksi seperti chat, formulir terisi otomatis.
 * Paket gratis melihat sapaannya, lalu diarahkan ke Plus. Mereka tetap bisa isi formulir di bawah.
 */
export function SmartBar({ onDrafts, plus, onLocked }: { onDrafts: (d: Draft[], src: "scan" | "chat", said?: string) => void; plus: boolean; onLocked: () => void }) {
  const [text, setText] = useState("");
  const [said, setSaid] = useState("");
  const [busy, setBusy] = useState<"" | "scan" | "chat">("");
  const [err, setErr] = useState("");
  const [st, setSt] = useState<Status | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const open = plus && st?.plus !== false;

  useEffect(() => {
    if (!plus) return;
    fetch("/api/keuangan/pintar")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setSt(j))
      .catch(() => {});
  }, [plus]);

  const send = async (body: Record<string, string>, src: "scan" | "chat") => {
    if (!open) return onLocked();
    setBusy(src);
    setErr("");
    if (body.text) setSaid(body.text);
    try {
      const r = await fetch("/api/keuangan/pintar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json().catch(() => ({}))) as { drafts?: Draft[]; error?: string; used?: number; limit?: number | null; plus?: boolean };
      if (j.plus === false) return onLocked();
      if (!r.ok || !j.drafts?.length) return setErr(j.error ?? "Belum berhasil. Coba lagi.");
      if (j.used != null && st) setSt({ ...st, used: j.used });
      setText("");
      onDrafts(j.drafts, src, body.text);
    } catch {
      setErr("Koneksi terputus. Coba lagi.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mb-4 rounded-3xl bg-gold-soft/40 p-3 ring-1 ring-gold/40">
      <p className="mb-2.5 flex items-center gap-1.5 px-1 text-xs font-bold text-heading">
        <span className="h-2 w-2 rounded-full bg-success" /> Asisten Catat
        {!plus && <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">Plus</span>}
      </p>
      <div className="space-y-2">
        <AssistantBubble>
          Halo! 👋 Cerita aja transaksimu, <b>aku yang catat dan rapikan laporan keuanganmu.</b>
        </AssistantBubble>
        {said && <UserBubble>{said}</UserBubble>}
        {busy === "chat" && (
          <AssistantBubble>
            <span className="inline-flex items-center gap-1.5 text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sebentar, aku catat…</span>
          </AssistantBubble>
        )}
        {err && <AssistantBubble>{err}</AssistantBubble>}
        {!plus && (
          <AssistantBubble>
            Fitur ini khusus <b>EClub Plus</b>. Di paket gratis, isi formulir di bawah ya, tetap tercatat rapi.
          </AssistantBubble>
        )}
      </div>
      {open && !said && (
        <div className="mt-2.5 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {EXAMPLES.map((x) => (
            <button key={x} type="button" onClick={() => setText(x)} className="shrink-0 rounded-full border border-gold/60 bg-white px-3 py-1 text-xs font-medium text-ink hover:bg-paper">
              {x}
            </button>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex items-end gap-2">
        {open && st?.ai && (
          <button type="button" disabled={!!busy} onClick={() => file.current?.click()} aria-label="Foto nota" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-brand shadow-soft disabled:opacity-60">
            {busy === "scan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => !open && onLocked()}
          readOnly={!open}
          rows={1}
          maxLength={1000}
          placeholder={open ? "Ketik transaksimu di sini…" : "Ketik transaksimu… (Plus)"}
          className="input min-h-[44px] flex-1 resize-none rounded-3xl bg-white py-2.5 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && text.trim()) {
              e.preventDefault();
              send({ text: text.trim() }, "chat");
            }
          }}
        />
        <button
          type="button"
          aria-label="Kirim"
          disabled={open && (!text.trim() || !!busy)}
          onClick={() => (open ? send({ text: text.trim() }, "chat") : onLocked())}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-soft transition hover:bg-brand-soft disabled:opacity-50"
        >
          {open ? <SendHorizontal className="h-4 w-4" /> : <Lock className="h-4 w-4 text-gold" />}
        </button>
      </div>
      <input
        ref={file}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy("scan");
          const img = await shrink(f).catch(() => null);
          if (!img) {
            setBusy("");
            return setErr("Foto tidak bisa dibuka. Coba foto ulang.");
          }
          send({ image: img.data, media: img.media }, "scan");
        }}
      />
    </div>
  );
}
