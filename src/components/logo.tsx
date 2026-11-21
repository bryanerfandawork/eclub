"use client";

import { useBrand } from "./brand";

/** Logo EClub. Memakai logo yang diunggah di Admin > Pengaturan; bila belum ada, memakai logo bawaan. */
function EGlyph({ fill }: { fill: string }) {
  return <path d="M17 15.5h13.5M17 24h11M17 32.5h13.5M17 15.5v17" stroke={fill} strokeWidth="3.4" strokeLinecap="square" fill="none" />;
}

export function LogoMark({ className = "h-9 w-9", variant = "brand" }: { className?: string; variant?: "brand" | "light" }) {
  const { icon } = useBrand();
  if (icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" aria-hidden className={`${className} rounded-[22%] object-contain`} />;
  }
  const light = variant === "light";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill={light ? "#ffffff" : "#8b2220"} />
      <EGlyph fill={light ? "#8b2220" : "#ffffff"} />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  const { logo, logoDark } = useBrand();
  const src = light ? logoDark || "" : logo;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="EClub" className="h-9 w-auto max-w-[160px] object-contain" />;
  }
  return (
    <span className="flex items-center" aria-label="EClub">
      <LogoMark className="h-9 w-9" variant={light ? "light" : "brand"} />
      <span className={`-ml-1 text-[22px] leading-none font-medium tracking-[-0.03em] ${light ? "text-white" : "text-brand"}`}>Club</span>
    </span>
  );
}
