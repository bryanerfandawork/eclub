import { LegalPage } from "@/components/legal";
import { getSettings } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata = { title: "Syarat Program Affiliate" };

export default async function AffiliateTerms() {
  const s = await getSettings();
  const rate = Number(s.affiliate_rate) || 20;
  const disc = Number(s.coupon_discount) || 10;
  const hold = Number(s.affiliate_hold_days) || 7;
  const months = Number(s.affiliate_months) || 12;
  return (
    <LegalPage
      title="Syarat Program Affiliate"
      updated="22 November 2026"
      intro={`Singkatnya: bagikan link atau kode kupon Anda, teman hemat ${disc}%, dan Anda dapat komisi ${rate}% dari setiap pembelian mereka. Berikut aturan lengkapnya dalam bahasa sederhana.`}
      sections={[
        {
          h: "Siapa yang bisa ikut",
          p: [["Member EClub Plus yang masih aktif.", "Kode affiliate dan link Anda muncul otomatis di menu Affiliate. Tidak perlu mendaftar terpisah.", "Jika langganan Plus berakhir, komisi baru berhenti tercatat. Komisi yang sudah tercatat tetap milik Anda."]],
        },
        {
          h: "Cara teman tercatat sebagai ajakan Anda",
          p: [
            [
              "Lewat link: teman membuka link Anda (beranda, kelas, event, atau artikel mana pun) lalu mendaftar dalam 30 hari.",
              `Lewat kode kupon: teman memasukkan kode Anda di halaman pembayaran dan langsung hemat ${disc}%. Cara ini juga berlaku untuk orang yang sudah punya akun.`,
              "Jika teman datang lewat link orang lain tetapi memakai kode kupon Anda, komisi menjadi milik Anda (pemilik kupon).",
              "Memakai link atau kode sendiri tidak dihitung.",
            ],
          ],
        },
        {
          h: "Besar komisi",
          p: [
            [
              `${rate}% dari harga yang dibayar teman (setelah diskon kupon, tanpa 3 angka kode unik).`,
              "Berlaku untuk semua produk: EClub Plus, kelas berbayar, Laporan DISC, mentoring, dan event berbayar.",
              `Lewat link, Anda mendapat komisi dari pembelian teman selama ${months} bulan sejak ia mendaftar.`,
              `Contoh: teman membeli Plus tahunan Rp690.000 dengan kode Anda. Ia membayar Rp621.000, Anda mendapat Rp${Math.floor(621000 * rate / 100).toLocaleString("id-ID")}.`,
            ],
          ],
        },
        {
          h: "Pencairan",
          p: [
            [
              `Komisi tercatat saat pembayaran teman lunas, dan bisa dicairkan ${hold} hari kemudian (masa tunggu jika ada pembatalan).`,
              "Pencairan diajukan dari menu Affiliate dalam kelipatan Rp100.000.",
              "Admin mentransfer secara manual ke rekening yang Anda tulis saat mengajukan pencairan, lalu Anda dikabari lewat WhatsApp.",
              "Jika pembelian teman dibatalkan atau dikembalikan, komisinya ikut dibatalkan.",
            ],
          ],
        },
        {
          h: "Cara promosi yang diperbolehkan",
          p: [
            ["Berbagi ke teman, keluarga, grup, status WhatsApp, dan media sosial Anda sendiri.", "Menceritakan pengalaman nyata Anda memakai EClub.", "Membuat konten edukasi (video, tulisan) yang menyertakan link Anda."],
          ],
        },
        {
          h: "Yang tidak diperbolehkan",
          p: [
            [
              "Spam: mengirim pesan massal ke orang yang tidak dikenal atau tidak meminta.",
              "Menjanjikan hasil yang tidak pasti, misalnya \"pasti kaya\" atau \"pasti untung\".",
              "Mengaku sebagai pihak resmi EClub, atau memakai nama dan logo EClub untuk iklan berbayar tanpa izin.",
              "Membuat akun palsu atau membeli lewat kode sendiri untuk mendapat komisi.",
            ],
            "Pelanggaran dapat membuat komisi dibatalkan dan akses program affiliate dihentikan.",
          ],
        },
        {
          h: "Lain-lain",
          p: [
            [
              "Pajak atas penghasilan komisi menjadi tanggung jawab penerima.",
              "EClub dapat mengubah besar komisi atau aturan program. Perubahan diumumkan di halaman ini dan tidak berlaku mundur untuk komisi yang sudah tercatat.",
              "Ada pertanyaan? Hubungi admin EClub lewat WhatsApp di bawah.",
            ],
          ],
        },
      ]}
    />
  );
}
