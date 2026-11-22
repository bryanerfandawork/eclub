import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Baris kartu yang bisa digeser ke kanan-kiri, dengan judul dan tautan "Lihat semua". */
export function Rail({ id, title, desc, href, hrefLabel = "Lihat semua", children }: { id?: string; title: string; desc?: string; href?: string; hrefLabel?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-heading">{title}</h2>
          {desc && <p className="text-sm text-muted">{desc}</p>}
        </div>
        {href && (
          <Link href={href} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand">
            {hrefLabel} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-px-5 px-5 pb-2 lg:mx-0 lg:scroll-px-0 lg:px-0">{children}</div>
    </section>
  );
}

/** Lebar kartu standar di dalam Rail: ~78% layar HP agar kartu berikutnya terlihat (tanda bisa digeser). */
export const railCard = "w-[78%] shrink-0 snap-start sm:w-[300px]";
