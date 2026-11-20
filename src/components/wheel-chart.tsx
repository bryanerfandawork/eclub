import { WHEEL_AREAS, type WheelScores } from "@/lib/types";

const SHORT: Record<string, string> = {
  karier: "Karier",
  keuangan: "Keuangan",
  kesehatan: "Kesehatan",
  keluarga: "Keluarga",
  relasi: "Relasi",
  diri: "Diri",
  spiritual: "Spiritual",
  rekreasi: "Rekreasi",
};

/** Diagram radar umum. `previous` digambar putus-putus sebagai pembanding. */
export function RadarChart({
  axes,
  scores,
  previous,
  size = 320,
  labels = true,
  max = 10,
}: {
  axes: readonly { key: string; label: string; short?: string }[];
  scores: Record<string, number>;
  previous?: Record<string, number> | null;
  max?: number;
  size?: number;
  labels?: boolean;
}) {
  const c = 160;
  const R = labels ? 108 : 140;
  const n = axes.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * (R * v) / max, c + Math.sin(a) * (R * v) / max] as const;
  };
  const poly = (s: Record<string, number>) => axes.map((ar, i) => pt(i, s[ar.key] ?? 0).join(",")).join(" ");

  return (
    <svg viewBox={labels ? "-48 -4 416 328" : "0 0 320 320"} className="h-auto w-full shrink-0" style={{ maxWidth: size }} role="img" aria-label="Diagram jaring laba-laba">
      {[0.2, 0.4, 0.6, 0.8, 1].map((f) => f * max).map((r) => (
        <polygon
          key={r}
          points={axes.map((_, i) => pt(i, r).join(",")).join(" ")}
          fill={r === max ? "#faf7f5" : "none"}
          stroke="#ece5e1"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, max);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#ece5e1" strokeWidth="1" />;
      })}
      {previous && <polygon points={poly(previous)} fill="none" stroke="#c6a15b" strokeWidth="1.5" strokeDasharray="4 4" />}
      <polygon points={poly(scores)} fill="#8b2220" fillOpacity="0.14" stroke="#8b2220" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((ar, i) => {
        const [x, y] = pt(i, scores[ar.key] ?? 0);
        return <circle key={ar.key} cx={x} cy={y} r="3.5" fill="#8b2220" stroke="#fff" strokeWidth="1.5" />;
      })}
      {labels &&
        axes.map((ar, i) => {
          const [x, y] = pt(i, max * 1.26);
          const anchor = Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end";
          return (
            <g key={ar.key}>
              <text x={x} y={y - 2} textAnchor={anchor} fontSize="11" fontWeight="600" fill="#2a1d1c">
                {ar.short ?? ar.label}
              </text>
              <text x={x} y={y + 11} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#8b2220">
                {scores[ar.key] != null ? Math.round(scores[ar.key] * 10) / 10 : "–"}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

const WHEEL_AXES = WHEEL_AREAS.map((a) => ({ key: a.key, label: a.label, short: SHORT[a.key] }));

/** Diagram radar Wheel of Life (skala 1–10). `previous` digambar putus-putus sebagai pembanding. */
export function WheelChart(props: { scores: WheelScores; previous?: WheelScores | null; size?: number; labels?: boolean }) {
  return <RadarChart axes={WHEEL_AXES} {...props} />;
}

export function wheelAverage(s: WheelScores) {
  const vals = WHEEL_AREAS.map((a) => s[a.key] ?? 0);
  return Math.round((vals.reduce((x, y) => x + y, 0) / vals.length) * 10) / 10;
}
