import { getSettings } from "@/lib/plans";
import { PublicShell } from "@/components/public-shell";

export type Section = { h: string; p: (string | string[])[] };

/** Halaman legal sederhana. Kontak diambil dari No. WhatsApp admin di pengaturan. */
export async function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: Section[] }) {
  const st = await getSettings();
  const wa = String(st.admin_whatsapp ?? "").replace(/[^\d]/g, "").replace(/^0/, "62");
  return (
    <PublicShell>
      <article className="mx-auto max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">{title}</h1>
        <p className="mt-2 text-sm text-muted">Berlaku sejak {updated}</p>
        <p className="mt-6 leading-relaxed text-ink">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.h} className="mt-8">
            <h2 className="text-lg font-bold text-heading">
              {i + 1}. {s.h}
            </h2>
            {s.p.map((x, k) =>
              Array.isArray(x) ? (
                <ul key={k} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink marker:text-brand">
                  {x.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={k} className="mt-3 text-[15px] leading-relaxed text-ink">{x}</p>
              ),
            )}
          </section>
        ))}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-heading">{sections.length + 1}. Hubungi kami</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">
            Pertanyaan tentang halaman ini bisa disampaikan kepada tim EClub Indonesia
            {wa ? (
              <>
                {" "}melalui WhatsApp{" "}
                <a href={`https://wa.me/${wa}`} className="font-semibold text-brand" target="_blank" rel="noopener noreferrer">
                  +{wa}
                </a>
              </>
            ) : (
              " melalui kontak yang tercantum di aplikasi"
            )}
            .
          </p>
        </section>
      </article>
    </PublicShell>
  );
}
