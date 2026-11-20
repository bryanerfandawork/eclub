import type { Assessment, Dimension, Question } from "./types";

/**
 * 8 Wheel Entrepreneur — instrumen draf EClub (versi 0.1).
 *
 * Disusun dengan mengacu pada kerangka kompetensi kewirausahaan yang umum dipakai
 * (EntreComp – Komisi Eropa, konsep entrepreneurial self-efficacy, growth mindset dari
 * Carol Dweck, grit dari Angela Duckworth, dan literasi keuangan dasar), lalu dipetakan
 * ke fase Sustainable Entrepreneur Framework (SURVIVE, SUSTAIN, SCALE UP, SPREAD UP).
 *
 * Ini BUKAN tes psikologi yang sudah tervalidasi secara ilmiah. Hasilnya adalah alat
 * refleksi diri. Validasi bisa dilakukan kemudian dengan data pengguna.
 */

type Item = [text: string, reverse?: boolean];

function dim(
  key: string,
  label: string,
  short: string,
  description: string,
  sef: string,
  high: string,
  mid: string,
  low: string,
  items: Item[],
): { d: Dimension; q: Question[] } {
  return {
    d: {
      key,
      label,
      short,
      description: `${description} (Fase SEF: ${sef})`,
      levels: [
        { min: 7.5, text: high },
        { min: 5, text: mid },
        { min: 0, text: low },
      ],
    },
    q: items.map(([text, reverse], i) => ({ id: `${key}${i + 1}`, dimension: key, text, reverse: reverse || undefined })),
  };
}

const parts = [
  dim(
    "visi",
    "Visi & Tujuan",
    "Visi",
    "Kejelasan arah: tahu apa yang ingin dicapai, mengapa, dan kapan.",
    "SURVIVE",
    "Arah Anda jelas dan tertulis. Jaga dengan meninjau target secara berkala.",
    "Anda punya gambaran tujuan, tetapi belum sepenuhnya spesifik atau terukur.",
    "Mulailah dengan menuliskan satu tujuan 12 bulan yang spesifik, lengkap dengan angka dan tanggal.",
    [
      ["Saya punya gambaran yang jelas tentang usaha atau karier yang ingin saya bangun dalam 3–5 tahun ke depan."],
      ["Target saya untuk tahun ini sudah tertulis dan memiliki angka yang terukur."],
      ["Saya tahu alasan mendalam mengapa saya ingin sukses, bukan sekadar ingin punya uang."],
      ["Saya sering berganti tujuan karena tidak yakin apa yang sebenarnya saya inginkan.", true],
      ["Keputusan sehari-hari saya biasanya selaras dengan tujuan jangka panjang saya."],
    ],
  ),
  dim(
    "mindset",
    "Pola Pikir Bertumbuh",
    "Mindset",
    "Keyakinan bahwa kemampuan bisa dikembangkan lewat belajar dan usaha.",
    "SURVIVE",
    "Anda melihat tantangan sebagai kesempatan belajar. Ini fondasi kuat seorang entrepreneur.",
    "Anda terbuka belajar, tetapi kadang ragu pada kemampuan diri saat menghadapi hal baru.",
    "Latih diri melihat kegagalan sebagai data. Mulai dari satu keterampilan baru yang dipelajari rutin.",
    [
      ["Saya yakin kemampuan berbisnis bisa dipelajari, bukan bakat bawaan semata."],
      ["Saya aktif meminta masukan, termasuk kritik, untuk memperbaiki diri."],
      ["Setiap bulan saya meluangkan waktu untuk belajar hal baru yang berguna bagi usaha atau karier saya."],
      ["Jika sesuatu terasa sulit, saya cenderung menyimpulkan bahwa saya memang tidak berbakat di bidang itu.", true],
      ["Saya merasa terinspirasi, bukan terancam, oleh keberhasilan orang lain."],
    ],
  ),
  dim(
    "tangguh",
    "Ketangguhan & Daya Juang",
    "Tangguh",
    "Kemampuan bangkit dari kegagalan dan tetap tekun pada tujuan jangka panjang.",
    "SURVIVE",
    "Anda tangguh dan tekun. Pastikan tetap menjaga energi dan kesehatan agar tidak kelelahan.",
    "Anda cukup tahan banting, tetapi motivasi bisa turun saat hasil tidak segera terlihat.",
    "Bangun kebiasaan kecil yang konsisten dan rayakan kemajuan kecil agar tetap bergerak.",
    [
      ["Saya tetap melanjutkan rencana meskipun hasilnya belum terlihat dalam beberapa bulan."],
      ["Setelah mengalami kegagalan, saya bisa bangkit dan mencoba lagi dengan cara berbeda."],
      ["Saya mudah menyerah ketika menghadapi penolakan atau kritik.", true],
      ["Saya menyelesaikan apa yang sudah saya mulai."],
      ["Saya mampu tetap tenang dan berpikir jernih saat berada di bawah tekanan."],
    ],
  ),
  dim(
    "peluang",
    "Kreativitas & Peluang",
    "Peluang",
    "Kepekaan menemukan masalah yang layak diselesaikan dan ide untuk menciptakan nilai.",
    "SURVIVE",
    "Anda peka melihat peluang. Fokuskan pada ide yang paling sesuai dengan sumber daya Anda.",
    "Anda punya ide, tetapi belum rutin mengujinya langsung ke calon pelanggan.",
    "Mulailah mencatat masalah yang sering dikeluhkan orang di sekitar Anda. Di situlah peluang dimulai.",
    [
      ["Saya sering melihat masalah di sekitar saya sebagai peluang usaha."],
      ["Saya terbiasa menguji ide secara kecil-kecilan sebelum mengeluarkan modal besar."],
      ["Saya mengikuti perkembangan tren, teknologi, dan kebutuhan pasar di bidang saya."],
      ["Saya lebih nyaman meniru cara lama daripada mencoba pendekatan baru.", true],
      ["Saya bisa menjelaskan apa yang membuat produk atau jasa saya berbeda dari yang lain."],
    ],
  ),
  dim(
    "pasar",
    "Pemasaran & Penjualan",
    "Pemasaran",
    "Kemampuan memahami pelanggan, menawarkan nilai, dan menghasilkan pendapatan.",
    "SURVIVE (Acquisition)",
    "Anda paham cara mendapatkan pelanggan. Saatnya membuat prosesnya lebih sistematis.",
    "Anda bisa menjual, tetapi belum punya cara yang konsisten untuk mendatangkan pelanggan.",
    "Prioritaskan berbicara langsung dengan calon pelanggan dan buat satu penawaran yang jelas.",
    [
      ["Saya tahu dengan jelas siapa pelanggan ideal saya dan apa kebutuhan utamanya."],
      ["Saya punya cara rutin untuk mendatangkan calon pelanggan setiap minggu."],
      ["Saya merasa canggung atau enggan ketika harus menawarkan produk/jasa saya.", true],
      ["Saya melakukan follow-up kepada calon pelanggan yang belum membeli."],
      ["Saya mengukur hasil promosi (misalnya jumlah prospek atau penjualan) untuk menentukan langkah berikutnya."],
    ],
  ),
  dim(
    "uang",
    "Literasi Keuangan",
    "Keuangan",
    "Kemampuan mengelola uang pribadi dan usaha, membaca angka, dan mengambil keputusan finansial.",
    "SUSTAIN",
    "Pengelolaan keuangan Anda baik. Lanjutkan ke perencanaan investasi dan pertumbuhan.",
    "Anda cukup memperhatikan keuangan, tetapi pencatatan dan pemisahannya belum rapi.",
    "Mulailah memisahkan uang pribadi dan usaha, lalu catat setiap pemasukan dan pengeluaran.",
    [
      ["Saya memisahkan uang pribadi dan uang usaha (atau tabungan tujuan) dengan jelas."],
      ["Saya mencatat pemasukan dan pengeluaran secara rutin."],
      ["Saya tahu berapa keuntungan bersih (bukan hanya omzet) yang saya hasilkan setiap bulan."],
      ["Saya sering kehabisan uang sebelum akhir bulan tanpa tahu ke mana perginya.", true],
      ["Saya memiliki dana darurat atau cadangan untuk menghadapi kondisi tak terduga."],
    ],
  ),
  dim(
    "sistem",
    "Sistem & Produktivitas",
    "Sistem",
    "Kemampuan merencanakan, membuat kebiasaan kerja, dan membangun proses yang bisa diulang.",
    "SUSTAIN (Systemation)",
    "Anda terorganisasi. Mulailah mendokumentasikan proses agar bisa didelegasikan.",
    "Anda cukup produktif, tetapi banyak pekerjaan masih bergantung pada ingatan dan diri Anda sendiri.",
    "Mulai dengan rencana mingguan sederhana dan satu SOP untuk pekerjaan yang paling sering diulang.",
    [
      ["Saya merencanakan prioritas pekerjaan setiap minggu."],
      ["Pekerjaan rutin saya punya langkah-langkah standar (SOP) yang tertulis."],
      ["Saya sering menunda pekerjaan penting sampai mendekati tenggat.", true],
      ["Saya menggunakan alat bantu (aplikasi, catatan, atau checklist) untuk mengelola pekerjaan."],
      ["Usaha atau pekerjaan saya tetap bisa berjalan beberapa hari meskipun saya tidak terlibat langsung."],
    ],
  ),
  dim(
    "jejaring",
    "Kepemimpinan & Jejaring",
    "Jejaring",
    "Kemampuan bekerja sama, memimpin orang lain, dan membangun relasi yang saling menguntungkan.",
    "SCALE UP & SPREAD UP",
    "Anda punya pengaruh dan relasi yang baik. Manfaatkan untuk kolaborasi dan dampak yang lebih luas.",
    "Anda bisa bekerja sama, tetapi jejaring dan kemampuan mendelegasikan masih bisa diperluas.",
    "Mulailah hadir di satu komunitas yang relevan dan belajar mendelegasikan satu tugas kecil.",
    [
      ["Saya punya jejaring orang yang bisa saya mintai saran atau bantuan untuk usaha/karier saya."],
      ["Saya mampu mendelegasikan pekerjaan dan memercayai orang lain untuk menyelesaikannya."],
      ["Saya lebih suka mengerjakan semuanya sendiri daripada bekerja sama dengan orang lain.", true],
      ["Saya aktif membangun relasi baru, misalnya melalui komunitas, acara, atau media sosial."],
      ["Orang lain cenderung termotivasi ketika bekerja bersama saya."],
    ],
  ),
];

export const eightWheel: Assessment = {
  key: "8-wheel-entrepreneur",
  title: "8 Wheel Entrepreneur",
  subtitle: "Peta kesiapan entrepreneur Anda",
  intro:
    "40 pernyataan tentang cara Anda berpikir dan bekerja. Jawab sesuai kondisi Anda saat ini, bukan yang Anda harapkan. Tidak ada jawaban benar atau salah. Disarankan diulang setiap 3 bulan untuk melihat perkembangan.",
  ready: true,
  retakeDays: 90,
  disclaimer: "Instrumen draf EClub untuk refleksi diri, bukan tes psikologi yang tervalidasi secara ilmiah.",
  dimensions: parts.map((p) => p.d),
  // Diselang-seling antardimensi agar jawaban tidak terpengaruh urutan.
  questions: [0, 1, 2, 3, 4].flatMap((i) => parts.map((p) => p.q[i])),
};
