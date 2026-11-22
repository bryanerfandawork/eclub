import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { DiscSummary } from "@/components/disc-summary";
import { getDiscResult } from "@/lib/disc/server";
import { EMPTY_PROFILE } from "@/lib/income";
import { getIncomeProfile } from "@/lib/income-server";
import { getAssessmentResults } from "@/lib/data";
import { PotensiForm } from "./client";

export const metadata = { title: "Potensi Diri" };

export default async function PotensiPage() {
  const [saved, disc, ew] = await Promise.all([getIncomeProfile(), getDiscResult(), getAssessmentResults("8-wheel-entrepreneur", 1)]);
  return (
    <>
      <PageHeader eyebrow="Langkah 3 · Potensi Diri" title="Kenali bekal Anda" desc="Gaya diri, minat dan bakat, kekuatan dan kelemahan, serta aset yang sudah Anda punya. Semua dengan pilihan cepat, tidak perlu menulis panjang." />
      <div id="gaya" className="grid scroll-mt-20 gap-4 md:grid-cols-2">
        <DiscSummary result={disc?.result ?? null} />
        <Link href="/assessment/8-wheel-entrepreneur" className="card flex items-center gap-4 p-6 transition hover:border-gold">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-soft text-2xl">🛞</span>
          <span className="min-w-0 flex-1">
            <span className="eyebrow block">8 Wheel Entrepreneur</span>
            <b className="mt-0.5 block text-heading">{ew[0] ? "Sudah diisi · lihat hasil" : "Ukur 8 roda kewirausahaan Anda"}</b>
            <span className="block text-sm text-muted">Opsional, sangat berguna bagi yang punya atau merintis usaha.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
        </Link>
      </div>
      <PotensiForm initial={saved ?? EMPTY_PROFILE} isNew={!saved} />
    </>
  );
}
