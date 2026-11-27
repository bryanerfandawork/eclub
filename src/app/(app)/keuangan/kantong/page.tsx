import Link from "next/link";
import { Archive, ChevronLeft, Info } from "lucide-react";
import { archivePocket } from "@/app/actions/finance";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { PageHeader } from "@/components/ui";
import { BOOK_EMOJI, WALLET_LABEL, type Wallet } from "@/lib/finance";
import { getBooks, getPockets } from "@/lib/finance-server";
import { rupiah } from "@/lib/format";
import { getLimit } from "@/lib/plans";
import { TYPE_INFO, providerOf } from "@/lib/pockets";
import { AddPocketForm, EditPocket } from "./client";

export const metadata = { title: "Kantong Keuangan" };

export default async function KantongPage() {
  const [pockets, limit, books] = await Promise.all([getPockets(), getLimit("fin_pockets"), getBooks()]);
  const mine = pockets.filter((p) => p.own !== false);
  const locked = limit !== null && mine.length >= limit ? `Paket gratis punya ${limit} kantong (1 pribadi + 1 usaha). Ganti nama/jenis kantong yang ada lewat tombol Ubah, atau upgrade ke Plus untuk kantong tanpa batas.` : null;
  return (
    <>
      <Link href="/keuangan" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ChevronLeft className="h-4 w-4" /> Keuangan
      </Link>
      <PageHeader eyebrow="Keuangan · Kantong" title="Di mana uang Anda berada?" desc="Kantong adalah tempat uang disimpan: dompet tunai, rekening bank, atau e-wallet. Pisahkan kantong pribadi, setiap usaha, dan keluarga." />
      {pockets.length === 0 ? (
        <div className="card p-6 text-sm text-muted">Fitur kantong aktif setelah pembaruan database (SQL 022) dijalankan.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {(books.length
            ? [
                { key: "", title: "🙂 Kantong Pribadi", wallet: "personal" as Wallet, list: pockets.filter((p) => !p.book_id && p.own !== false), book: null },
                ...books
                  .filter((b) => b.status === "active" && b.role !== "recorder")
                  .map((b) => ({ key: b.id, title: `${BOOK_EMOJI[b.kind]} ${b.name}`, wallet: (b.kind === "business" ? "business" : "personal") as Wallet, list: pockets.filter((p) => p.book_id === b.id), book: b })),
              ]
            : (["personal", "business"] as Wallet[]).map((w) => ({ key: w, title: `${w === "personal" ? "🙂" : "🏪"} Kantong ${WALLET_LABEL[w]}`, wallet: w, list: pockets.filter((p) => p.wallet === w), book: null }))
          ).map(({ key, title, wallet: w, list, book }) => {
            return (
              <section key={key} id={key || undefined} className="card scroll-mt-24 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="truncate font-bold text-heading">{title}</h2>
                  <span className="text-sm font-bold text-heading">{rupiah(list.reduce((n, p) => n + p.balance, 0))}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {list.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3">
                      <PocketBadge type={p.type} provider={p.provider} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-heading">{p.name}</span>
                        <span className="block text-xs text-muted">{providerOf(p.provider)?.label ?? TYPE_INFO[p.type].label}</span>
                        {(p.earmarks ?? []).map((e) => (
                          <span key={e.dream_id} className="block truncate text-[11px] font-semibold text-gold">
                            🐷 {rupiah(e.amount)} untuk {e.title}
                          </span>
                        ))}
                      </span>
                      <span className={`text-sm font-bold ${p.balance < 0 ? "text-danger" : "text-heading"}`}>{rupiah(p.balance)}</span>
                      <EditPocket p={p} />
                      {list.length > 1 && p.balance === 0 && (
                        <form action={archivePocket}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper" aria-label="Arsipkan" title="Arsipkan">
                            <Archive className="h-4 w-4" />
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
                <AddPocketForm wallet={w} bookId={book?.id} locked={book && !book.mine ? (book.owner_plus ? null : "Paket Plus pemilik buku sudah berakhir.") : locked} />
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-5 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Saldo awal tiap kantong dicatat sebagai pemasukan &quot;Saldo awal&quot;. Kantong hanya bisa diarsipkan bila saldonya nol. Lencana warna bank hanya penanda, bukan logo resmi.
      </p>
    </>
  );
}
