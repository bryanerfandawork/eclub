import Link from "next/link";
import { ArrowRight, Crown, Plus, Sparkles } from "lucide-react";

/** Ajakan setelah mimpi pertama: kebanyakan orang punya lebih dari satu mimpi. */
export function MoreDreams({ canAdd, nextHref = "/my-life", nextLabel = "Lanjut: Definisi sukses & nilai hidup" }: { canAdd: boolean; nextHref?: string; nextLabel?: string }) {
  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-gold/50 bg-gold-soft/60 p-5 lg:p-6">
      <p className="flex items-center gap-2 text-lg font-bold text-heading">
        <Sparkles className="h-5 w-5 text-gold" /> Mimpi pertama Anda sudah tercatat! 🎉
      </p>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink">
        Hampir semua orang punya lebih dari satu mimpi: untuk keluarga, ibadah, pendidikan anak, rumah, usaha, atau diri sendiri. Menuliskan semuanya membuat arah hidup makin jelas, dan EClub bisa menghitung berapa yang perlu disiapkan untuk semuanya sekaligus.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {canAdd ? (
          <Link href="/goals/baru" className="btn-primary">
            <Plus className="h-4 w-4" /> Tambah mimpi lain
          </Link>
        ) : (
          <Link href="/paket" className="btn-primary">
            <Crown className="h-4 w-4 text-gold" /> Tulis semua mimpi dengan Plus
          </Link>
        )}
        <Link href={nextHref} className="btn-ghost">
          {canAdd ? nextLabel : "Nanti saja, lanjut"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {!canAdd && <p className="mt-2 text-xs text-muted">Paket gratis menyimpan 1 mimpi. Plus membuka mimpi tanpa batas, laporan Gaya Diri lengkap, dan ide income personal.</p>}
    </section>
  );
}
