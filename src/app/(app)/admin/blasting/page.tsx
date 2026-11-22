import { loadBlastOptions, type BlastOptions } from "@/lib/blast";
import { emailConfigured } from "@/lib/email";
import { waConfigured } from "@/lib/whatsapp";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { BlastForm } from "./form";

export const metadata = { title: "Admin · Blasting" };
export const maxDuration = 60;

type Row = { id: string; channel: string; subject: string | null; message: string; summary: string | null; recipients: number; sent: number; failed: number; status: string; created_at: string };

const DEMO_OPTIONS: BlastOptions = {
  features: [
    { key: "fin_transactions", label: "Mencatat keuangan", users: 8 },
    { key: "dreams", label: "Membuat impian (Dream Planner)", users: 14 },
    { key: "__pending_order", label: "Punya pesanan belum dibayar", users: 0 },
  ],
  tests: [
    { key: "cek-posisi", label: "Cek Posisi", users: 20 },
    { key: "disc", label: "Tes DISC", users: 11 },
  ],
  courses: [{ id: "demo", title: "Personal Mapping: Kenali Diri" }],
};

export default async function AdminBlasting() {
  let options = DEMO_OPTIONS;
  let rows: Row[] = [];
  let failed = false;
  if (!isDemoMode) {
    const supabase = await createClient();
    const [o, r] = await Promise.all([loadBlastOptions(supabase).catch(() => null), supabase.from("blasts").select("*").order("created_at", { ascending: false }).limit(30)]);
    failed = !o || !!r.error;
    options = o ?? { features: [], tests: [], courses: [] };
    rows = (r.data ?? []) as Row[];
  }
  return (
    <div className="space-y-5">
      {failed && <p className="card p-4 text-sm text-danger">Jalankan SQL tahap 18 (018_blasting.sql) dulu di Supabase.</p>}
      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Blasting email & WhatsApp</h2>
        <p className="mt-1 text-sm text-muted">
          Kirim pesan ke kelompok member tertentu untuk remarketing. Hanya dikirim ke member yang mengizinkan: WA ke yang mencentang izin WhatsApp, email ke yang tidak berhenti berlangganan. Daftar fitur di filter ikut bertambah otomatis saat ada fitur baru.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${emailConfigured() || isDemoMode ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>Email {emailConfigured() || isDemoMode ? "siap" : "belum siap (isi RESEND_API_KEY)"}</span>
          <span className={`rounded-full px-3 py-1 ${waConfigured() || isDemoMode ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>WhatsApp {waConfigured() || isDemoMode ? "siap" : "belum siap (isi FONNTE_TOKEN)"}</span>
        </div>
        <BlastForm options={options} />
      </section>

      <section className="card p-5 lg:p-6">
        <h2 className="font-bold text-heading">Riwayat blasting</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Belum ada blasting.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {rows.map((b) => (
              <li key={b.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${b.channel === "email" ? "bg-brand/10 text-brand" : "bg-[#25D366]/15 text-[#128C7E]"}`}>{b.channel === "email" ? "Email" : "WhatsApp"}</span>
                  <span className="font-semibold text-heading">{b.subject || b.message.slice(0, 60)}</span>
                  <span className="text-xs text-muted">{new Date(b.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Target: {b.summary} · {b.sent}/{b.recipients} terkirim{b.failed ? ` · ${b.failed} gagal` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
