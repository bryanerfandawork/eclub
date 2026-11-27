import Link from "next/link";
import { cookies } from "next/headers";
import { Ticket } from "lucide-react";
import { getSettings } from "@/lib/plans";

/** Ajakan daftar di halaman pratinjau publik. Setelah daftar/masuk, pengguna kembali ke `next`. */
export async function JoinCta({ next, title = "Mulai gratis sekarang", desc, sticky = false }: { next: string; title?: string; desc?: string; sticky?: boolean }) {
  const ref = (await cookies()).get("eclub_ref")?.value;
  const s = await getSettings();
  const disc = Number(s.coupon_discount) || 10;
  const q = `?next=${encodeURIComponent(next)}`;
  const body = (
    <>
      {ref && (
        <p className="mb-3 flex items-center gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs text-heading">
          <Ticket className="h-4 w-4 shrink-0 text-brand" /> Kode teman Anda <b>{ref}</b> tersimpan: hemat {disc}% saat berlangganan Plus.
        </p>
      )}
      <p className="font-bold text-heading">{title}</p>
      {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/daftar${q}`} className="btn-primary flex-1 whitespace-nowrap sm:flex-none">Daftar gratis</Link>
        <Link href={`/masuk${q}`} className="btn border border-line bg-white text-heading hover:bg-paper">Sudah punya akun? Masuk</Link>
      </div>
    </>
  );
  if (sticky)
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 py-3 shadow-lift backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-heading">{title}</p>
          <Link href={`/daftar${q}`} className="btn-primary shrink-0">Daftar gratis</Link>
        </div>
      </div>
    );
  return <div className="card p-5">{body}</div>;
}
