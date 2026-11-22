import type { Factor } from "./score";

/**
 * Interpretasi tambahan karya EClub (bukan dari file Excel), disusun dari pengetahuan umum model perilaku DISC
 * (teori William Moulton Marston, 1928) dan praktik pengembangan karier & kewirausahaan.
 */
export type Insight = {
  name: string;
  tagline: string;
  color: string;
  summary: string;
  motivator: string;
  communicate: string[];
  environment: string;
  blindspots: string[];
  careers: string[];
  business: string[];
  entrepreneur: string;
  growth: string[];
  sef: string;
};

export const INSIGHTS: Record<Factor, Insight> = {
  D: {
    name: "Daya Dorong",
    tagline: "Si Penggerak Hasil",
    color: "#b42318",
    summary: "Anda berorientasi pada hasil, cepat mengambil keputusan, dan nyaman memegang kendali. Tantangan justru membuat Anda bersemangat.",
    motivator: "Target yang menantang, kebebasan bertindak, dan kemenangan yang terukur.",
    communicate: ["Langsung ke inti, singkat, dan jelas", "Tawarkan pilihan, bukan instruksi panjang", "Fokus pada hasil dan dampak, bukan detail proses"],
    environment: "Lingkungan yang dinamis, punya wewenang untuk memutuskan, dan menghargai kecepatan.",
    blindspots: ["Terlalu cepat memutuskan tanpa mendengar", "Terkesan keras atau kurang sabar", "Mengabaikan perasaan tim saat mengejar target"],
    careers: ["Pemimpin bisnis / manajer", "Sales & business development", "Manajer proyek", "Konsultan strategi", "Pengacara / negosiator", "Wiraswasta"],
    business: ["Distributor & perdagangan", "Kontraktor / jasa proyek", "Agensi penjualan", "Usaha yang butuh negosiasi besar"],
    entrepreneur: "Cocok sebagai founder yang membuka pasar dan mengejar pertumbuhan. Pasangkan diri dengan orang bertipe S atau C untuk menjaga sistem dan kualitas.",
    growth: ["Biasakan bertanya dan mendengar sebelum memutuskan", "Delegasikan detail, tapi tetap hargai prosesnya", "Latih empati: tanyakan kabar tim, bukan hanya progres"],
    sef: "Kekuatan Anda paling terasa di langkah Acquisition dan Transformation. Perhatikan Systemation agar pertumbuhan tidak berantakan.",
  },
  I: {
    name: "Daya Pikat",
    tagline: "Si Penyemangat",
    color: "#c6a15b",
    summary: "Anda hangat, ekspresif, dan pandai memengaruhi orang. Energi Anda menular dan mudah membangun jaringan.",
    motivator: "Pengakuan, interaksi sosial, dan kesempatan untuk tampil serta menginspirasi.",
    communicate: ["Ramah dan antusias, beri ruang bercerita", "Gunakan visual dan cerita, bukan data mentah", "Tuliskan kesepakatan karena detail mudah terlewat"],
    environment: "Lingkungan yang ramai, kolaboratif, fleksibel, dan menghargai kreativitas.",
    blindspots: ["Terlalu optimis sehingga kurang memperhitungkan risiko", "Mudah teralihkan, tindak lanjut lemah", "Sulit berkata tidak"],
    careers: ["Marketing & branding", "Public relations / MC / host", "Content creator", "Trainer & pembicara", "Sales relasional", "Event organizer"],
    business: ["Personal brand & kelas online", "Kuliner atau kafe dengan komunitas", "Agensi kreatif / event", "Bisnis berbasis komunitas & afiliasi"],
    entrepreneur: "Cocok sebagai wajah brand dan penggerak komunitas. Pasangkan diri dengan orang bertipe C untuk keuangan dan operasional.",
    growth: ["Gunakan daftar tugas harian dan tenggat yang jelas", "Pelajari dasar keuangan agar antusiasme didukung angka", "Selesaikan satu proyek sebelum memulai yang baru"],
    sef: "Kekuatan Anda paling terasa di langkah Acquisition (pemasaran dan relasi). Jangan lewatkan Systemation agar penjualan berubah menjadi bisnis yang stabil.",
  },
  S: {
    name: "Daya Tahan",
    tagline: "Si Penjaga Harmoni",
    color: "#2f7d5b",
    summary: "Anda sabar, setia, dan dapat diandalkan. Anda menjaga stabilitas dan membuat orang di sekitar merasa aman.",
    motivator: "Rasa aman, hubungan yang tulus, dan pekerjaan yang jelas serta konsisten.",
    communicate: ["Santai dan tulus, jangan terburu-buru", "Jelaskan alasan dan langkah perubahan secara bertahap", "Tanyakan pendapatnya secara langsung karena ia jarang menyela"],
    environment: "Lingkungan yang stabil, harmonis, saling mendukung, dengan perubahan yang terencana.",
    blindspots: ["Menghindari konflik sehingga masalah dipendam", "Lambat beradaptasi pada perubahan mendadak", "Sulit menolak permintaan orang lain"],
    careers: ["HR & people development", "Customer service / customer success", "Guru, konselor, perawat", "Admin & operasional", "Akuntan pendamping", "Koordinator tim"],
    business: ["Jasa layanan pelanggan berulang (laundry, katering langganan)", "Klinik / layanan kesehatan & perawatan", "Pendidikan anak", "Waralaba dengan sistem jelas"],
    entrepreneur: "Cocok membangun bisnis dengan pelanggan setia dan tim yang solid. Pasangkan diri dengan orang bertipe D atau I untuk mempercepat ekspansi dan pemasaran.",
    growth: ["Latih menyampaikan pendapat dan berkata tidak dengan sopan", "Pecah perubahan besar menjadi langkah kecil", "Beri diri izin mengambil risiko yang terukur"],
    sef: "Kekuatan Anda paling terasa di langkah Systemation (konsistensi dan tim). Dorong diri di langkah Acquisition dan Transformation.",
  },
  C: {
    name: "Daya Cermat",
    tagline: "Si Pemikir Teliti",
    color: "#1f4f8b",
    summary: "Anda analitis, teliti, dan menjunjung kualitas. Anda mengambil keputusan berdasarkan data dan standar yang jelas.",
    motivator: "Akurasi, kualitas, keahlian, dan aturan main yang jelas.",
    communicate: ["Siapkan data, fakta, dan detail", "Beri waktu untuk berpikir sebelum meminta keputusan", "Hindari klaim berlebihan tanpa bukti"],
    environment: "Lingkungan yang terstruktur, tenang, dengan standar kualitas dan prosedur yang jelas.",
    blindspots: ["Perfeksionis sehingga lambat bergerak", "Terlalu kritis pada diri sendiri dan orang lain", "Kurang menunjukkan antusiasme"],
    careers: ["Analis data / keuangan", "Akuntan & auditor", "Programmer / engineer", "Quality control", "Peneliti", "Arsitek / desainer teknis"],
    business: ["Jasa keuangan, pajak, atau konsultan", "Produk teknologi / software", "Manufaktur dengan standar mutu", "Usaha berbasis keahlian teknis"],
    entrepreneur: "Cocok membangun bisnis berbasis keahlian dan kualitas. Pasangkan diri dengan orang bertipe I atau D untuk penjualan dan keberanian ekspansi.",
    growth: ["Tetapkan batas waktu: selesai lebih baik daripada sempurna", "Uji ide kecil di pasar sebelum disempurnakan", "Latih menyampaikan ide dengan cerita, bukan hanya data"],
    sef: "Kekuatan Anda paling terasa di langkah Systemation dan Investation. Tantang diri di langkah Acquisition: mulai menawarkan sebelum semuanya sempurna.",
  },
};

export const FACTOR_SHORT: Record<Factor, string> = {
  D: "Tegas, cepat, berorientasi hasil",
  I: "Ramah, ekspresif, persuasif",
  S: "Sabar, stabil, suportif",
  C: "Teliti, analitis, berkualitas",
};

/** Label tampilan pengganti huruf D/I/S/C (nama tes disamarkan sebagai "Tes Gaya Diri"). */
export const FACTOR_LABEL: Record<Factor, string> = { D: "Dorong", I: "Pikat", S: "Tahan", C: "Cermat" };
