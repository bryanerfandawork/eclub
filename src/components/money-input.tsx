"use client";

import { useState } from "react";

export function MoneyInput({ name, placeholder, defaultValue, onValue }: { name: string; placeholder?: string; defaultValue?: number; onValue?: (n: number) => void }) {
  const fmt = (n: number) => (n ? n.toLocaleString("id-ID") : "");
  const [v, setV] = useState(fmt(defaultValue ?? 0));
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-muted">Rp</span>
      <input
        name={name}
        inputMode="numeric"
        className="input pl-10"
        placeholder={placeholder}
        value={v}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
          setV(fmt(n));
          onValue?.(n);
        }}
      />
    </div>
  );
}
