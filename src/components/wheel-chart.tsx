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

/** Diagram radar Wheel of Life (skala 1–10). `previous` digambar putus-putus sebagai pembanding. */
export function WheelChart({
  scores,
  previous,
  size = 320,
  labels = true,
}: {
  scores: WheelScores;
  previous?: WheelScores | null;
  size?: number;
  labels?: boolean;
}) {
  const c = 160;
  const R = labels ? 108 : 140;
  const n = WHEEL_AREAS.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * (R * v) / 10, c + Math.sin(a) * (R * v) / 10] as const;
  };
  const poly = (s: WheelScores) => WHEEL_AREAS.map((ar, i) => pt(i, s[ar.key] ?? 0).join(",")).join(" ");

  return (
    <svg viewBox={labels ? "-48 -4 416 328" : "0 0 320 320"} className="h-auto w-full shrink-0" style={{ maxWidth: size }} role="img" aria-label="Diagram Wheel of Life">
      {[2, 4, 6, 8, 10].map((r) => (
        <polygon
          key={r}
          points={WHEEL_AREAS.map((_, i) => pt(i, r).join(",")).join(" ")}
          fill={r === 10 ? "#faf7f5" : "none"}
          stroke="#ece5e1"
          strokeWidth="1"
        />
      ))}
      {WHEEL_AREAS.map((_, i) => {
        const [x, y] = pt(i, 10);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#ece5e1" strokeWidth="1" />;
      })}
      {previous && <polygon points={poly(previous)} fill="none" stroke="#c6a15b" strokeWidth="1.5" strokeDasharray="4 4" />}
      <polygon points={poly(scores)} fill="#8b2220" fillOpacity="0.14" stroke="#8b2220" strokeWidth="2" strokeLinejoin="round" />
      {WHEEL_AREAS.map((ar, i) => {
        const [x, y] = pt(i, scores[ar.key] ?? 0);
        return <circle key={ar.key} cx={x} cy={y} r="3.5" fill="#8b2220" stroke="#fff" strokeWidth="1.5" />;
      })}
      {labels &&
        WHEEL_AREAS.map((ar, i) => {
          const [x, y] = pt(i, 12.6);
          const anchor = Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end";
          return (
            <g key={ar.key}>
              <text x={x} y={y - 2} textAnchor={anchor} fontSize="11" fontWeight="600" fill="#2a1d1c">
                {SHORT[ar.key]}
              </text>
              <text x={x} y={y + 11} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#8b2220">
                {scores[ar.key] ?? "–"}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

export function wheelAverage(s: WheelScores) {
  const vals = WHEEL_AREAS.map((a) => s[a.key] ?? 0);
  return Math.round((vals.reduce((x, y) => x + y, 0) / vals.length) * 10) / 10;
}
