"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { notifySaved } from "./step-bar";

export type SaveState = { state: "idle" | "saving" | "saved" | "error"; error?: string };

/** Simpan otomatis 1 detik setelah isian berubah. Tidak perlu tombol simpan. */
export function useAutoSave(json: string, save: () => Promise<{ ok?: boolean; error?: string }>): SaveState {
  const first = useRef(json);
  const [st, setSt] = useState<SaveState>({ state: "idle" });
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (json === first.current) return;
    setSt({ state: "saving" });
    const t = setTimeout(async () => {
      try {
        const r = await saveRef.current();
        if (r.ok) {
          first.current = json;
          setSt({ state: "saved" });
          notifySaved();
        } else setSt({ state: "error", error: r.error ?? "Gagal menyimpan." });
      } catch {
        setSt({ state: "error", error: "Koneksi terputus. Isian akan dicoba simpan lagi saat Anda mengubahnya." });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [json]);
  return st;
}

export function SaveStatus({ s, className = "" }: { s: SaveState; className?: string }) {
  if (s.state === "error")
    return (
      <div className={`flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger ${className}`}>
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <b>Belum tersimpan.</b> {s.error}
        </span>
      </div>
    );
  return (
    <p className={`flex items-center justify-center gap-1.5 text-xs ${s.state === "saved" ? "text-success" : "text-muted"} ${className}`}>
      {s.state === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      {s.state === "saving" ? "Menyimpan…" : s.state === "saved" ? "Tersimpan otomatis" : "Isian tersimpan otomatis setiap kali Anda mengubahnya"}
    </p>
  );
}
