import { LegalPage } from "@/components/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Syarat & Ketentuan" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      updated="21 November 2026"
      intro="Dengan mendaftar dan menggunakan EClub, Anda menyetujui syarat dan ketentuan berikut. Mohon dibaca dengan saksama."
      sections={[
        {
          h: "Tentang layanan",
          p: [
            "EClub adalah aplikasi pendamping pengembangan diri dan usaha. Isi kelas, artikel, tes, kalkulator, dan AI Companion bersifat edukasi dan alat bantu refleksi. Tes 8 Wheel Entrepreneur dan Cek Posisi adalah instrumen refleksi, bukan tes psikologi klinis. Hasil perhitungan target dan keuangan adalah perkiraan berdasarkan data yang Anda masukkan. Keputusan usaha dan investasi tetap menjadi tanggung jawab Anda.",
          ],
        },
        {
          h: "Akun",
          p: [
            [
              "Anda wajib memberikan data yang benar dan menjaga kerahasiaan kata sandi.",
              "Satu akun untuk satu orang dan tidak boleh dipindahtangankan.",
              "Kami dapat menangguhkan akun yang melanggar ketentuan ini atau digunakan untuk tindakan melawan hukum.",
            ],
          ],
        },
        {
          h: "EClub Plus dan pembayaran",
          p: [
            [
              "EClub Plus berlaku sesuai periode yang dibeli (bulanan atau tahunan) sejak pembayaran dikonfirmasi.",
              "Harga dapat berubah sewaktu-waktu. Perubahan tidak memengaruhi periode yang sudah dibayar.",
              "Pengembalian dana mengikuti Kebijakan Pengembalian Dana di eclub.co.id/kebijakan-pengembalian.",
              "Langganan tidak diperpanjang otomatis. Anda memilih sendiri kapan memperpanjang.",
              "Kelas, laporan, mentoring, dan event yang dibeli satuan berlaku sesuai keterangan pada halaman pembeliannya.",
            ],
          ],
        },
        {
          h: "Mentoring dan event",
          p: [
            "Jadwal mentoring dan event dapat berubah karena keadaan tertentu. Jika EClub membatalkan sesi, Anda berhak atas penjadwalan ulang atau pengembalian dana. Jika Anda berhalangan, beri tahu kami paling lambat 24 jam sebelumnya untuk dijadwalkan ulang.",
          ],
        },
        {
          h: "Program affiliate dan kupon",
          p: [
            [
              "Program affiliate tersedia bagi member Plus yang aktif. Besaran komisi dan potongan kupon mengikuti pengaturan yang tampil di menu Affiliate.",
              "Komisi dihitung dari transaksi yang sudah dibayar dan dapat dicairkan sesuai ketentuan minimal pencairan.",
              "Dilarang membeli lewat link atau kupon sendiri, membuat akun palsu, atau mempromosikan EClub dengan klaim yang menyesatkan. Komisi dari pelanggaran akan dibatalkan.",
            ],
          ],
        },
        {
          h: "Komunitas",
          p: [
            "Hormati sesama member. Dilarang memposting ujaran kebencian, SARA, pornografi, penipuan, spam, atau promosi berlebihan. Admin berhak menghapus tulisan dan menangguhkan akun yang melanggar.",
          ],
        },
        {
          h: "Hak kekayaan intelektual",
          p: [
            "Seluruh materi kelas, artikel, desain, dan merek EClub dilindungi hukum. Anda boleh memakainya untuk keperluan pribadi, tetapi tidak boleh menyalin, menjual, atau menyebarkannya tanpa izin tertulis. Data dan tulisan yang Anda masukkan tetap milik Anda.",
          ],
        },
        {
          h: "Batasan tanggung jawab",
          p: [
            "Kami berusaha menjaga EClub tetap tersedia dan akurat, tetapi tidak menjamin layanan bebas gangguan. EClub tidak bertanggung jawab atas kerugian usaha atau investasi yang timbul dari keputusan yang Anda ambil berdasarkan materi di aplikasi.",
          ],
        },
        {
          h: "Perubahan dan hukum yang berlaku",
          p: ["Syarat ini dapat diperbarui sewaktu-waktu dan perubahan penting akan diumumkan di aplikasi. Syarat ini tunduk pada hukum Republik Indonesia."],
        },
      ]}
    />
  );
}
