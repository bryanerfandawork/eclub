import { Flame, Sparkles, Users } from "lucide-react";
import { getPromo } from "@/lib/promo";
import { Countdown } from "./countdown";

/** Pita promo harga Plus. tone "dark" untuk di atas latar merah marun, "light" untuk latar putih. */
export async function PromoBadge({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const p = await getPromo();
  const dark = tone === "dark";
  const box = dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-gold-soft/70 text-ink ring-1 ring-gold/30";
  const sub = dark ? "text-white/70" : "text-muted";
  if (p.kind === "special") {
    return (
      <p className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${box} ${className}`}>
        <Sparkles className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${dark ? "text-gold" : "text-brand"}`} />
        <span>{p.note}</span>
      </p>
    );
  }
  return (
    <div className={`rounded-xl px-3 py-2.5 text-xs ${box} ${className}`}>
      <p className="flex items-center gap-1.5 font-bold">
        {p.kind === "date" ? <Flame className="h-3.5 w-3.5 text-gold" /> : <Users className="h-3.5 w-3.5 text-gold" />}
        {p.kind === "date" ? (
          <>
            {p.label} tinggal <Countdown to={p.endsAt} /> lagi
          </>
        ) : (
          <>
            {p.label}: tersisa {p.left} dari {p.total} kuota
          </>
        )}
      </p>
      {p.kind === "quota" && (
        <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-white"}`}>
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(4, Math.round(((p.total - p.left) / p.total) * 100))}%` }} />
        </div>
      )}
      <p className={`mt-1.5 leading-relaxed ${sub}`}>Setelah promo berakhir, harga akan kembali menyesuaikan. {p.note.startsWith("Harga spesial") ? "" : p.note}</p>
    </div>
  );
}
