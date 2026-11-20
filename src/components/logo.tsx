export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="13" fill="#0f1e3d" />
      <path d="M15 14h17M15 24h13M15 34h17M15 14v20" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="35" cy="24" r="3.2" fill="#c6a15b" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`text-[17px] font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        EClub<span className="text-gold">.</span>
      </span>
    </span>
  );
}
