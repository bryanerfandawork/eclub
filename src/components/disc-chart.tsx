import type { Factor } from "@/lib/disc/score";

const F: Factor[] = ["D", "I", "S", "C"];
const COLORS: Record<Factor, string> = { D: "#b42318", I: "#c6a15b", S: "#2f7d5b", C: "#1f4f8b" };

/** Grafik DISC 0–100 dengan garis tengah 50 (di atas garis = faktor tinggi). */
export function DiscChart({ values, title, subtitle }: { values: Record<Factor, number>; title: string; subtitle?: string }) {
  const W = 260, H = 200, top = 16, bottom = 172, left = 34, step = (W - left - 16) / 3;
  const y = (v: number) => bottom - (Math.max(0, Math.min(100, v)) / 100) * (bottom - top);
  const pts = F.map((f, i) => [left + i * step, y(values[f])] as const);
  return (
    <figure className="w-full">
      <figcaption className="mb-2">
        <p className="text-sm font-bold text-heading">{title}</p>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 12}`} className="h-auto w-full max-w-[320px]" role="img" aria-label={title}>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={left - 6} x2={W - 8} y1={y(t)} y2={y(t)} stroke={t === 50 ? "#8b2220" : "#eadfd9"} strokeDasharray={t === 50 ? "4 4" : undefined} strokeWidth={t === 50 ? 1.2 : 1} />
            <text x={left - 10} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#8a7a76">{t}</text>
          </g>
        ))}
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#2a1d1c" strokeWidth="2" strokeLinejoin="round" />
        {pts.map(([x, py], i) => (
          <g key={F[i]}>
            <circle cx={x} cy={py} r="7" fill={COLORS[F[i]]} stroke="#fff" strokeWidth="2" />
            <text x={x} y={py - 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a1d1c">{values[F[i]]}</text>
            <text x={x} y={H + 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={COLORS[F[i]]}>{F[i]}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
