import { Mail, MessageCircle } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getSettings } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kontak" };

const EMAIL = "eclubsukses@gmail.com";

export default async function ContactPage() {
  const s = await getSettings();
  const wa = String(s.admin_whatsapp ?? "").replace(/[^\d]/g, "").replace(/^0/, "62");
  const address = String(s.business_address ?? "").trim();
  return (
    <PublicShell>
      <article className="mx-auto max-w-2xl">
        <p className="eyebrow">Kontak</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">Hubungi EClub Indonesia</h1>
        <p className="mt-4 leading-relaxed text-ink">Ada pertanyaan soal akun, pembayaran, kelas, atau kerja sama? Tim kami siap membantu setiap hari kerja, pukul 09.00 sampai 17.00 WIB.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-5 hover:bg-paper">
              <MessageCircle className="h-6 w-6 text-success" />
              <span>
                <span className="block text-sm text-muted">WhatsApp</span>
                <span className="font-semibold text-heading">+{wa}</span>
              </span>
            </a>
          )}
          <a href={`mailto:${EMAIL}`} className="card flex items-center gap-3 p-5 hover:bg-paper">
            <Mail className="h-6 w-6 text-brand" />
            <span>
              <span className="block text-sm text-muted">Email</span>
              <span className="font-semibold text-heading">{EMAIL}</span>
            </span>
          </a>
        </div>
        {address && (
          <p className="mt-6 text-[15px] leading-relaxed text-ink">
            <b className="text-heading">Alamat:</b> {address}
          </p>
        )}
      </article>
    </PublicShell>
  );
}
