/** Isi yang bisa diubah super admin (Admin > Pengaturan > Asisten harian & keuangan), dengan nilai bawaan. */
export const DEFAULT_TEASER = ["bca", "bri", "mandiri", "dana", "shopeepay"];
export const DEFAULT_WORK_IDEAS = ["Usaha / jualan", "Pekerjaan kantor", "Kuliah & tugas", "Latihan olahraga", "Konten media sosial", "Belajar skill baru", "Urusan rumah & keluarga", "Organisasi / komunitas"];
export const DEFAULT_HABIT_IDEAS: [string, string][] = [
  ["🙏", "Ibadah tepat waktu"],
  ["📖", "Baca 10 halaman"],
  ["🏃", "Olahraga 15 menit"],
  ["💧", "Minum 8 gelas air"],
  ["💰", "Catat keuangan"],
  ["📞", "Follow-up 5 pelanggan"],
  ["📱", "Posting konten jualan"],
  ["😴", "Tidur sebelum jam 11"],
];
export type Highlight = { emoji: string; title: string; desc: string };
export const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { emoji: "☀️", title: "Ritual harian 3 menit", desc: "Setiap hari cukup 3 hal: lapor keuangan, centang rencana aksi & kebiasaan, lalu tulis syukur. Home Anda berubah jadi asisten pribadi." },
  { emoji: "👛", title: "Kantong keuangan", desc: "Uang pribadi dan usaha terpisah, lengkap dengan kantongnya: tunai, rekening bank, sampai e-wallet. Saldo selalu cocok dengan aslinya." },
  { emoji: "🐷", title: "Tabung untuk mimpi", desc: "Tandai uang di kantong untuk mimpi tertentu. Kalau terpakai untuk hal lain, EClub bertanya mimpi mana yang dikorbankan, supaya Anda sadar setiap pilihan." },
  { emoji: "📊", title: "Rapor Mingguan", desc: "Setiap Minggu malam: berapa persen rencana selesai dan mimpi mana yang paling maju. Malam hari diingatkan yang belum beres." },
];

const lines = (v: unknown) => (typeof v === "string" ? v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : []);

export function assistantConfig(s: Record<string, unknown>) {
  const teaser = typeof s.pocket_teaser === "string" && s.pocket_teaser.trim() ? s.pocket_teaser.split(",").map((x) => x.trim()).filter(Boolean) : DEFAULT_TEASER;
  const work = lines(s.work_ideas);
  const habit = lines(s.habit_ideas).map((l): [string, string] => {
    const m = l.match(/^(\S+)\s+(.+)$/);
    return m && !/^[\p{L}\p{N}]/u.test(m[1]) ? [m[1], m[2]] : ["✅", l];
  });
  const hl = lines(s.landing_highlights)
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p.length >= 3)
    .map(([emoji, title, desc]) => ({ emoji, title, desc }));
  return {
    teaser,
    workIdeas: work.length ? work : DEFAULT_WORK_IDEAS,
    habitIdeas: habit.length ? habit : DEFAULT_HABIT_IDEAS,
    highlights: hl.length ? hl : DEFAULT_HIGHLIGHTS,
  };
}
