import { LegalPage } from "@/components/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      updated="21 November 2026"
      intro="EClub Indonesia (EClub) menghargai privasi Anda. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, bagaimana kami menjaganya, dan hak Anda atas data tersebut, dengan mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi."
      sections={[
        {
          h: "Data yang kami kumpulkan",
          p: [
            [
              "Data akun: nama, email, dan kata sandi (disimpan dalam bentuk terenkripsi).",
              "Data diri: nomor WhatsApp, tanggal lahir, provinsi, dan kota/kabupaten domisili.",
              "Data yang Anda isi di aplikasi: mimpi, target, aksi harian, kebiasaan, jurnal syukur, catatan keuangan, produk dan HPP, jawaban tes, serta tulisan di komunitas.",
              "Data transaksi: pesanan, pembayaran, kupon, dan komisi affiliate.",
              "Data perangkat untuk notifikasi HP: alamat langganan notifikasi dari browser Anda.",
            ],
          ],
        },
        {
          h: "Untuk apa data digunakan",
          p: [
            [
              "Menjalankan fitur EClub, seperti menghitung target harian, menampilkan progres, dan merekomendasikan kelas sesuai tahap Anda.",
              "Mengirim notifikasi yang Anda setujui: penyemangat pagi, konfirmasi pembayaran, pengingat jadwal, perpanjangan, dan ucapan ulang tahun.",
              "Menginformasikan event di kota tempat Anda tinggal.",
              "Memproses pembayaran, kupon, dan komisi affiliate.",
              "Meningkatkan layanan berdasarkan data penggunaan yang dirangkum, tanpa membuka isi pribadi Anda.",
            ],
          ],
        },
        {
          h: "Siapa yang bisa melihat data Anda",
          p: [
            "Setiap akun hanya bisa mengakses datanya sendiri. Tim admin EClub dapat melihat data akun dan transaksi untuk keperluan layanan, tetapi tidak membaca isi mimpi, jawaban tes, atau catatan pribadi Anda kecuali Anda memintanya untuk keperluan bantuan.",
            "Tulisan yang Anda bagikan di Komunitas dapat dilihat oleh member lain beserta nama Anda.",
          ],
        },
        {
          h: "Pihak ketiga yang membantu kami",
          p: [
            "Kami memakai penyedia layanan tepercaya untuk menjalankan EClub, yaitu penyimpanan data dan login (Supabase), hosting aplikasi (Vercel), pengiriman WhatsApp (Fonnte), pengiriman email, dan layanan AI untuk fitur AI Companion. Mereka hanya memproses data sesuai keperluan layanan tersebut. Kami tidak menjual data Anda kepada siapa pun.",
          ],
        },
        {
          h: "Penyimpanan dan keamanan",
          p: [
            "Data disimpan di server penyedia layanan dengan koneksi terenkripsi dan aturan akses per akun. Kami menyimpan data selama akun Anda aktif. Jika akun dihapus, data pribadi Anda kami hapus atau anonimkan, kecuali data transaksi yang wajib kami simpan sesuai ketentuan hukum.",
          ],
        },
        {
          h: "Hak Anda",
          p: [
            [
              "Melihat dan memperbarui data diri Anda kapan saja di menu Profil.",
              "Mematikan notifikasi WhatsApp di Profil dan notifikasi HP di pengaturan browser atau Profil.",
              "Meminta salinan data atau penghapusan akun dengan menghubungi kami.",
              "Menarik persetujuan pemrosesan data tertentu, dengan konsekuensi beberapa fitur mungkin tidak dapat digunakan.",
            ],
          ],
        },
        {
          h: "Perubahan kebijakan",
          p: ["Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan penting akan kami umumkan di aplikasi sebelum berlaku."],
        },
      ]}
    />
  );
}
