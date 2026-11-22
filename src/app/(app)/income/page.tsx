import { PageHeader } from "@/components/ui";
import { getDreams } from "@/lib/data";
import { getDiscResult } from "@/lib/disc/server";
import type { Factor } from "@/lib/disc/score";
import { EMPTY_PROFILE, DEFAULT_EXPENSES } from "@/lib/income";
import { getFinanceHint, getIncomeProfile } from "@/lib/income-server";
import { listCourses } from "@/lib/lms";
import { getLimit } from "@/lib/plans";
import { IncomeMap } from "./client";

export const metadata = { title: "Peta Income" };

export default async function IncomePage() {
  const [saved, dreams, disc, hint, courses, recoLimit] = await Promise.all([getIncomeProfile(), getDreams(), getDiscResult(), getFinanceHint(), listCourses(), getLimit("income_reco")]);
  const initial = saved ?? { ...EMPTY_PROFILE, expenses: DEFAULT_EXPENSES.map((name) => ({ name, amount: 0 })) };
  const nat = disc?.result?.natural;
  const order = nat?.values ? (Object.entries(nat.values) as [Factor, number][]).sort((a, b) => b[1] - a[1]).map(([f]) => f) : [];
  const discLite = nat?.primary ? { primary: nat.primary, secondary: order.find((f) => f !== nat.primary) ?? null } : null;
  const pick = (steps: string[]) => {
    const c = courses.find((x) => x.sef_step && steps.includes(x.sef_step));
    return c ? { slug: c.slug, title: c.title } : null;
  };
  return (
    <>
      <PageHeader
        eyebrow="Langkah 2 & 4 · Peta Income"
        title="Dari active, ke massive, ke passive income"
        desc="Kenali diri, catat uang masuk dan keluar, lalu lihat posisi Anda dan seberapa cepat mimpi bisa tercapai. Cukup 5 menit."
      />
      <IncomeMap
        initial={initial}
        isNew={!saved}
        dreams={dreams.map((d) => ({ id: d.id, title: d.title, target_amount: d.target_amount, saved_amount: d.saved_amount, target_date: d.target_date, status: d.status }))}
        disc={discLite}
        hint={hint}
        canReco={recoLimit !== 0}
        courses={{ active: pick(["personal_mapping", "acquisition"]), massive: pick(["systemation", "transformation"]), passive: pick(["investation"]) }}
      />
    </>
  );
}
