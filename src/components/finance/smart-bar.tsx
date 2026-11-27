"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, MessageSquareText, Sparkles } from "lucide-react";
import type { Draft } from "@/lib/fin-parse";

type Status = { ai: boolean; used: number; limit: number | null };

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

/**
 * Catat pintar di atas lembar Catat: foto nota, atau ketik seperti chat.
 * Hasilnya mengisi lembar Catat; pengguna tinggal cek lalu Simpan.
 */
export function SmartBar({ onDrafts }: { onDrafts: (d: Draft[], src: "scan" | "chat") => void }) {
  const [mode, setMode] = useState<"" | "chat">("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"" | "scan" | "chat">("");
  const [err, setErr] = useState("");
  const [st, setSt] = useState<Status | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/keuangan/pintar")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setSt(j))
      .catch(() => {});
  }, []);

  const send = async (body: Record<string, string>, src: "scan" | "chat") => {
    setBusy(src);
    setErr("");
    try {
      const r = await fetch("/api/keuangan/pintar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json().catch(() => ({}))) as { drafts?: Draft[]; error?: string; used?: number; limit?: number | null };
      if (!r.ok || !j.drafts?.length) return setErr(j.error ?? "Belum berhasil. Coba lagi.");
      if (j.used != null && st) setSt({ ...st, used: j.used });
      onDrafts(j.drafts, src);
    } catch {
      setErr("Koneksi terputus. Coba lagi.");
    } finally {
      setBusy("");
    }
  };

  const left = st?.limit != null ? Math.max(0, st.limit - st.used) : null;
  const scanOff = st ? !st.ai : false;

  return (
    <div className="mb-4 rounded-2xl border border-gold/50 bg-gold-soft/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-heading">
        <Sparkles className="h-3.5 w-3.5 text-gold" /> Catat pintar
        {left != null && st?.ai && <span className="ml-auto font-medium text-muted">Foto nota: sisa {left}x hari ini</span>}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!!busy || scanOff}
          onClick={() => file.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-heading shadow-soft transition hover:bg-paper disabled:opacity-60"
        >
          {busy === "scan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-brand" />}
          {busy === "scan" ? "Membaca nota…" : "Foto nota"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => setMode(mode === "chat" ? "" : "chat")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-soft transition ${mode === "chat" ? "bg-brand text-white" : "bg-white text-heading hover:bg-paper"}`}
        >
          <MessageSquareText className={`h-4 w-4 ${mode === "chat" ? "text-gold" : "text-brand"}`} /> Ketik saja
        </button>
      </div>
      {scanOff && <p className="mt-1.5 text-[11px] text-muted">Foto nota segera aktif. Sementara ini pakai &quot;Ketik saja&quot;.</p>}
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
      {mode === "chat" && (
        <div className="mt-2.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={1000}
            autoFocus
            placeholder='Misal: "beli minum 5rb pakai uang pribadi cash" atau "bayar listrik kantor 1 juta transfer bank jago"'
            className="input min-h-[64px] resize-none bg-white text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && text.trim()) {
                e.preventDefault();
                send({ text }, "chat");
              }
            }}
          />
          <button type="button" disabled={!text.trim() || !!busy} onClick={() => send({ text }, "chat")} className="btn-primary mt-2 w-full py-2.5 disabled:opacity-60">
            {busy === "chat" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-gold" />} Isi otomatis
          </button>
        </div>
      )}
      {err && <p className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{err}</p>}
    </div>
  );
}
