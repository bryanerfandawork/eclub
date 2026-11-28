import { PageHeader } from "@/components/ui";
import { IncomeMap } from "@/app/(app)/income/client";
import { getDreams } from "@/lib/data";
import { getDiscResult } from "@/lib/disc/server";
import type { Factor } from "@/lib/disc/score";
import { DEFAULT_EXPENSES, EMPTY_PROFILE, recommend } from "@/lib/income";
import { getFinanceHint, getIncomeProfile } from "@/lib/income-server";
import { getLimit } from "@/lib/plans";
import { isEmergency } from "@/lib/types";

const GENERIC = ["Reseller / dropship produk", "Makanan beku / katering online", "Jasa kelola media sosial", "Kelas online kecil", "Produk digital (template, ebook)"];

/** Halaman Peta Income: mode "kondisi" (langkah 2) atau "rencana" (langkah 4). */
export async function IncomePage({ mode }: { mode: "kondisi" | "rencana" }) {
  const [saved, dreams, disc, hint, recoLimit] = await Promise.all([getIncomeProfile(), getDreams(), getDiscResult(), getFinanceHint(), getLimit("income_reco")]);
  const initial = saved ?? { ...EMPTY_PROFILE, expenses: DEFAULT_EXPENSES.map((name) => ({ name, amount: 0 })) };
  const nat = disc?.result?.natural;
  const order = nat?.values ? (Object.entries(nat.values) as [Factor, number][]).sort((a, b) => b[1] - a[1]).map(([f]) => f) : [];
  const discLite = nat?.primary ? { primary: nat.primary, secondary: order.find((f) => f !== nat.primary) ?? null } : null;
  const ideas = recoLimit !== 0 ? recommend(initial, discLite).massive.map((x) => x.name) : GENERIC;
  return (
    <>
      {mode === "kondisi" ? (
        <PageHeader eyebrow="Langkah 2 · Kondisi Saat Ini" title="Peta Income: titik awal Anda" desc="Kesibukan, penghasilan, dan pengeluaran Anda sekarang. Cukup taksiran, 3 menit." />
      ) : (
        <PageHeader eyebrow="Langkah 4 · Action Plan" title="Rencana income berikutnya" desc="Pilih sumber penghasilan tambahan yang akan Anda bangun, lalu lihat seberapa cepat mimpi tercapai." />
      )}
      <IncomeMap
        mode={mode}
        initial={initial}
        isNew={!saved}
        dreams={dreams.map((d) => ({ id: d.id, title: d.title, target_amount: d.target_amount, saved_amount: d.saved_amount, target_date: d.target_date, status: d.status }))}
        hint={hint}
        emergency={(() => {
          const e = dreams.find(isEmergency);
          return e ? { id: e.id, target: e.target_amount ?? 0, saved: e.saved_amount } : null;
        })()}
        ideas={ideas}
      />
    </>
  );
}
