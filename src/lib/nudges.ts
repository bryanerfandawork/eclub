/**
 * Kalimat notifikasi HP sore/malam (19.00 WIB) dan pengingat untuk member yang lama tidak membuka EClub.
 * Dipilih bergilir per hari agar tidak membosankan.
 */

export const EVENING: [string, string][] = [
  ["Hari ini sudah ngapain aja? 📝", "Centang progres harian Anda, cuma 30 detik. Besok-Anda akan berterima kasih."],
  ["Psst… streak Anda manggil 🔥", "Jangan biarkan api kecilnya padam malam ini. Yuk centang aksi hari ini."],
  ["Laporan harian, Bos! 🫡", "Satu langkah kecil hari ini tetap langkah. Catat sebelum lupa."],
  ["Impian Anda nanya kabar 👀", "\"Hari ini aku dikerjain nggak?\" Jawab dengan satu centang di EClub."],
  ["Waktunya rekap 5 menit ⏱️", "Sambil rebahan juga bisa. Update progres dan uang masuk-keluar hari ini."],
  ["Jangan tidur dulu! 😴", "Eh, boleh kok. Tapi centang progres dulu ya, biar tidurnya lebih nyenyak."],
  ["Hari ini menang di mana? 🏆", "Sekecil apa pun, catat. Kemenangan kecil yang dicatat jadi bahan bakar besok."],
  ["Kopi sore ☕ + EClub", "Pasangan yang pas. Cek aksi harian Anda yang belum selesai."],
  ["Uang hari ini lari ke mana? 💸", "Catat di Keuangan sebelum lupa. Dompet yang tercatat lebih tenang."],
  ["Satu centang = satu bata 🧱", "Rumah impian dibangun bata demi bata. Pasang bata hari ini."],
  ["Absen dulu, Kak! ✋", "Progres harian Anda menunggu. Isi sebentar, lalu lanjut santai."],
  ["Mumpung masih ingat 🧠", "Apa satu hal yang berhasil hari ini? Tulis di EClub, cuma sebentar."],
  ["Hari yang berat? 🤗", "Tidak apa-apa. Buka EClub, tulis satu hal yang disyukuri hari ini."],
  ["Konsisten itu keren 😎", "Orang sukses bukan yang paling hebat, tapi yang paling rutin. Centang hari ini!"],
  ["Tinggal sedikit lagi! 🎯", "Masih ada aksi harian yang belum dicentang. Yuk tuntaskan."],
  ["Tim Rebahan, merapat! 🛋️", "Update progres bisa sambil rebahan. Serius, cuma 3 ketukan."],
  ["Si Kecil Bernama Kebiasaan 🌱", "Sudah disiram hari ini? Cek kebiasaan Anda di EClub."],
  ["Hari ini dihitung, lho 📈", "Grafik progres Anda menunggu titik baru. Jangan sampai bolong."],
  ["Sebelum scroll medsos… 📱", "Mampir 1 menit ke EClub dulu. Impian Anda lebih penting dari FYP."],
  ["Rapor hari ini 📒", "Nilai A untuk yang mau mencatat. Isi progres Anda sekarang."],
  ["Masa depan Anda titip pesan 💌", "\"Terima kasih sudah tidak menyerah hari ini.\" Catat langkahnya."],
  ["Ding dong! 🔔", "Pengingat ramah: progres harian belum diperbarui."],
  ["Bisnis sehat dimulai dari catatan 🩺", "Penjualan hari ini berapa? Catat di Keuangan biar laba ruginya jelas."],
  ["Spark-nya jangan redup ✨", "Lihat lagi impian Anda malam ini. Masih semangat, kan?"],
  ["Satu langkah lagi menuju target 🚶", "Cek Target Harian Anda. Hari ini sudah tercapai?"],
  ["Ayo tutup hari dengan manis 🍯", "Centang aksi, tulis syukur, lalu istirahat dengan tenang."],
  ["Hai, pejuang! 💪", "Capek itu tanda Anda bergerak. Catat gerakannya di EClub."],
  ["Jangan biarkan hari ini hilang 🕰️", "Hari ini tidak akan terulang. Abadikan progresnya."],
  ["Kuis singkat 🤔", "Aksi apa yang paling berdampak hari ini? Jawabannya tulis di EClub."],
  ["Teman bertumbuh Anda di sini 🤝", "EClub kangen. Mampir sebentar, update progres hari ini."],
  ["Sudah makan? Sudah centang? 🍛", "Yang pertama penting, yang kedua juga. Yuk centang progres."],
  ["Mini-evaluasi malam 🌙", "Apa yang berjalan baik? Apa yang mau diperbaiki besok? Tulis singkat saja."],
  ["Streak itu seperti tanaman 🪴", "Sehari tidak disiram, layu. Siram dengan satu centang malam ini."],
  ["Bukan sekadar pengingat 😉", "Ini ajakan untuk bangga pada diri sendiri. Lihat progres Anda hari ini."],
  ["Pengusaha hebat punya catatan 📚", "Catat hari ini, pelajari besok, menang lusa."],
  ["3 ketukan saja ☝️", "Buka, centang, selesai. Progres harian Anda beres."],
  ["Ada yang belum dicentang 👀", "Kami tidak akan bilang siapa. Tapi Anda tahu. 😄"],
  ["Mimpi besar, langkah kecil 🐾", "Langkah kecil hari ini sudah dicatat belum?"],
  ["Waktunya me-time produktif 🧘", "5 menit refleksi di EClub. Pikiran lebih jernih, besok lebih fokus."],
  ["Kabar baik! 📣", "Hari ini masih bisa ditutup dengan progres. Ayo!"],
  ["Uang kecil, catatan besar 🪙", "Pengeluaran kecil yang tidak dicatat jadi bocor besar. Catat sekarang."],
  ["Dari Anda, untuk Anda 🎁", "Hadiah terbaik untuk diri sendiri: konsisten. Centang hari ini."],
  ["Sudah sejauh ini 🛣️", "Jangan berhenti di sini. Update progres dan lihat seberapa jauh Anda melangkah."],
  ["Malam santai, pikiran tenang 🌌", "Tenang karena semua sudah tercatat. Yuk rapikan progres hari ini."],
  ["Coba tebak? 🎲", "Hari ini adalah hari yang tepat untuk mencentang progres. Selalu."],
  ["Panggilan dari Dream Planner 📞", "Impian Anda butuh update. Sudah sampai mana?"],
  ["Semangat penutup hari 🌇", "Satu centang malam ini, satu senyum besok pagi."],
  ["Investasi 1 menit ⏳", "Hasilnya: kejelasan, konsistensi, dan kemajuan. Update progres sekarang."],
  ["Hari ini Anda luar biasa 🌟", "Buktikan dengan catatan. Buka EClub sebentar."],
  ["Jangan sampai bolong 🕳️", "Kalender progres Anda masih kosong hari ini. Isi yuk."],
];

/** Pengingat untuk yang tidak membuka aplikasi beberapa hari. Kunci = hari tidak aktif. */
export const WINBACK: Record<number, [string, string][]> = {
  3: [
    ["Kami kangen 🥺", "Sudah 3 hari tidak mampir. Impian Anda masih menunggu, lho."],
    ["Halo, apa kabar? 👋", "3 hari tanpa kabar. Yuk mulai lagi dari satu langkah kecil hari ini."],
    ["Streak-nya putus? Tidak apa-apa 🔁", "Yang penting mulai lagi. Buka EClub dan centang satu aksi."],
  ],
  5: [
    ["Impian Anda nanya: \"Masih ingat aku?\" 💭", "Sudah 5 hari. Tengok sebentar, 1 menit saja."],
    ["Spark-nya mulai redup? ✨", "Nyalakan lagi. Lihat kembali alasan Anda memulai."],
    ["5 hari berlalu begitu cepat ⏩", "Yuk kembali ke jalur. Satu centang sudah cukup untuk memulai."],
  ],
  7: [
    ["Seminggu tanpa Anda 📅", "Rasanya sepi. Ada materi dan alat baru yang bisa membantu Anda."],
    ["Restart itu wajar 🔄", "Seminggu istirahat? Sekarang saat yang pas untuk mulai lagi."],
    ["Pintu selalu terbuka 🚪", "Sudah 7 hari. Progres Anda masih tersimpan rapi, tinggal lanjut."],
  ],
  14: [
    ["Dua minggu, masih ingat mimpinya? 🌠", "Kami simpan semua catatan Anda. Mampir dan lanjutkan, yuk."],
    ["Hidup sedang sibuk? 🤗", "Mulai lagi dengan 1 menit sehari. Itu sudah lebih dari cukup."],
  ],
  21: [
    ["3 minggu berlalu 🍂", "Kebiasaan baru butuh 21 hari. Hari ini bisa jadi hari pertama lagi."],
    ["Masih di sini untuk Anda 💛", "Kapan pun siap, EClub menemani langkah Anda."],
  ],
  30: [
    ["Sebulan tidak berjumpa 🗓️", "Bagaimana kabar impian Anda? Yuk cek posisi Anda sekarang."],
    ["Bulan baru, semangat baru 🌅", "Tidak perlu sempurna, cukup mulai. Buka EClub hari ini."],
  ],
};

export const WINBACK_DAYS = [3, 5, 7, 14, 21, 30];

/** Hari ke berapa yang dapat pengingat: 3, 5, 7, 14, 21, 30, lalu tiap 30 hari (60, 90, ...) sampai 180 hari. */
export function winbackTier(days: number): number | null {
  if (WINBACK_DAYS.includes(days)) return days;
  if (days > 30 && days <= 180 && days % 30 === 0) return 30;
  return null;
}

export function pickLine<T>(list: T[], seed: number): T {
  return list[((seed % list.length) + list.length) % list.length];
}
