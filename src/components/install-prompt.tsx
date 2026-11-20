"use client";

import { useEffect, useState } from "react";
import { Share, SquarePlus, X } from "lucide-react";
import { LogoMark } from "./logo";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const KEY = "eclub-install";
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as { visits?: number; dismissedAt?: number; installed?: boolean };
  } catch {
    return {};
  }
};
const write = (v: object) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), ...v }));
  } catch {}
};

/**
 * Ajakan "Pasang EClub" di HP. Muncul mulai kunjungan ke-2 (setelah pengguna merasakan manfaat),
 * tidak muncul lagi 14 hari setelah ditutup, dan tidak muncul bila sudah terpasang.
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    if (standalone) return;
    const s = read();
    const visits = (s.visits ?? 0) + 1;
    write({ visits });
    const snoozed = s.dismissedAt && Date.now() - s.dismissedAt < 14 * 86_400_000;
    if (s.installed || snoozed || visits < 2 || window.innerWidth >= 1024) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      setIos(true);
      t = setTimeout(() => setShow(true), 4000);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      t = setTimeout(() => setShow(true), 4000);
    };
    const onInstalled = () => {
      write({ installed: true });
      setShow(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;
  const close = () => {
    write({ dismissedAt: Date.now() });
    setShow(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-[88px] z-50 animate-rise lg:hidden print:hidden">
      <div className="rounded-2xl border border-line bg-white p-4 shadow-lift">
        <div className="flex items-start gap-3">
          <LogoMark className="h-11 w-11 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-heading">Pasang EClub di HP Anda</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">Buka lebih cepat dari layar utama, layar penuh seperti aplikasi, tanpa perlu Play Store.</p>
          </div>
          <button onClick={close} className="rounded-lg p-1 text-muted hover:bg-paper" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        {ios ? (
          <ol className="mt-3 space-y-1.5 rounded-xl bg-paper p-3 text-xs text-ink">
            <li className="flex items-center gap-2">
              1. Ketuk <Share className="h-4 w-4 text-brand" /> <b>Bagikan</b> di bawah layar Safari
            </li>
            <li className="flex items-center gap-2">
              2. Pilih <SquarePlus className="h-4 w-4 text-brand" /> <b>Tambah ke Layar Utama</b>
            </li>
          </ol>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={close} className="btn-ghost flex-1 py-2">
              Nanti saja
            </button>
            <button
              onClick={async () => {
                if (!evt) return;
                await evt.prompt();
                const r = await evt.userChoice;
                if (r.outcome === "accepted") write({ installed: true });
                setShow(false);
              }}
              className="btn-primary flex-1 py-2"
            >
              Pasang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
