import { LegalPage } from "@/components/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kebijakan Pengembalian Dana" };

export default function RefundPage() {
  return (
    <LegalPage
      title="Kebijakan Pengembalian Dana"
      updated="27 November 2026"
      intro="Kami ingin setiap pembelian di EClub terasa aman. Halaman ini menjelaskan kapan dana bisa dikembalikan dan bagaimana caranya, dalam bahasa yang sederhana."
      sections={[
        {
          h: "Produk yang dijual",
          p: [
            [
              "EClub Plus (langganan bulanan atau tahunan): akses fitur lanjutan di aplikasi EClub.",
              "Laporan lengkap Tes Gaya Diri dan kelas (course) berbayar: produk digital yang langsung bisa diakses setelah pembayaran dikonfirmasi.",
              "Mentoring 1-on-1 dan event: layanan dengan jadwal tertentu.",
            ],
          ],
        },
        {
          h: "Kapan dana dikembalikan",
          p: [
            [
              "Pembayaran terpotong dua kali, atau nominal yang Anda bayar lebih besar dari tagihan: kelebihannya kami kembalikan penuh.",
              "Pembayaran sudah berhasil, tetapi paket atau produk tidak aktif dan tidak bisa kami perbaiki dalam 3 hari kerja: dana dikembalikan penuh.",
              "EClub membatalkan sesi mentoring atau event: Anda bisa memilih jadwal ulang atau pengembalian dana penuh.",
              "EClub Plus yang baru dibeli dan belum dipakai sama sekali, dengan permintaan paling lambat 3 hari setelah aktif: dana dikembalikan penuh.",
            ],
          ],
        },
        {
          h: "Yang tidak dapat dikembalikan",
          p: [
            [
              "Langganan Plus yang sudah dipakai. Anda tetap bisa memakai Plus sampai periodenya berakhir, dan langganan tidak diperpanjang otomatis.",
              "Laporan Gaya Diri atau kelas yang sudah dibuka, karena produk digital sudah diterima.",
              "Mentoring atau event yang tidak Anda hadiri tanpa pemberitahuan paling lambat 24 jam sebelumnya.",
            ],
          ],
        },
        {
          h: "Cara mengajukan",
          p: [
            "Hubungi tim EClub lewat WhatsApp di bawah dengan menyebutkan kode pesanan, email akun, dan alasan pengajuan. Lampirkan bukti pembayaran bila ada.",
            "Kami menjawab paling lambat 2 hari kerja. Bila disetujui, dana dikembalikan ke rekening atau metode pembayaran asal paling lambat 7 hari kerja. Waktu masuknya dana dapat berbeda tergantung bank atau penyedia pembayaran.",
          ],
        },
      ]}
    />
  );
}
