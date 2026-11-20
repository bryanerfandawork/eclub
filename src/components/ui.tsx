export function PageHeader({ eyebrow, title, desc, action }: { eyebrow?: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex animate-rise flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-navy lg:text-[32px]">{title}</h1>
        {desc && <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, tone = "gold" }: { value: number; tone?: "gold" | "navy" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
      <div
        className={`h-full rounded-full transition-all duration-700 ${tone === "gold" ? "bg-gold" : "bg-navy"}`}
        style={{ width: `${Math.max(value, 2)}%` }}
      />
    </div>
  );
}

export function Ring({ value, size = 64 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/15" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#c6a15b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
      />
    </svg>
  );
}

export function FormMessage({ state }: { state?: { error?: string; message?: string } }) {
  if (!state?.error && !state?.message) return null;
  return (
    <p
      className={`rounded-xl px-3.5 py-2.5 text-sm ${
        state.error ? "bg-danger/8 text-danger" : "bg-success/10 text-success"
      }`}
      role="status"
    >
      {state.error ?? state.message}
    </p>
  );
}
