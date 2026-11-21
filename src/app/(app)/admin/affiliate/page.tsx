import { adminProcessPayout } from "@/app/actions/affiliate";
import { rupiah } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Affiliate" };

type Payout = { id: string; name: string | null; whatsapp: string | null; amount: number; bank: string; status: string; note: string | null; created_at: string; processed_at: string | null };
type Top = { name: string | null; code: string | null; referrals: number; earned: number };
type Data = { payouts: Payout[]; top: Top[]; total_commission: number; total_paid: number };

export default async function AdminAffiliate() {
  let data: Data = { payouts: [], top: [], total_commission: 0, total_paid: 0 };
  let ready = true;
  if (!isDemoMode) {
    const supabase = await createClient();
    const res = await supabase.rpc("admin_payouts");
    if (res.error) {
      ready = false;
      console.error("admin_payouts", res.error.message);
    }
    else data = res.data as Data;
  }
  const d = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  const waiting = data.payouts.filter((p) => p.status === "requested");

  if (!ready) return <section className="card p-6 text-sm text-muted">Data affiliate belum bisa dimuat. Pastikan SQL tahap 9 (WhatsApp) dan tahap 13 sudah dijalankan.</section>;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total komisi tercatat", rupiah(data.total_commission)],
          ["Sudah ditransfer", rupiah(data.total_paid)],
          ["Menunggu diproses", `${waiting.length} permintaan · ${rupiah(waiting.reduce((s, p) => s + p.amount, 0))}`],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-xs text-muted">{l}</p>
            <p className="mt-1 font-bold text-heading">{v}</p>
          </div>
        ))}
      </div>
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Permintaan pencairan</h2>
        <p className="mt-1 text-sm text-muted">Transfer manual ke rekening member, lalu klik “Sudah ditransfer”. Member otomatis dikabari lewat WhatsApp.</p>
        {data.payouts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Belum ada permintaan.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {data.payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3.5 text-sm">
                <span className="min-w-[200px] flex-1">
                  <b className="text-heading">{p.name ?? "Member"}</b> · {rupiah(p.amount)}
                  <span className="block text-xs text-muted">
                    {p.bank} · {d(p.created_at)}
                    {p.whatsapp ? ` · WA ${p.whatsapp}` : ""}
                  </span>
                </span>
                {p.status === "requested" ? (
                  <span className="flex flex-wrap gap-2">
                    <form action={adminProcessPayout}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="paid" />
                      <button className="btn-primary py-1.5">Sudah ditransfer</button>
                    </form>
                    <form action={adminProcessPayout} className="flex gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <input name="note" className="input w-36 py-1.5 text-xs" placeholder="Alasan tolak" />
                      <button className="btn-ghost py-1.5">Tolak</button>
                    </form>
                  </span>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "paid" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {p.status === "paid" ? "Ditransfer" : "Ditolak"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {data.top.length > 0 && (
        <section className="card p-5 lg:p-6">
          <h2 className="font-bold text-heading">Affiliate teratas</h2>
          <ul className="mt-2 divide-y divide-line text-sm">
            {data.top.map((t) => (
              <li key={t.code} className="flex justify-between py-2.5">
                <span>
                  <b className="text-heading">{t.name}</b> <span className="text-muted">({t.code}) · {t.referrals} teman</span>
                </span>
                <b className="text-success">{rupiah(t.earned)}</b>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
