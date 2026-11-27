import Link from "next/link";
import { getBooks } from "@/lib/finance-server";

/** Ruang Kerja perusahaan ↔ buku keuangan usaha (SQL 029). Hanya tampil untuk yang punya akses ke buku itu. */
export async function WsFinanceLink({ ws, kind, owner }: { ws: string; kind: string; owner: boolean }) {
  if (kind !== "company") return null;
  const books = (await getBooks()).filter((b) => b.status === "active" && b.kind === "business");
  const linked = books.find((b) => b.workspace_id === ws);
  if (linked)
    return (
      <Link href={`/keuangan?b=${linked.id}`} className="mt-2 mr-2 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-brand">
        💰 Keuangan usaha: {linked.name} ›
      </Link>
    );
  if (!owner || !books.some((b) => b.mine)) return null;
  return (
    <Link href="/keuangan/buku" className="mt-2 mr-2 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted hover:text-brand">
      💰 Hubungkan ke buku keuangan usaha ›
    </Link>
  );
}
