"use client";

import { useEffect, useState } from "react";

/** Hitung mundur ke waktu tertentu: "3 hari 04:12:09", atau "04:12:09" di hari terakhir. */
export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) {
    const d = Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
    return (
      <span className="tabular-nums" suppressHydrationWarning>
        {d} hari
      </span>
    );
  }
  const left = Math.max(0, target - now);
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums">
      {d > 0 ? `${d} hari ` : ""}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
