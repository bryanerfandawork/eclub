import { PromoBadge } from "@/components/promo-badge";
import Link from "next/link";
import { Check, Crown, Minus } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { couponInfo, getAccount, getFeatures, getSettings, visibleFeatures, type PlanFeature } from "@/lib/plans";
import { aiConfigured } from "@/lib/ai";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Paket" };

function Cell({ f, limit }: { f: PlanFeature; limit: number | null }) {
  if (limit === 0) return <Minus className="mx-auto h-4 w-4 text-line" />;
  if (limit == null) return f.unit ? <span className="text-sm font-semibold text-heading">Tanpa batas</span> : <Check className="mx-auto h-5 w-5 text-success" />;
  return (
    <span className="text-sm font-semibold text-heading">
      {limit} {f.unit}
    </span>
  );
}

export default async function PlansPage() {
  const [features, settings, account] = await Promise.all([getFeatures(), getSettings(), getAccount()]);
  const monthly = Number(settings.plus_price_monthly) || 0;
  const yearly = Number(settings.plus_price_yearly) || 0;
  const c = couponInfo(settings);
  const adminWa = String(settings.admin_whatsapp ?? "").replace(/[^\d]/g, "").replace(/^0/, "62");
  const supportHref = adminWa ? `https://wa.me/${adminWa}?text=${encodeURIComponent("Halo Tim EClub, saya member Plus. Saya butuh bantuan:")}` : null;
  const promo = !!c.code && c.pct > 0;
  const contact = String(settings.upgrade_contact ?? "");
  const contactHref = /^\+?\d[\d\s-]{7,}$/.test(contact)
    ? `https://wa.me/${contact.replace(/[^\d]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent("Halo EClub, saya ingin upgrade ke EClub Plus.")}`
    : /^https?:\/\//.test(contact)
      ? contact
      : null;

  return (
    <>
      <PageHeader eyebrow="Paket" title="Pilih cara Anda bertumbuh" desc="Versi gratis sudah benar-benar berguna. EClub Plus membuka batas dan fitur lanjutan." />
      <div className="grid gap-4 md:grid-cols-2">
        <section className={`card p-6 ${account.plan === "free" ? "ring-2 ring-line" : ""}`}>
          <p className="eyebrow">EClub Free</p>
          <p className="mt-2 text-3xl font-bold text-heading">Gratis</p>
          <p className="mt-1 text-sm text-muted">Selamanya, untuk memulai perjalanan.</p>
          {account.plan === "free" && <p className="mt-4 text-sm font-semibold text-brand">Paket Anda saat ini</p>}
        </section>
        <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lift">
          <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
          <p className="eyebrow flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" /> EClub Plus
          </p>
          {promo && <p className="mt-2 text-sm text-white/60 line-through">{rupiah(monthly)} /bulan</p>}
          <p className={promo ? "text-3xl font-bold" : "mt-2 text-3xl font-bold"}>
            {rupiah(promo ? c.after(monthly) : monthly)}
            <span className="text-base font-medium text-white/60"> /bulan</span>
          </p>
          <p className="mt-1 text-sm text-white/70">atau {rupiah(promo ? c.after(yearly) : yearly)} per tahun{promo ? ` dengan kupon (kode ${c.code} atau kode teman, hemat ${c.pct}%)` : ""}</p>
          {account.plan !== "plus" && <PromoBadge tone="dark" className="mt-4" />}
          {account.plan === "plus" ? (
            <>
              <p className="mt-4 text-sm font-semibold text-gold">
                Paket Anda saat ini{account.expiresAt ? ` · aktif sampai ${new Date(account.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}
              </p>
              {supportHref && (
                <a href={supportHref} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4">
                  Bantuan prioritas via WhatsApp
                </a>
              )}
            </>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/beli/plus" className="btn-gold">
                Upgrade sekarang
              </Link>
              {contactHref && (
                <a href={contactHref} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white/80 underline-offset-2 hover:underline">
                  Tanya admin dulu
                </a>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-paper text-xs font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3">Fitur</th>
              <th className="w-28 px-3 py-3 text-center sm:w-36">Gratis</th>
              <th className="w-28 px-3 py-3 text-center text-brand sm:w-36">Plus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleFeatures(features, aiConfigured()).map((f) => (
              <tr key={f.key}>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-heading">
                    {f.label}
                    {!f.enforced && <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">Segera</span>}
                  </p>
                  {f.description && <p className="text-xs text-muted">{f.description}</p>}
                </td>
                <td className="px-3 py-3.5 text-center">
                  <Cell f={f} limit={f.free_limit} />
                </td>
                <td className="px-3 py-3.5 text-center">
                  <Cell f={f} limit={f.plus_limit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
