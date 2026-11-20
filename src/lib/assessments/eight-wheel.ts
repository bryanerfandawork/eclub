import type { Assessment } from "./types";

/**
 * 8 Wheel Entrepreneur.
 *
 * KONTEN BELUM FINAL: nama 8 dimensi, pertanyaan, dan interpretasinya akan diisi
 * dari materi resmi EClub. Isi di bawah hanyalah kerangka contoh agar alurnya bisa
 * dicoba di mode demo. Setelah materi resmi masuk, ganti `dimensions` & `questions`,
 * lalu ubah `ready` menjadi true.
 */
const dims = Array.from({ length: 8 }, (_, i) => ({
  key: `d${i + 1}`,
  label: `Dimensi ${i + 1}`,
  short: `Dimensi ${i + 1}`,
  description: "Deskripsi dimensi akan diisi dari materi resmi EClub.",
  levels: [
    { min: 7.5, text: "Kekuatan utama. Pertahankan dan jadikan pengungkit." },
    { min: 5, text: "Cukup baik. Masih bisa ditingkatkan." },
    { min: 0, text: "Area pengembangan prioritas." },
  ],
}));

export const eightWheel: Assessment = {
  key: "8-wheel-entrepreneur",
  title: "8 Wheel Entrepreneur",
  subtitle: "Peta kesiapan entrepreneur Anda",
  intro: "Jawab setiap pernyataan sesuai kondisi Anda saat ini, bukan kondisi yang Anda harapkan. Tidak ada jawaban benar atau salah.",
  ready: false,
  dimensions: dims,
  questions: dims.flatMap((d, i) =>
    [1, 2, 3].map((n) => ({
      id: `${d.key}q${n}`,
      dimension: d.key,
      text: `Pernyataan contoh ${n} untuk Dimensi ${i + 1}.`,
    })),
  ),
};
