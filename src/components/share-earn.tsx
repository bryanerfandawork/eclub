import Link from "next/link";
import { Gift } from "lucide-react";
import { myShare, refUrl } from "@/lib/share";
import { ShareRef } from "./share-ref";

/**
 * Kotak "Bagikan & dapat komisi" di halaman kelas/event/artikel.
 * Member Plus: link siap salin (sudah berisi kode). Member gratis: ajakan singkat ke program affiliate.
 */
export async function ShareEarn({ path, text, what = "ini" }: { path: string; text: string; what?: string }) {
  const s = await myShare();
  if (!s.loggedIn) return null;
  if (!s.eligible || !s.code)
    return (
      <Link href="/affiliate" className="flex items-center gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold-soft/40 p-4 text-sm transition hover:bg-gold-soft/70">
        <Gift className="h-5 w-5 shrink-0 text-brand" />
        <span className="text-ink">
          Suka {what}? Member Plus dapat <b>komisi {s.rate}%</b> setiap teman yang ikut lewat link mereka. <span className="font-semibold text-brand">Pelajari program affiliate ›</span>
        </span>
      </Link>
    );
  return (
    <div className="rounded-2xl border border-gold/50 bg-card p-4 shadow-soft">
      <p className="flex items-center gap-2 text-sm font-bold text-heading">
        <Gift className="h-4 w-4 text-gold" /> Bagikan {what}, dapat komisi {s.rate}%
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Link sudah berisi kode Anda (<b className="text-heading">{s.code}</b>). Teman bisa melihat dulu tanpa login, dan hemat {s.discount}% dengan kode Anda.
      </p>
      <ShareRef url={refUrl(path, s.code)} text={text} />
    </div>
  );
}
