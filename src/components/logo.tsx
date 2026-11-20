/** Logo EClub: huruf E di dalam lingkaran, diikuti "Club". */
function EGlyph({ fill }: { fill: string }) {
  return <path d="M17 15.5h13.5M17 24h11M17 32.5h13.5M17 15.5v17" stroke={fill} strokeWidth="3.4" strokeLinecap="square" fill="none" />;
}

export function LogoMark({ className = "h-9 w-9", variant = "brand" }: { className?: string; variant?: "brand" | "light" }) {
  const light = variant === "light";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill={light ? "#ffffff" : "#8b2220"} />
      <EGlyph fill={light ? "#8b2220" : "#ffffff"} />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center" aria-label="EClub">
      <LogoMark className="h-9 w-9" variant={light ? "light" : "brand"} />
      <span className={`-ml-1 text-[22px] leading-none font-medium tracking-[-0.03em] ${light ? "text-white" : "text-brand"}`}>
        Club
      </span>
    </span>
  );
}
