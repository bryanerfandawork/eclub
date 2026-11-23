"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { STEPS, base, nextFrom, stepOfPath } from "@/lib/steps";

/** Status isian dari server; dimuat ulang saat pindah halaman, saat kembali ke tab, dan setelah isian disimpan. */
function useDone() {
  const path = usePathname();
  const [done, setDone] = useState<Record<string, boolean> | null>(null);
  const load = useCallback(() => {
    fetch("/api/journey", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { done: null }))
      .then((d) => setDone(d.done ?? {}))
      .catch(() => setDone({}));
  }, []);
  useEffect(() => {
    load();
  }, [path, load]);
  useEffect(() => {
    const on = () => load();
    window.addEventListener("focus", on);
    window.addEventListener("eclub:saved", on);
    return () => {
      window.removeEventListener("focus", on);
      window.removeEventListener("eclub:saved", on);
    };
  }, [load]);
  return done;
}

/** Beri tahu tombol Lanjut bahwa ada isian yang baru tersimpan. */
export function notifySaved() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("eclub:saved"));
}

/** Penunjuk "Langkah X dari 5" di atas setiap fitur, supaya fitur terasa satu perjalanan. */
export function StepBar() {
  const path = usePathname();
  const done = useDone();
  const step = stepOfPath(path);
  if (!step) return null;
  return (
    <div className="mb-5 rounded-2xl border border-line bg-white/70 p-3 print:hidden">
      <div className="flex items-center gap-3">
        <Link href="/journey" className="flex shrink-0 items-center gap-1" aria-label="Lihat perjalanan 5 langkah">
          {STEPS.map((s) => (
            <span key={s.no} className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${s.no === step.no ? "bg-brand text-white" : s.no < step.no ? "bg-gold-soft text-brand" : "bg-paper text-muted"}`}>
              {s.no}
            </span>
          ))}
        </Link>
        <p className="min-w-0 flex-1 truncate text-xs text-muted">
          <b className="text-heading">
            Langkah {step.no}: {step.title}
          </b>{" "}
          <span className="hidden sm:inline">· {step.q}</span>
        </p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {step.items.filter((i) => !i.hidden || path === base(i.href)).map((i) => {
          const here = path === base(i.href);
          const ok = done?.[i.key];
          return (
            <Link
              key={i.key}
              href={i.href}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${here ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"}`}
            >
              {ok && <CheckCircle2 className={`h-3 w-3 ${here ? "text-gold" : "text-success"}`} />} {i.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Tombol "Lanjut" lebar penuh di bawah setiap fitur. Terkunci sampai isian wajib di halaman ini selesai. */
export function StepNext() {
  const path = usePathname();
  const done = useDone();
  const info = done ? nextFrom(path, done) : null;
  const blockedKey = info?.blocked?.key;
  // Selama terkunci, cek ulang berkala (isian yang disimpan lewat formulir biasa tidak memicu event).
  useEffect(() => {
    if (!blockedKey) return;
    let n = 0;
    const t = setInterval(() => {
      if (++n > 40 || document.hidden) return;
      notifySaved();
    }, 6000);
    return () => clearInterval(t);
  }, [blockedKey]);
  if (!stepOfPath(path) && path !== "/rekap" && path !== "/evaluasi") return null;
  if (!info) return null;
  const { blocked, target } = info;
  return (
    <div className="mt-10 print:hidden">
      {blocked ? (
        <>
          <button type="button" disabled className="btn w-full cursor-not-allowed bg-line py-4 text-base text-muted">
            <Lock className="h-4 w-4" /> Lanjut
          </button>
          <p className="mt-2 text-center text-sm text-muted">
            {blocked.key === "rekap" || blocked.key === "ritme" ? (
              <>Tekan tombol <b className="text-heading">&quot;Saya paham&quot;</b> di atas untuk menandai langkah ini selesai.</>
            ) : (
              <>Selesaikan dulu <b className="text-heading">{blocked.label}</b> di halaman ini, lalu tombol Lanjut akan aktif.</>
            )}
          </p>
        </>
      ) : (
        <>
          <p className="mb-2 text-center text-xs text-muted">Bagian ini sudah beres 👍</p>
          <Link href={target.href} className="btn-primary w-full py-4 text-base">
            Lanjut: {target.label} <ArrowRight className="h-5 w-5" />
          </Link>
        </>
      )}
      <Link href="/journey" className="mt-2 block text-center text-xs font-medium text-muted hover:text-brand">
        Lihat semua langkah
      </Link>
    </div>
  );
}
