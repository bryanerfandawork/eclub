"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, SendHorizontal, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };
const CONSENT_KEY = "eclub-ai-context";
const SUGGESTIONS = ["Bantu saya menemukan cita-cita saya", "Bagaimana cara mendapatkan pelanggan pertama?", "Susun rencana 7 hari untuk mimpi saya", "Saya sedang kehilangan semangat"];

function Rich({ text }: { text: string }) {
  // Tampilkan **tebal** dan baris baru dengan rapi tanpa library tambahan.
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block min-h-[0.75em]">
          {line
            .replace(/^#{1,6}\s*/, "")
            .split(/(\*\*[^*]+\*\*)/g)
            .map((part, j) => (part.startsWith("**") && part.endsWith("**") ? <b key={j}>{part.slice(2, -2)}</b> : part))}
        </span>
      ))}
    </>
  );
}

export function AiChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<{ configured: boolean; used: number; limit: number | null } | null>(null);
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setConsent(localStorage.getItem(CONSENT_KEY) !== "off");
    } catch {}
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => {
        setInfo({ configured: !!d.configured, used: d.used ?? 0, limit: d.limit ?? null });
        setMsgs(d.history ?? []);
      })
      .catch(() => setInfo({ configured: false, used: 0, limit: null }));
  }, []);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const toggleConsent = () => {
    const v = !consent;
    setConsent(v);
    try {
      localStorage.setItem(CONSENT_KEY, v ? "on" : "off");
    } catch {}
  };

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, useContext: consent }),
      });
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        setMsgs((m) => m.slice(0, -2));
        setInput(message);
        setError(d.error ?? "Gagal mengirim pesan.");
        return;
      }
      setInfo((i) => (i ? { ...i, used: i.used + 1 } : i));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch {
      setError("Koneksi terputus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const left = info?.limit != null ? Math.max(0, info.limit - info.used) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="flex h-[88dvh] w-full max-w-lg animate-rise flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:m-4 sm:h-[640px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 bg-brand px-5 py-4 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-gold">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-bold">EClub Companion</p>
            <p className="text-xs text-white/70">{left != null ? `Sisa ${left} pesan hari ini` : "Teman bertumbuh Anda"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
          {info && !info.configured ? (
            <div className="card p-5 text-sm leading-relaxed text-muted">AI Companion sedang disiapkan oleh admin. Nantikan segera.</div>
          ) : msgs.length === 0 ? (
            <div className="pt-4 text-center">
              <p className="text-lg font-bold text-heading">Halo! Mau ngobrol soal apa hari ini?</p>
              <p className="mt-1 text-sm text-muted">Cita-cita, rencana, usaha, atau sekadar cerita. Saya siap membantu.</p>
              <div className="mt-5 space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-sm font-medium text-ink hover:border-brand/40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    m.role === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white text-ink shadow-soft"
                  }`}
                >
                  {m.content ? <Rich text={m.content} /> : <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                </div>
              </div>
            ))
          )}
          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}{" "}
              {error.includes("Plus") && (
                <Link href="/paket" onClick={onClose} className="font-semibold underline">
                  Lihat Plus
                </Link>
              )}
            </p>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line bg-white px-4 pt-3 pb-4">
          <label className="mb-2 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={consent} onChange={toggleConsent} className="h-3.5 w-3.5 accent-[#8b2220]" />
            Izinkan AI membaca data EClub saya (mimpi, profil DISC, hasil tes) agar saran lebih personal
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Tulis pesan…"
              disabled={busy || (info != null && !info.configured)}
              className="input max-h-32 min-h-[46px] flex-1 resize-none"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary h-[46px] w-[46px] shrink-0 p-0" aria-label="Kirim">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted">AI bisa keliru. Periksa kembali keputusan penting.</p>
        </div>
      </div>
    </div>
  );
}
