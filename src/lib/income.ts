/**
 * Peta Income: active income -> massive income -> passive income, dipetakan ke SEF.
 * Survive & Sustain = active income, Sustain & Scale Up = massive income, Spread Up = passive income.
 * Rekomendasi masih berbasis aturan (Gaya Diri/DISC + minat/bakat + posisi). Draf EClub, bisa disempurnakan / diganti AI nanti.
 */
import type { Factor } from "./disc/score";

export type IncomeKind = "active" | "massive" | "passive";
export type Source = { kind: IncomeKind; name: string; amount: number };
export type Expense = { name: string; amount: number };
export type Plan = { name: string; target: number };
export type Situation = { role: string; detail: string };
export type Swot = { s: string[]; w: string[]; o: string[]; t: string[] };
export type Assets = { capital: string[]; social: string[]; human: string[]; physical: string[] };
export type IncomeProfile = {
  interests: string[];
  hobbies: string[];
  talents: string[];
  passions: string[];
  sources: Source[];
  expenses: Expense[];
  plans: Plan[];
  situation: Situation;
  swot: Swot;
  assets: Assets;
  updated_at?: string | null;
};

export const EMPTY_PROFILE: IncomeProfile = {
  interests: [],
  hobbies: [],
  talents: [],
  passions: [],
  sources: [],
  expenses: [],
  plans: [],
  situation: { role: "", detail: "" },
  swot: { s: [], w: [], o: [], t: [] },
  assets: { capital: [], social: [], human: [], physical: [] },
};

/** Kesibukan utama saat ini (langkah 2: Kondisi Saat Ini). */
export const ROLES = ["Pelajar / mahasiswa", "Karyawan", "Freelancer", "Pemilik usaha", "Karyawan + usaha sampingan", "Ibu / bapak rumah tangga", "Sedang mencari kerja", "Lainnya"];

/** Personal SWOT versi pilihan cepat (langkah 3: Potensi Diri). */
export const SWOT: Record<keyof Swot, { title: string; q: string; tone: string; items: string[] }> = {
  s: { title: "Kekuatan", q: "Apa yang sudah menjadi modal Anda?", tone: "success", items: ["Pekerja keras", "Mudah bergaul", "Teliti", "Kreatif", "Jujur & dipercaya", "Cepat belajar", "Pandai berjualan", "Sabar", "Disiplin waktu", "Punya keahlian teknis", "Pandai mengatur uang", "Berani mengambil risiko"] },
  w: { title: "Kelemahan", q: "Apa yang masih menghambat Anda?", tone: "danger", items: ["Suka menunda", "Kurang percaya diri", "Mudah terdistraksi", "Belum bisa mengatur uang", "Takut gagal", "Kurang jaringan", "Sulit bilang tidak", "Kurang konsisten", "Belum paham digital", "Waktu terbatas", "Mudah menyerah", "Perfeksionis"] },
  o: { title: "Peluang", q: "Apa yang bisa Anda manfaatkan di sekitar?", tone: "gold", items: ["Media sosial & marketplace", "Komunitas / organisasi", "Kebutuhan di lingkungan sekitar", "Keluarga yang mendukung", "Kelas & pelatihan murah/gratis", "Tren usaha baru", "Program pemerintah / KUR", "Kenalan yang punya usaha", "Kantor membuka posisi baru", "Waktu luang di akhir pekan"] },
  t: { title: "Ancaman", q: "Apa yang perlu Anda waspadai?", tone: "muted", items: ["Persaingan ketat", "Kondisi ekonomi", "Utang / cicilan", "Kesehatan", "PHK / kontrak habis", "Harga bahan naik", "Lingkungan kurang mendukung", "Perubahan teknologi", "Gaya hidup boros", "Penipuan investasi"] },
};

/** Peta Aset: 4 modal yang dimiliki setiap orang. */
export const ASSETS: Record<keyof Assets, { title: string; q: string; emoji: string; items: string[] }> = {
  capital: { title: "Modal finansial", q: "Uang & aset keuangan yang bisa dipakai", emoji: "💰", items: ["Tabungan", "Dana darurat", "Emas", "Reksa dana / saham", "Piutang", "Akses pinjaman usaha", "Penghasilan rutin", "Belum punya"] },
  social: { title: "Modal sosial", q: "Orang & jaringan yang bisa membantu", emoji: "🤝", items: ["Keluarga besar", "Teman sekolah / kampus", "Rekan kerja", "Komunitas / organisasi", "Tokoh / mentor", "Pelanggan setia", "Pengikut media sosial", "Jaringan pemasok"] },
  human: { title: "Modal diri", q: "Ilmu, keahlian, dan pengalaman Anda", emoji: "🧠", items: ["Pendidikan formal", "Sertifikat keahlian", "Pengalaman kerja", "Pengalaman berjualan", "Bahasa asing", "Keahlian digital", "Keahlian memasak", "Keahlian teknik / servis", "Keahlian mengajar"] },
  physical: { title: "Modal fisik", q: "Barang & tempat yang bisa menghasilkan", emoji: "🏠", items: ["Rumah / ruang usaha", "Lahan", "Kendaraan", "Laptop / komputer", "HP yang memadai", "Peralatan dapur", "Peralatan kerja / mesin", "Kamera", "Gudang / etalase"] },
};

export const KIND_LABEL: Record<IncomeKind, string> = { active: "Active income", massive: "Massive income", passive: "Passive income" };
export const KIND_DESC: Record<IncomeKind, string> = {
  active: "Penghasilan dari waktu & tenaga Anda: gaji, uang saku, honor, jualan yang Anda jalankan sendiri.",
  massive: "Sumber tambahan yang bisa dilipatgandakan: side hustle, usaha dengan tim, produk digital.",
  passive: "Uang yang bekerja untuk Anda: investasi, sewa aset, royalti.",
};
export const KIND_SEF: Record<IncomeKind, string> = { active: "Survive · Sustain", massive: "Sustain · Scale Up", passive: "Spread Up" };

type Chip = [label: string, tags: string[]];
export const CHIPS: Record<"interests" | "hobbies" | "talents" | "passions", { title: string; q: string; items: Chip[] }> = {
  interests: {
    title: "Minat",
    q: "Topik apa yang membuat Anda betah membahasnya?",
    items: [
      ["Bisnis & jualan", ["sales"]], ["Teknologi", ["tech"]], ["Desain & seni", ["creative"]], ["Kuliner", ["food"]], ["Kesehatan & olahraga", ["care", "outdoor"]], ["Pendidikan", ["teach"]],
      ["Keuangan & investasi", ["finance", "analytic"]], ["Media sosial & konten", ["media"]], ["Fashion & kecantikan", ["beauty", "creative"]], ["Pertanian & alam", ["outdoor"]], ["Otomotif & teknik", ["craft", "tech"]], ["Sosial & kemanusiaan", ["care"]],
    ],
  },
  hobbies: {
    title: "Hobi",
    q: "Apa yang Anda lakukan saat waktu luang, tanpa disuruh?",
    items: [
      ["Memasak", ["food"]], ["Menulis", ["write"]], ["Menggambar / desain", ["creative"]], ["Foto & video", ["media", "creative"]], ["Main game", ["tech", "media"]], ["Membaca", ["write", "analytic"]],
      ["Olahraga", ["outdoor", "care"]], ["Berkebun", ["outdoor"]], ["Kerajinan tangan", ["craft"]], ["Musik", ["creative", "media"]], ["Traveling", ["outdoor", "media"]], ["Ngobrol & bertemu orang", ["sales", "lead"]],
    ],
  },
  talents: {
    title: "Bakat",
    q: "Hal apa yang orang sering minta bantuan Anda, dan terasa mudah bagi Anda?",
    items: [
      ["Komunikasi & persuasi", ["sales", "lead"]], ["Menganalisis angka", ["analytic", "finance"]], ["Kreatif & banyak ide", ["creative"]], ["Mengajar & menjelaskan", ["teach"]], ["Teliti & rapi", ["analytic"]],
      ["Memimpin & mengatur", ["lead"]], ["Empati & mendengar", ["care"]], ["Teknis & memperbaiki", ["craft", "tech"]], ["Merangkai kata", ["write"]], ["Negosiasi", ["sales"]],
    ],
  },
  passions: {
    title: "Passion",
    q: "Hal apa yang membuat Anda merasa hidup dan bermakna?",
    items: [
      ["Membantu orang berkembang", ["teach", "care"]], ["Menciptakan hal baru", ["creative", "craft"]], ["Kebebasan waktu & tempat", ["tech", "media"]], ["Keluarga & rasa aman", ["finance"]], ["Dampak sosial", ["care"]],
      ["Keindahan & estetika", ["beauty", "creative"]], ["Teknologi & masa depan", ["tech"]], ["Hidup sehat", ["care", "outdoor"]], ["Makanan enak", ["food"]], ["Membangun bisnis besar", ["lead", "sales"]],
    ],
  },
};

export const DEFAULT_EXPENSES = ["Makan & minum", "Transportasi", "Listrik & air", "Pulsa & internet", "Tempat tinggal (sewa/cicilan)", "Pendidikan", "Kesehatan", "Sedekah / zakat", "Hiburan"];

/** Artikel gratis untuk yang bingung, per bagian isian. */
export const HELP: Record<"self" | "sources" | "expenses" | "plans" | "dreams", { slug: string; label: string }> = {
  self: { slug: "menemukan-minat-bakat-passion", label: "Bingung bedanya minat, hobi, bakat, dan passion?" },
  sources: { slug: "active-massive-passive-income", label: "Bingung bedanya active, massive, dan passive income?" },
  expenses: { slug: "mencatat-pengeluaran-bulanan", label: "Bingung cara menghitung pengeluaran bulanan?" },
  plans: { slug: "memulai-massive-income-side-hustle", label: "Bingung mau mulai massive income dari mana?" },
  dreams: { slug: "berapa-harus-menabung-untuk-mimpi", label: "Berapa yang harus ditabung untuk mimpi?" },
};

export type Idea = { id: string; kind: IncomeKind; name: string; how: string; disc: Factor[]; tags: string[]; capital: "rendah" | "sedang" | "tinggi" };

export const IDEAS: Idea[] = [
  // Active income
  { id: "a-sales", kind: "active", name: "Karier di penjualan & marketing", how: "Gaji + bonus dari kemampuan meyakinkan orang. Cocok untuk melatih mental jualan sebelum punya usaha sendiri.", disc: ["D", "I"], tags: ["sales", "lead"], capital: "rendah" },
  { id: "a-admin", kind: "active", name: "Staf admin / keuangan / akuntansi", how: "Pekerjaan yang menghargai ketelitian. Bekal berharga untuk mengelola uang sendiri nanti.", disc: ["C", "S"], tags: ["analytic", "finance"], capital: "rendah" },
  { id: "a-tutor", kind: "active", name: "Guru les privat / tutor online", how: "Bayaran per jam dari ilmu yang Anda kuasai. Bisa mulai dari tetangga atau teman kampus.", disc: ["I", "S"], tags: ["teach"], capital: "rendah" },
  { id: "a-design", kind: "active", name: "Freelance desain grafis", how: "Desain logo, feed Instagram, atau kemasan untuk UMKM. Portofolio bisa dibangun dari proyek kecil.", disc: ["C", "I"], tags: ["creative"], capital: "rendah" },
  { id: "a-writer", kind: "active", name: "Freelance penulis / copywriter", how: "Menulis caption, artikel, atau deskripsi produk. Modal utamanya laptop/HP dan kemampuan merangkai kata.", disc: ["C", "I"], tags: ["write"], capital: "rendah" },
  { id: "a-admsos", kind: "active", name: "Admin media sosial untuk UMKM", how: "Mengelola akun jualan orang lain dengan bayaran bulanan. Banyak UMKM butuh tapi tidak sempat.", disc: ["I", "S"], tags: ["media"], capital: "rendah" },
  { id: "a-cs", kind: "active", name: "Customer service / CS online", how: "Melayani pelanggan dengan sabar. Bisa dari rumah untuk toko online.", disc: ["S", "I"], tags: ["care", "sales"], capital: "rendah" },
  { id: "a-tech", kind: "active", name: "Jasa servis (HP, AC, motor, elektronik)", how: "Keahlian tangan yang selalu dicari. Bisa panggilan ke rumah pelanggan.", disc: ["C", "S"], tags: ["craft", "tech"], capital: "sedang" },
  { id: "a-dev", kind: "active", name: "Programmer / web developer", how: "Salah satu keahlian dengan bayaran tinggi. Bisa dipelajari mandiri secara online.", disc: ["C", "D"], tags: ["tech", "analytic"], capital: "rendah" },
  { id: "a-cook", kind: "active", name: "Masak pesanan / katering rumahan", how: "Menerima pesanan nasi kotak atau kue untuk acara. Mulai dari dapur sendiri.", disc: ["S", "C"], tags: ["food"], capital: "rendah" },
  { id: "a-trainer", kind: "active", name: "Pelatih olahraga / personal trainer", how: "Melatih perorangan atau kelompok. Hobi olahraga jadi penghasilan.", disc: ["D", "I"], tags: ["outdoor", "care"], capital: "rendah" },
  { id: "a-mua", kind: "active", name: "Jasa rias / kecantikan (MUA, nail art)", how: "Permintaan tinggi saat musim pernikahan dan wisuda.", disc: ["I", "S"], tags: ["beauty", "creative"], capital: "sedang" },
  // Massive income
  { id: "m-reseller", kind: "massive", name: "Reseller / dropship produk", how: "Jualan produk orang lain tanpa stok besar. Fokus pada pemasaran dan pelayanan.", disc: ["I", "D"], tags: ["sales", "media"], capital: "rendah" },
  { id: "m-frozen", kind: "massive", name: "Makanan beku / katering online", how: "Resep andalan diproduksi rutin dan dijual online. Bisa tumbuh dengan sistem produksi.", disc: ["S", "I"], tags: ["food"], capital: "sedang" },
  { id: "m-agency", kind: "massive", name: "Studio desain / branding kecil", how: "Dari freelance menjadi tim. Anda memegang klien, tim mengerjakan desain.", disc: ["D", "C"], tags: ["creative", "lead"], capital: "rendah" },
  { id: "m-class", kind: "massive", name: "Kelas online / bootcamp kecil", how: "Ajar banyak orang sekaligus, bukan satu per satu. Ilmu yang sama, penghasilan berlipat.", disc: ["I", "D"], tags: ["teach", "media"], capital: "rendah" },
  { id: "m-affiliate", kind: "massive", name: "Konten review & affiliate marketing", how: "Buat konten jujur tentang produk, dapat komisi dari setiap pembelian lewat link Anda.", disc: ["I"], tags: ["media", "sales", "write"], capital: "rendah" },
  { id: "m-handmade", kind: "massive", name: "Toko online produk handmade", how: "Kerajinan Anda dijual ke luar kota lewat marketplace dan media sosial.", disc: ["S", "C"], tags: ["craft", "creative"], capital: "rendah" },
  { id: "m-socmed", kind: "massive", name: "Jasa kelola media sosial & iklan (bulanan)", how: "Kontrak bulanan dengan beberapa klien UMKM sekaligus. Penghasilan berulang.", disc: ["I", "D"], tags: ["media", "sales", "tech"], capital: "rendah" },
  { id: "m-digital", kind: "massive", name: "Produk digital (ebook, template, preset)", how: "Dibuat sekali, dijual berkali-kali tanpa stok.", disc: ["C"], tags: ["creative", "write", "tech"], capital: "rendah" },
  { id: "m-service", kind: "massive", name: "Usaha jasa dengan tim (laundry, cleaning, servis)", how: "Anda membangun sistem dan tim, bukan mengerjakan sendiri.", disc: ["D", "S"], tags: ["lead", "care", "craft"], capital: "sedang" },
  { id: "m-eo", kind: "massive", name: "Event organizer kecil / komunitas berbayar", how: "Mengumpulkan orang dengan minat sama, penghasilan dari tiket dan sponsor.", disc: ["I", "D"], tags: ["lead", "sales"], capital: "rendah" },
  { id: "m-plant", kind: "massive", name: "Tanaman hias / hidroponik", how: "Lahan sempit pun bisa. Pasar rumah tangga dan kafe sehat.", disc: ["S", "C"], tags: ["outdoor"], capital: "sedang" },
  { id: "m-bookkeep", kind: "massive", name: "Jasa pembukuan UMKM", how: "Banyak usaha kecil belum rapi keuangannya. Kontrak bulanan, bisa dari rumah.", disc: ["C", "S"], tags: ["analytic", "finance"], capital: "rendah" },
  // Passive income
  { id: "p-mutual", kind: "passive", name: "Reksa dana rutin bulanan", how: "Mulai dari Rp100 ribu. Cocok sebagai langkah pertama investasi setelah dana darurat aman.", disc: ["S", "C", "D", "I"], tags: ["finance"], capital: "rendah" },
  { id: "p-sbn", kind: "passive", name: "Obligasi negara (SBN ritel) & saham dividen", how: "Imbal hasil rutin dari pemerintah atau perusahaan. Pelajari dulu risikonya.", disc: ["C", "S"], tags: ["analytic", "finance"], capital: "sedang" },
  { id: "p-rent", kind: "passive", name: "Kos-kosan / kontrakan", how: "Aset properti yang menghasilkan sewa bulanan. Butuh modal besar, biasanya tahap lanjut.", disc: ["D", "S"], tags: ["finance", "lead"], capital: "tinggi" },
  { id: "p-royalty", kind: "passive", name: "Royalti kursus rekaman / buku", how: "Ilmu direkam sekali dan dijual terus. Dari massive income menjadi passive income.", disc: ["I", "C"], tags: ["teach", "creative", "write"], capital: "rendah" },
  { id: "p-partner", kind: "passive", name: "Bagi hasil usaha / franchise", how: "Menjadi pemodal di usaha yang dijalankan orang lain. Pilih mitra yang tepercaya.", disc: ["D"], tags: ["lead", "finance", "sales"], capital: "tinggi" },
  { id: "p-channel", kind: "passive", name: "Aset digital: YouTube / blog bermonetisasi", how: "Konten lama tetap menghasilkan dari iklan dan affiliate.", disc: ["I", "C"], tags: ["media", "write"], capital: "rendah" },
  { id: "p-rental", kind: "passive", name: "Sewa alat / kendaraan", how: "Barang yang menganggur disewakan: kamera, mobil, alat pesta.", disc: ["D", "S"], tags: ["craft", "lead"], capital: "tinggi" },
];

export function tagsOf(p: IncomeProfile): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const group of ["interests", "hobbies", "talents", "passions"] as const) {
    for (const label of p[group]) {
      const chip = CHIPS[group].items.find(([l]) => l === label);
      for (const t of chip?.[1] ?? []) out.set(t, [...(out.get(t) ?? []), label]);
    }
  }
  return out;
}

export type Reco = Idea & { score: number; reasons: string[] };
const DISC_NAME: Record<Factor, string> = { D: "Daya Dorong", I: "Daya Pikat", S: "Daya Tahan", C: "Daya Cermat" };

/** Rekomendasi per jenis income, 3 teratas. */
export function recommend(p: IncomeProfile, disc: { primary: Factor; secondary?: Factor | null } | null): Record<IncomeKind, Reco[]> {
  const tags = tagsOf(p);
  const scored = IDEAS.map((idea) => {
    let score = 0;
    const reasons: string[] = [];
    if (disc && idea.disc.includes(disc.primary)) {
      score += 2;
      reasons.push(`sesuai gaya ${DISC_NAME[disc.primary]} Anda`);
    } else if (disc?.secondary && idea.disc.includes(disc.secondary)) score += 1;
    const matched = new Set<string>();
    for (const t of idea.tags) for (const l of tags.get(t) ?? []) matched.add(l);
    score += Math.min(matched.size, 4) * 1.5;
    if (matched.size) reasons.push(`nyambung dengan ${[...matched].slice(0, 3).join(", ").toLowerCase()}`);
    if (idea.capital === "rendah") score += 0.3;
    return { ...idea, score, reasons };
  });
  const by = (k: IncomeKind) => scored.filter((x) => x.kind === k).sort((a, b) => b.score - a.score).slice(0, 3);
  return { active: by("active"), massive: by("massive"), passive: by("passive") };
}

export type DreamLite = { id: string; title: string; target_amount: number | null; saved_amount: number; target_date: string | null; status: string };

export function summarize(p: IncomeProfile, dreams: DreamLite[], today = new Date()) {
  const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const byKind = (k: IncomeKind) => sum(p.sources.filter((s) => s.kind === k));
  const active = byKind("active");
  const massive = byKind("massive");
  const passive = byKind("passive");
  const income = active + massive + passive;
  const expense = sum(p.expenses);
  const surplus = income - expense;
  const saveRate = income > 0 ? Math.round((surplus / income) * 100) : 0;
  const planned = p.plans.reduce((s, x) => s + (Number(x.target) || 0), 0);

  const dreamRows = dreams
    .filter((d) => d.status === "active" && (d.target_amount ?? 0) > (d.saved_amount ?? 0))
    .map((d) => {
      const left = (d.target_amount ?? 0) - (d.saved_amount ?? 0);
      let months = 0;
      if (d.target_date) {
        const t = new Date(d.target_date + "T00:00:00");
        months = Math.max(1, (t.getFullYear() - today.getFullYear()) * 12 + (t.getMonth() - today.getMonth()));
      }
      return { id: d.id, title: d.title, left, months, perMonth: months ? Math.ceil(left / months) : 0 };
    });
  const need = dreamRows.reduce((s, d) => s + d.perMonth, 0);
  const gap = Math.max(0, need - Math.max(surplus, 0));
  const totalLeft = dreamRows.reduce((s, d) => s + d.left, 0);
  const monthsNow = surplus > 0 && totalLeft ? Math.ceil(totalLeft / surplus) : null;
  const monthsWithPlan = surplus + planned > 0 && totalLeft ? Math.ceil(totalLeft / (Math.max(surplus, 0) + planned)) : null;

  // Posisi income: menentukan fokus saat ini di peta SEF.
  const focus: IncomeKind = passive > 0 ? "passive" : massive > 0 || (surplus > 0 && planned > 0) ? "massive" : "active";
  const stage =
    income === 0
      ? { key: "start", label: "Mulai dari active income pertama", sef: "Survive", tip: "Fokus pertama: punya penghasilan aktif yang rutin, sekecil apa pun. Dari kerja, uang saku, honor, atau jualan." }
      : surplus <= 0
        ? { key: "survive", label: "Survive: kuatkan active income", sef: "Survive", tip: "Pengeluaran masih sama atau lebih besar dari penghasilan. Rapikan pengeluaran dan naikkan nilai active income Anda dulu." }
        : massive === 0 && passive === 0
          ? { key: "sustain", label: "Sustain: saatnya mulai massive income", sef: "Sustain", tip: "Active income sudah menyisakan uang. Sisihkan untuk mimpi, lalu mulai satu sumber massive income kecil." }
          : passive === 0
            ? { key: "scale", label: "Scale Up: lipatgandakan massive income", sef: "Scale Up", tip: "Anda sudah punya sumber tambahan. Bangun dana darurat, lalu siapkan uang dingin untuk belajar investasi." }
            : { key: "spread", label: "Spread Up: passive income mulai bekerja", sef: "Spread Up", tip: "Uang Anda sudah ikut bekerja. Tambah porsinya secara bertahap dan teruslah belajar." };

  return { active, massive, passive, income, expense, surplus, saveRate, planned, dreamRows, need, gap, monthsNow, monthsWithPlan, focus, stage, emergency: [expense * 3, expense * 6] as const };
}

/** Bersihkan input dari form. */
export function cleanProfile(raw: unknown): IncomeProfile {
  const r = (raw ?? {}) as Partial<IncomeProfile>;
  const strs = (xs: unknown) => (Array.isArray(xs) ? xs.map((x) => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, 20) : []);
  const num = (n: unknown) => Math.max(0, Math.min(10_000_000_000, Math.round(Number(n) || 0)));
  const kinds: IncomeKind[] = ["active", "massive", "passive"];
  const sw = (r.swot ?? {}) as Partial<Swot>;
  const as = (r.assets ?? {}) as Partial<Assets>;
  const si = (r.situation ?? {}) as Partial<Situation>;
  return {
    situation: { role: String(si.role ?? "").trim().slice(0, 40), detail: String(si.detail ?? "").trim().slice(0, 160) },
    swot: { s: strs(sw.s), w: strs(sw.w), o: strs(sw.o), t: strs(sw.t) },
    assets: { capital: strs(as.capital), social: strs(as.social), human: strs(as.human), physical: strs(as.physical) },
    interests: strs(r.interests),
    hobbies: strs(r.hobbies),
    talents: strs(r.talents),
    passions: strs(r.passions),
    sources: (Array.isArray(r.sources) ? r.sources : []).slice(0, 15).map((s) => ({ kind: kinds.includes(s?.kind as IncomeKind) ? (s.kind as IncomeKind) : "active", name: String(s?.name ?? "").trim().slice(0, 60), amount: num(s?.amount) })).filter((s) => s.name || s.amount),
    expenses: (Array.isArray(r.expenses) ? r.expenses : []).slice(0, 30).map((e) => ({ name: String(e?.name ?? "").trim().slice(0, 60), amount: num(e?.amount) })).filter((e) => e.name),
    plans: (Array.isArray(r.plans) ? r.plans : []).slice(0, 10).map((x) => ({ name: String(x?.name ?? "").trim().slice(0, 80), target: num(x?.target) })).filter((x) => x.name || x.target),
  };
}
