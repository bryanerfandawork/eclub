import { providerOf, TYPE_INFO, type PocketType } from "@/lib/pockets";

/** Lencana kantong: warna + singkatan bank/e-wallet, atau emoji untuk tunai/lainnya. */
export function PocketBadge({ type, provider, size = 40 }: { type: PocketType; provider: string | null; size?: number }) {
  const p = providerOf(provider);
  if (p)
    return (
      <span className="grid shrink-0 place-items-center rounded-xl font-extrabold tracking-tight" style={{ width: size, height: size, background: p.bg, color: p.fg, fontSize: size * (p.short.length > 3 ? 0.24 : 0.3) }}>
        {p.short}
      </span>
    );
  return (
    <span className="grid shrink-0 place-items-center rounded-xl bg-paper" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {TYPE_INFO[type]?.emoji ?? "👛"}
    </span>
  );
}
