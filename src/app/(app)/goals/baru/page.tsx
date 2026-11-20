import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { DreamForm } from "./dream-form";

export const metadata = { title: "Mimpi baru" };

export default function NewDreamPage() {
  return (
    <>
      <Link href="/goals" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-navy">
        <ChevronLeft className="h-4 w-4" /> Mimpi saya
      </Link>
      <PageHeader eyebrow="Create Dream" title="Tuliskan mimpi Anda" desc="Dari keinginan menjadi rencana. Butuh waktu sekitar 3 menit." />
      <DreamForm />
    </>
  );
}
