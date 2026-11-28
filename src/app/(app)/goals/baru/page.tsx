import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { DreamForm } from "./dream-form";
import { getDreams } from "@/lib/data";
import { getLimit } from "@/lib/plans";
import { isEmergency } from "@/lib/types";

export const metadata = { title: "Mimpi baru" };

export default async function NewDreamPage() {
  const [dreams, limit] = await Promise.all([getDreams(), getLimit("dreams")]);
  const full = limit != null && dreams.filter((d) => !isEmergency(d)).length >= limit;
  return (
    <>
      <Link href="/goals" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-heading">
        <ChevronLeft className="h-4 w-4" /> Mimpi saya
      </Link>
      <PageHeader eyebrow="Create Dream" title="Tuliskan mimpi Anda" desc="Dari keinginan menjadi rencana. Butuh waktu sekitar 3 menit." />
      {full ? (
        <div className="card mx-auto max-w-xl p-8 text-center">
          <p className="eyebrow">Batas paket Gratis</p>
          <h2 className="mt-2 text-xl font-bold text-heading">Anda sudah memiliki {limit} mimpi</h2>
          <p className="mt-2 text-sm text-muted">Fokus mewujudkan mimpi yang ada, atau upgrade ke EClub Plus untuk merencanakan banyak mimpi sekaligus.</p>
          <Link href="/paket" className="btn-gold mt-5">Lihat EClub Plus</Link>
        </div>
      ) : (
        <DreamForm />
      )}
    </>
  );
}
