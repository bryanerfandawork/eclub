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
      <div className="no-scrollbar mt-2.5 -mb-0.5 flex gap-1.5 overflow-x-auto">
        {step.items.map((i) => {
          const on = !i.href.includes("#") && path === i.href;
          return (
            <Link key={i.key} href={i.href} className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/40"}`}>
              {i.label}
            </Link>
          );
        })}
        {next && (
          <Link href={next.items[0].href} className="shrink-0 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-brand sm:hidden">
            Lanjut: {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
