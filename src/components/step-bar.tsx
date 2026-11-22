"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { STEPS, stepOfPath } from "@/lib/steps";

/** Penunjuk "Langkah X dari 5" di atas setiap fitur, supaya fitur terasa satu perjalanan. */
export function StepBar() {
  const path = usePathname();
  const step = stepOfPath(path);
  if (!step) return null;
  const next = STEPS[step.no] ?? null;
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
          <b className="text-heading">Langkah {step.no}: {step.title}</b> <span className="hidden sm:inline">· {step.q}</span>
        </p>
        {next && (
          <Link href={next.items[0].href} className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-brand hover:underline sm:inline-flex">
            Lanjut: {next.title} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {step.items.map((i) => {
          const on = !i.href.includes("#") && path === i.href;
          return (
            <Link key={i.key} href={i.href} className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"}`}>
              {i.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Tombol "Lanjut" lebar penuh di bawah setiap fitur: selalu terlihat, tanpa perlu digeser. */
export function StepNext() {
  const path = usePathname();
  const step = stepOfPath(path);
  if (!step) return null;
  const next = STEPS[step.no] ?? null;
  const idx = step.items.findIndex((i) => !i.href.includes("#") && i.href === path);
  const sibling = idx >= 0 ? step.items.slice(idx + 1).find((i) => i.href.split("#")[0] !== path) : null;
  const target = sibling ?? (next ? { label: `Langkah ${next.no}: ${next.title}`, href: next.items[0].href } : { label: "Lihat Perjalanan 5 Langkah", href: "/journey" });
  return (
    <div className="mt-10 print:hidden">
      <p className="mb-2 text-center text-xs text-muted">Sudah selesai di sini?</p>
      <Link href={target.href} className="btn-primary w-full py-4 text-base">
        Lanjut: {target.label} <ArrowRight className="h-5 w-5" />
      </Link>
      <Link href="/journey" className="mt-2 block text-center text-xs font-medium text-muted hover:text-brand">
        Lihat semua langkah
      </Link>
    </div>
  );
}
