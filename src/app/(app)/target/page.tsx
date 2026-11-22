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


  return (
    <>
      <PageHeader eyebrow="Langkah 4 · Target Harian" title="Dari mimpi ke jualan hari ini" desc="Ubah mimpi besar menjadi angka kecil yang bisa dikerjakan setiap hari: berapa yang harus disisihkan, dan berapa produk yang harus terjual." />
      <TargetPlanner dreams={dreamList} products={products} profitPerDay={profitPerDay} />
    </>
  );
}
