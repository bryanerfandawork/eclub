import { CATEGORIES, type Book, type TxKind, type Wallet } from "./finance";
import { PROVIDERS, type Pocket } from "./pockets";

/** Hasil baca catat pintar: sudah terisi, tinggal dikonfirmasi pengguna di lembar Catat. */
export type Draft = {
  kind: TxKind;
  amount: number;
  category: string;
  wallet: Wallet;
  pocket_id: string | null;
  to_pocket_id?: string | null;
  date: string;
  note: string;
};

/** "5rb", "5 ribu", "1,5jt", "Rp 25.000", "25000", "2 juta 500 ribu" -> rupiah. 0 bila tidak ada. */
export function parseAmount(text: string): number {
  const t = text.toLowerCase().replace(/rp\.?\s*/g, " ");
  const mult = (u: string) => (u === "jt" || u === "juta" ? 1_000_000 : u === "m" || u === "miliar" || u === "milyar" ? 1_000_000_000 : u ? 1_000 : 1);
  const re = /(\d+(?:[.,]\d+)*)\s*(jt|juta|rb|ribu|k|miliar|milyar)?(?![a-z])/g;
  const toks: { n: number; u: number; i: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const raw = m[1];
    const u = mult(m[2] ?? "");
    const n = u > 1 ? Number(raw.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")) * u : /^\d{1,3}([.,]\d{3})+$/.test(raw) ? Number(raw.replace(/[.,]/g, "")) : Number(raw.replace(",", "."));
    if (Number.isFinite(n) && n > 0) toks.push({ n, u, i: m.index, end: m.index + m[0].length });
  }
  const withUnit = toks.findIndex((x) => x.u > 1);
  if (withUnit >= 0) {
    // "2 juta 500 ribu": jumlahkan bagian bersatuan yang berurutan dan makin kecil.
    let total = toks[withUnit].n;
    let last = toks[withUnit];
    for (const x of toks.slice(withUnit + 1)) {
      if (x.u > 1 && x.u < last.u && x.i - last.end <= 2) { total += x.n; last = x; } else break;
    }
    return Math.round(total);
  }
  return Math.round(toks.find((x) => x.n >= 500)?.n ?? 0);
}

const KEYWORDS: Record<Wallet, Record<string, string[]>> = {
  personal: {
    makan: ["makan", "minum", "kopi", "jajan", "sarapan", "nasi", "bakso", "mie", "warung", "resto", "gofood", "grabfood", "snack", "teh", "es ", "ayam", "martabak"],
    belanja: ["belanja", "indomaret", "alfamart", "supermarket", "pasar", "sayur", "beras", "minyak", "telur", "sabun", "galon"],
    tagihan: ["listrik", "pln", "token", "pdam", "air", "kontrakan", "kos", "sewa rumah", "ipl", "wifi", "indihome", "tagihan"],
    transport: ["bensin", "pertalite", "pertamax", "parkir", "ojek", "gojek", "grab", "tol", "kereta", "krl", "bus", "taksi", "transport", "angkot"],
    pulsa: ["pulsa", "kuota", "paket data", "internet"],
    kesehatan: ["obat", "apotek", "dokter", "klinik", "rumah sakit", "vitamin", "bpjs"],
    pendidikan: ["sekolah", "spp", "kursus", "buku", "les", "kuliah", "seminar", "kelas"],
    keluarga: ["orang tua", "ortu", "kirim ibu", "kirim bapak", "keluarga"],
    hiburan: ["nonton", "bioskop", "game", "liburan", "wisata", "hiburan", "karaoke"],
    pakaian: ["baju", "celana", "sepatu", "sandal", "tas", "kaos", "jaket", "pakaian", "hijab", "jilbab"],
    perawatan: ["salon", "potong rambut", "cukur", "skincare", "kosmetik", "parfum", "spa"],
    rumah_tangga: ["perabot", "piring", "sapu", "lampu", "kasur", "perlengkapan rumah"],
    anak: ["popok", "pampers", "susu anak", "mainan", "anak"],
    langganan: ["netflix", "spotify", "youtube premium", "langganan", "icloud", "google one"],
    kendaraan: ["servis motor", "servis mobil", "ganti oli", "oli", "bengkel", "pajak motor", "pajak mobil", "stnk"],
    asuransi: ["asuransi", "premi"],
    hadiah: ["kado", "hadiah", "kondangan", "amplop", "nikahan"],
    sedekah: ["sedekah", "zakat", "infaq", "infak", "donasi", "masjid", "sumbangan"],
    cicilan: ["cicilan", "utang", "hutang", "kredit", "paylater", "kartu kredit"],
    tabungan: ["nabung", "tabung", "tabungan", "investasi", "reksadana", "emas"],
  },
  business: {
    bahan: ["bahan", "stok", "kulakan", "tepung", "gula", "telur", "bahan baku", "restock", "barang dagangan"],
    gaji_karyawan: ["gaji karyawan", "gaji pegawai", "upah", "bayar karyawan", "gaji tim", "thr"],
    sewa: ["sewa", "kontrak toko", "sewa toko", "sewa kantor", "sewa ruko"],
    utilitas: ["listrik", "pln", "token", "air", "pdam", "wifi", "internet", "indihome"],
    kemasan: ["kemasan", "packaging", "plastik", "kardus", "box", "dus", "stiker", "label"],
    marketing: ["iklan", "ads", "promosi", "endorse", "marketing", "brosur", "banner", "spanduk", "meta ads", "tiktok ads"],
    ongkir: ["ongkir", "kirim paket", "ekspedisi", "jne", "j&t", "sicepat", "kurir", "bensin", "parkir", "transport"],
    peralatan: ["alat", "peralatan", "mesin", "laptop", "printer", "etalase", "kompor"],
    perbaikan: ["servis", "perbaikan", "reparasi", "maintenance", "renovasi"],
    atk: ["atk", "kertas", "pulpen", "tinta", "map", "alat tulis", "fotokopi"],
    konsumsi: ["konsumsi", "jamuan", "makan tim", "snack rapat", "kopi", "makan", "minum"],
    software: ["aplikasi", "software", "langganan", "domain", "hosting", "canva", "zoom"],
    komisi: ["komisi", "fee", "affiliate", "reseller"],
    biaya_bank: ["biaya admin", "admin bank", "biaya transfer", "potongan bank"],
    pajak: ["pajak", "izin", "nib", "pbb", "retribusi"],
    cicilan: ["cicilan", "angsuran", "bayar pinjaman", "kur"],
  },
};
const IN_KEYWORDS: Record<Wallet, Record<string, string[]>> = {
  personal: { gaji: ["gaji", "gajian"], bonus: ["bonus", "thr", "hadiah", "angpao"], sampingan: ["freelance", "sampingan", "proyek", "project", "honor", "fee"], investasi: ["dividen", "bunga", "imbal hasil"] },
  business: { penjualan: ["jual", "penjualan", "terjual", "omzet", "omset", "laku", "order", "pesanan"], jasa: ["jasa", "fee", "honor", "proyek", "project"], modal: ["modal", "pinjaman", "investor", "suntikan dana"] },
};


function guessCategory(t: string, w: Wallet, kind: "in" | "out") {
  const map = kind === "out" ? KEYWORDS[w] : IN_KEYWORDS[w];
  let best = "";
  let len = 0;
  for (const [k, words] of Object.entries(map)) for (const word of words) if (t.includes(word) && word.length > len) { best = k; len = word.length; }
  return best || (kind === "out" ? (w === "business" ? "operasional" : "lain") : "lain");
}

function jakarta(offset: number) {
  return new Date(Date.now() + offset * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/** Cari kantong yang disebut ("cash", "bank jago", "gopay", nama kantong). */
function findPocket(t: string, list: Pocket[]) {
  let best: Pocket | null = null;
  let score = 0;
  for (const p of list) {
    const prov = PROVIDERS.find((x) => x.key === p.provider);
    const words = [p.name.toLowerCase(), prov?.label.toLowerCase(), p.provider ?? undefined].filter(Boolean) as string[];
    for (const w of words) if (w.length >= 2 && t.includes(w) && w.length > score) { best = p; score = w.length; }
  }
  if (!best && /\b(cash|tunai|uang cash|dompet)\b/.test(t)) best = list.find((p) => p.type === "cash") ?? null;
  if (!best && /\b(transfer|tf|bank|rekening)\b/.test(t)) best = list.find((p) => p.type === "bank") ?? null;
  if (!best && /\b(e-?wallet|qris)\b/.test(t)) best = list.find((p) => p.type === "ewallet") ?? null;
  return best;
}

/**
 * Pembaca kalimat sederhana (tanpa AI, gratis & tanpa batas). Contoh:
 * "aku habis beli minum harga 5rb pake uang pribadi cash", "bayar listrik kantor 1 juta pakai transfer bank jago".
 * Mengembalikan null bila nominal tidak ditemukan.
 */
export function parseText(text: string, pockets: Pocket[], books: Book[]): (Draft & { sure: boolean }) | null {
  const t = ` ${text.toLowerCase()} `;
  const amount = parseAmount(t);
  if (!amount) return null;
  const active = books.filter((b) => b.status === "active");
  // Buku yang disebut namanya ("toko kue", "keluarga").
  let book = active.slice().sort((a, b) => b.name.length - a.name.length).find((b) => t.includes(b.name.toLowerCase())) ?? null;
  if (!book && /\b(keluarga|rumah tangga|bareng istri|bareng suami)\b/.test(t)) book = active.find((b) => b.kind === "family") ?? null;
  const bizWords = /\b(usaha|bisnis|kantor|toko|warung saya|outlet|karyawan|pelanggan|customer|kas usaha|modal usaha|jual|terjual|laku|omzet|omset|pesanan|orderan|kulakan|stok)\b/.test(t);
  if (!book && bizWords && !/\bpribadi\b/.test(t)) book = active.find((b) => b.kind === "business" && b.mine) ?? active.find((b) => b.kind === "business") ?? null;
  const personal = !book;
  const list = pockets.filter((p) => (personal ? !p.book_id && p.own !== false : p.book_id === book!.id));
  const wallet: Wallet = book?.kind === "business" ? "business" : "personal";
  const inWords = /\b(terima|dapat|dapet|masuk|gajian|jual|terjual|laku|dibayar|pemasukan|omzet|omset|transferan dari)\b/.test(t);
  const outWords = /\b(beli|bayar|habis|keluar|belanja|buat|untuk|isi|top ?up|sewa|kirim|pengeluaran|jajan)\b/.test(t);
  const kind: "in" | "out" = inWords && !/\b(beli|bayar)\b/.test(t) ? "in" : "out";
  const category = guessCategory(t, wallet, kind);
  const pocket = findPocket(t, list) ?? list[0] ?? null;
  const date = /\bkemarin\b/.test(t) ? jakarta(-1) : /\b(2|dua) hari lalu\b/.test(t) ? jakarta(-2) : jakarta(0);
  const note = text.trim().replace(/\s+/g, " ").slice(0, 120);
  const sure = (inWords || outWords) && category !== "lain" && category !== "operasional";
  return { kind, amount, category, wallet, pocket_id: pocket?.id ?? null, date, note, sure };
}

/** Pastikan hasil AI hanya memakai kategori & kantong yang benar-benar ada. */
export function sanitize(d: Partial<Draft> & { book_id?: string | null }, pockets: Pocket[], books: Book[]): Draft | null {
  const amount = Math.round(Number(d.amount) || 0);
  if (amount <= 0 || amount >= 100_000_000_000) return null;
  const kind: "in" | "out" = d.kind === "in" ? "in" : "out";
  const book = books.find((b) => b.id === d.book_id && b.status === "active") ?? null;
  let pocket = pockets.find((p) => p.id === d.pocket_id) ?? null;
  if (pocket && (pocket.book_id ?? null) !== (book?.id ?? null)) pocket = null;
  const list = pockets.filter((p) => (book ? p.book_id === book.id : !p.book_id && p.own !== false));
  pocket = pocket ?? list[0] ?? null;
  const wallet: Wallet = pocket?.wallet ?? (book?.kind === "business" ? "business" : "personal");
  const cats = CATEGORIES[wallet][kind];
  const category = cats.some((c) => c.key === d.category) ? String(d.category) : kind === "out" ? (wallet === "business" ? "operasional" : "lain") : "lain";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(d.date ?? "")) && String(d.date) <= jakarta(0) && String(d.date) >= jakarta(-366) ? String(d.date) : jakarta(0);
  return { kind, amount, category, wallet, pocket_id: pocket?.id ?? null, date, note: String(d.note ?? "").slice(0, 200) };
}
