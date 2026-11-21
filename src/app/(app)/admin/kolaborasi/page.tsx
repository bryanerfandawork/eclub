import { adminSetInquiry } from "@/app/actions/collab";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Kolaborasi" };

type Inq = { id: string; kind: string; name: string; organization: string | null; whatsapp: string; participants: number | null; city: string | null; message: string | null; status: string; created_at: string };
const KIND: Record<string, string> = { inhouse: "In-house training", workshop: "Workshop / seminar", speaker: "Undang pembicara", partner: "Kemitraan", lainnya: "Lainnya" };
const STATUS = ["baru", "dihubungi", "deal", "batal"];

export default async function AdminKolaborasi() {
  let rows: Inq[] = [];
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.from("collab_inquiries").select("*").order("created_at", { ascending: false }).limit(100);
    rows = (data ?? []) as Inq[];
  }
  return (
    <section className="card p-5 lg:p-6">
      <h2 className="font-bold text-heading">Permintaan in-house training & kolaborasi</h2>
      <p className="mt-1 text-sm text-muted">Masuk dari form di halaman depan. Admin juga dikabari lewat WhatsApp.</p>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Belum ada permintaan.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {rows.map((r) => {
            const wa = r.whatsapp.replace(/[^\d]/g, "").replace(/^0/, "62");
            return (
              <li key={r.id} className="flex flex-wrap items-start gap-3 py-3.5">
                <span className="min-w-[240px] flex-1">
                  <b className="text-heading">{r.name}</b>
                  {r.organization && <span className="text-muted"> · {r.organization}</span>}
                  <span className="block text-xs text-muted">
                    {KIND[r.kind]} {r.participants ? `· ${r.participants} peserta` : ""} {r.city ? `· ${r.city}` : ""} · {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                  {r.message && <span className="mt-1 block text-ink">“{r.message}”</span>}
                </span>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="btn bg-[#25D366] py-1.5 text-xs text-white">
                  Chat WA
                </a>
                <form action={adminSetInquiry} className="flex gap-1">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status} className="input w-auto py-1.5 text-xs">
                    {STATUS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button className="btn-ghost py-1.5 text-xs">Simpan</button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
