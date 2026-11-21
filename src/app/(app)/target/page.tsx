import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getAssessmentResults, getDreams } from "@/lib/data";
import { todayJakarta } from "@/lib/format";
import { listCourses } from "@/lib/lms";
import { PLACEMENT_KEY } from "@/lib/placement";
import { SEF_STEPS } from "@/lib/sef";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { TargetPlanner, type DreamLite, type ProductLite } from "./planner";

export const metadata = { title: "Target Harian" };

export default async function TargetPage() {
  const [dreams, placed, courses] = await Promise.all([getDreams(), getAssessmentResults(PLACEMENT_KEY, 1), listCourses()]);
  const placement = (placed[0]?.scores as unknown as { placement?: string } | undefined)?.placement;
  let products: ProductLite[] = [];
  let profitPerDay: number | null = null;
  if (isDemoMode) {
    products = [{ id: "d1", name: "Keripik pedas", hpp: 2000, price: 5000 }];
  } else {
    const supabase = await createClient();
    const [p, t] = await Promise.all([
      supabase.from("fin_products").select("id, name, hpp, price").order("created_at", { ascending: false }).limit(20),
      supabase.from("fin_transactions").select("kind, category, amount").eq("wallet", "business").gte("tx_date", todayJakarta(-30)).in("kind", ["in", "out"]),
    ]);
    products = (p.data ?? []) as ProductLite[];
    const rows = (t.data ?? []) as { kind: string; category: string; amount: number }[];
    if (rows.length >= 3) {
      const net = rows.reduce((s, r) => s + (r.kind === "in" ? (["modal", "saldo_awal"].includes(r.category) ? 0 : Number(r.amount)) : r.category === "cicilan" ? 0 : -Number(r.amount)), 0);
      profitPerDay = Math.round(net / 30);
    }
  }
  const dreamList: DreamLite[] = dreams
    .filter((d) => d.status === "active" && d.target_amount && d.target_date)
    .map((d) => ({ id: d.id, title: d.title, target: d.target_amount!, saved: d.saved_amount, date: d.target_date! }));

  // Rekomendasi: kelas sesuai posisi SEF (minimal Acquisition, karena target ini soal penjualan).
  const step = placement && placement !== "spark" && placement !== "personal_mapping" ? placement : "acquisition";
  const stepInfo = SEF_STEPS.find((s) => s.key === step);
  const recCourses = courses.filter((c) => c.sef_step === step).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow="Peta Target Harian" title="Dari mimpi ke jualan hari ini" desc="Ubah mimpi besar menjadi angka kecil yang bisa dikerjakan setiap hari: berapa yang harus disisihkan, dan berapa produk yang harus terjual." />
      <TargetPlanner dreams={dreamList} products={products} profitPerDay={profitPerDay} />
      <section className="mt-6">
        <h2 className="font-bold text-heading">Supaya target harian tercapai</h2>
        <p className="mt-1 text-sm text-muted">Rekomendasi berdasarkan posisi SEF Anda{placement ? "" : " (belum Cek Posisi, jadi kami mulai dari Acquisition)"}.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link href={recCourses[0] ? `/learn/${recCourses[0].slug}` : "/learn"} className="card flex flex-col p-5 transition hover:border-gold">
            <BookOpen className="h-6 w-6 text-brand" />
            <p className="mt-3 font-bold text-heading">Kelas {stepInfo?.name}</p>
            <p className="mt-1 flex-1 text-sm text-muted">{recCourses[0]?.title ?? stepInfo?.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Mulai belajar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/mentoring" className="card flex flex-col p-5 transition hover:border-gold">
            <Users className="h-6 w-6 text-brand" />
            <p className="mt-3 font-bold text-heading">Mentoring 1-on-1</p>
            <p className="mt-1 flex-1 text-sm text-muted">Bawa angka target ini ke mentor. Pulang dengan strategi jualan yang konkret untuk produk Anda.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Pilih jadwal <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href={placement ? "/keuangan" : "/posisi"} className="card flex flex-col p-5 transition hover:border-gold">
            <span className="text-2xl">{placement ? "💰" : "🧭"}</span>
            <p className="mt-2 font-bold text-heading">{placement ? "Catat penjualan setiap hari" : "Cek Posisi SEF (3 menit)"}</p>
            <p className="mt-1 flex-1 text-sm text-muted">{placement ? "Dengan catatan rutin, Anda tahu apakah target harian sudah tercapai." : "Agar rekomendasi kelas dan mentoring makin tepat untuk Anda."}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Buka <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
