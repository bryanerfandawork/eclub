import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { deleteProduct } from "@/app/actions/finance-products";
import { DeleteTx } from "@/components/finance/quick-add";
import { PageHeader } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { HppCalculator, type Product } from "./calculator";

export const metadata = { title: "Kalkulator HPP" };

export default async function HppPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const acc = await getAccount();
  const canSave = acc.plan === "plus" || isAdmin(acc.role);
  let products: Product[] = [];
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.from("fin_products").select("id, name, data, hpp, price").order("created_at", { ascending: false });
    products = (data ?? []) as Product[];
  }
  const editing = products.find((p) => p.id === id);
  return (
    <>
      <Link href="/keuangan?w=business" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> Keuangan
      </Link>
      <PageHeader eyebrow="Keuangan usaha" title="Kalkulator HPP" desc="Hitung modal per produk dan harga jual yang menguntungkan. Isi dari atas ke bawah, hasilnya langsung muncul." />
      <HppCalculator key={editing?.id ?? "new"} initial={editing} canSave={canSave} />
      {products.length > 0 && (
        <section className="card mt-6 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-heading">Produk tersimpan</h3>
            {editing && (
              <Link href="/keuangan/hpp" className="text-sm font-semibold text-brand">
                + Produk baru
              </Link>
            )}
          </div>
          <ul className="mt-2 divide-y divide-line">
            {products.map((p) => {
              const m = p.price > 0 ? Math.round(((p.price - p.hpp) / p.price) * 100) : 0;
              return (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <Link href={`/keuangan/hpp?id=${p.id}`} className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-heading">{p.name}</span>
                    <span className="block text-xs text-muted">
                      HPP {rupiah(p.hpp)} · jual {rupiah(p.price)} · untung {m}%
                    </span>
                  </Link>
                  <DeleteTx id={p.id} action={deleteProduct} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
