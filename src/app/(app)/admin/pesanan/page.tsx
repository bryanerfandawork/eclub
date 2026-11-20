import { adminCancelOrder, adminMarkPaid } from "@/app/actions/orders";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Pesanan" };

type Row = { id: string; title: string; amount: number; status: string; created_at: string; paid_at: string | null; provider: string; user_id: string; expires_at: string };

const STATUS: Record<string, string> = { pending: "Menunggu", paid: "Lunas", expired: "Kedaluwarsa", cancelled: "Dibatalkan" };
const TONE: Record<string, string> = { pending: "bg-gold-soft text-brand", paid: "bg-success/10 text-success", expired: "bg-paper text-muted", cancelled: "bg-paper text-muted" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  let rows: Row[] = [];
  let emails: Record<string, string> = {};
  if (!isDemoMode) {
    const supabase = await createClient();
    let q = supabase.from("orders").select("id, title, amount, status, created_at, paid_at, provider, user_id, expires_at").order("created_at", { ascending: false }).limit(100);
    if (status) q = q.eq("status", status);
    const { data } = await q;
    rows = (data ?? []) as Row[];
    const { data: users } = await supabase.rpc("admin_list_users", { search: "", lim: 200, off: 0 });
    emails = Object.fromEntries(((users as { id: string; email: string }[]) ?? []).map((u) => [u.id, u.email]));
  }
  const paidTotal = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const d = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

  return (
    <section className="card p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          {["", "pending", "paid", "expired"].map((s) => (
            <a key={s} href={s ? `?status=${s}` : "?"} className={`rounded-full px-3 py-1.5 font-semibold ${status === s ? "bg-brand text-white" : "bg-paper text-muted hover:text-heading"}`}>
              {s ? STATUS[s] : "Semua"}
            </a>
          ))}
        </div>
        <p className="text-sm text-muted">
          Total lunas (tampilan ini): <b className="text-heading">Rp{paidTotal.toLocaleString("id-ID")}</b>
        </p>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-heading">{r.title}</p>
              <p className="truncate text-xs text-muted">
                {emails[r.user_id] ?? r.user_id.slice(0, 8)} · {d(r.created_at)}
                {r.paid_at && ` · lunas ${d(r.paid_at)} (${r.provider})`}
              </p>
            </div>
            <p className="font-bold text-heading">Rp{r.amount.toLocaleString("id-ID")}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TONE[r.status]}`}>{STATUS[r.status]}</span>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <form action={adminMarkPaid}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white">Tandai lunas</button>
                </form>
                <form action={adminCancelOrder}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted">Batalkan</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">Belum ada pesanan.</p>}
    </section>
  );
}
