import Link from "next/link";
import { INSIGHTS } from "@/lib/disc/insights";
import type { DiscResult, Factor } from "@/lib/disc/score";

const F: Factor[] = ["D", "I", "S", "C"];

/** Ringkasan kecil hasil DISC (atau ajakan tes) untuk dashboard, progress, dan My Life. */
export function DiscSummary({ result, className = "" }: { result: DiscResult | null; className?: string }) {
  if (!result) {
    return (
      <Link href="/disc" className={`card block p-6 transition hover:shadow-lift ${className}`}>
        <p className="eyebrow">Tes DISC</p>
        <p className="mt-1 font-semibold text-heading">Kenali gaya kepribadian Anda</p>
        <p className="mt-1 text-sm text-muted">24 nomor, sekitar 10 menit. Gratis.</p>
      </Link>
    );
  }
  const p = result.natural.primary;
  const ins = INSIGHTS[p];
  return (
    <Link href="/disc" className={`card flex items-center gap-4 p-6 transition hover:shadow-lift ${className}`}>
      <div className="flex h-[72px] shrink-0 items-end gap-1.5">
        {F.map((f) => (
          <div key={f} className="flex flex-col items-center gap-1">
            <div className="w-4 rounded-t" style={{ height: `${Math.max(6, result.natural.values[f] * 0.56)}px`, background: INSIGHTS[f].color, opacity: f === p ? 1 : 0.45 }} />
            <span className="text-[10px] font-bold text-muted">{f}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="eyebrow">Profil DISC</p>
        <p className="mt-1 text-xl font-bold text-heading">
          {p} · {ins.tagline}
        </p>
        <p className="text-xs text-muted">{ins.name}</p>
      </div>
    </Link>
  );
}
