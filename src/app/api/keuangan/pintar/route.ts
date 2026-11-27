import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { AI_MODEL, aiConfigured } from "@/lib/ai";
import { CATEGORIES } from "@/lib/finance";
import { getBooks, getPockets } from "@/lib/finance-server";
import { parseText, sanitize, type Draft } from "@/lib/fin-parse";
import { getAccount, getLimit, isAdmin } from "@/lib/plans";
import { providerOf } from "@/lib/pockets";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MEDIA = ["image/jpeg", "image/png", "image/webp"] as const;

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/** Asisten Catat khusus Plus (dan admin). Gratis: isi formulir. */
async function allowed() {
  const [acc, limit] = await Promise.all([getAccount(), getLimit("fin_smart")]);
  return acc.plan === "plus" || isAdmin(acc.role) || limit !== 0;
}

/** Kuota pemakaian AI per hari (hanya bila fitur AI dinyalakan). */
async function quota(supabase: Awaited<ReturnType<typeof createClient>>) {
  const limit = 50;
  const start = new Date(today() + "T00:00:00+07:00").toISOString();
  const { count, error } = await supabase.from("fin_ai_usage").select("id", { count: "exact", head: true }).gte("created_at", start);
  return { used: error ? 0 : (count ?? 0), limit };
}

/** Status untuk tombol di lembar Catat: AI aktif? sisa kuota hari ini? */
export async function GET() {
  if (isDemoMode) return NextResponse.json({ ai: false, plus: true, used: 0, limit: null });
  const supabase = await createClient();
  const [q, plus] = await Promise.all([quota(supabase), allowed()]);
  return NextResponse.json({ ai: aiConfigured(), plus, ...q });
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["transactions"],
  properties: {
    transactions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "amount", "category", "book_id", "pocket_id", "date", "note"],
        properties: {
          kind: { type: "string", enum: ["in", "out"] },
          amount: { type: "integer" },
          category: { type: "string" },
          book_id: { type: "string" },
          pocket_id: { type: "string" },
          date: { type: "string" },
          note: { type: "string" },
        },
      },
    },
  },
} as const;

/** Hasil pembaca sederhana tanpa penanda "yakin". */
const plain = (r: Draft & { sure: boolean }): Draft => ({ kind: r.kind, amount: r.amount, category: r.category, wallet: r.wallet, pocket_id: r.pocket_id, date: r.date, note: r.note });

export async function POST(req: Request) {
  if (isDemoMode) return NextResponse.json({ error: "Mode demo: catat pintar belum aktif." }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  if (!(await allowed())) return NextResponse.json({ error: "Asisten Catat khusus member EClub Plus. Sementara ini, isi formulir di bawah ya.", plus: false }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { text?: unknown; image?: unknown; media?: unknown };
  const text = String(body.text ?? "").trim().slice(0, 1000);
  const image = typeof body.image === "string" ? body.image.replace(/^data:[^,]+,/, "") : "";
  const media = MEDIA.find((m) => m === body.media) ?? "image/jpeg";
  if (!text && !image) return NextResponse.json({ error: "Tulis transaksinya atau foto notanya dulu." }, { status: 400 });
  if (image.length > 7_000_000) return NextResponse.json({ error: "Foto terlalu besar. Coba foto ulang lebih dekat." }, { status: 413 });

  const [pockets, books] = await Promise.all([getPockets(), getBooks()]);
  const active = books.filter((b) => b.status === "active");
  const usable = pockets.filter((p) => !p.book_id || active.some((b) => b.id === p.book_id));

  // 1. Ketik: coba pembaca sederhana dulu (gratis, tanpa batas).
  const rule = text && !image ? parseText(text, usable, active) : null;
  if (rule?.sure || (rule && !aiConfigured())) {
    return NextResponse.json({ drafts: [plain(rule)], ai: false });
  }
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: image ? "Foto nota belum tersedia. Ceritakan saja transaksinya lewat chat ya." : "Hmm, nominalnya belum kebaca. Coba tulis begini: \"beli makan 25rb pakai cash\"." },
      { status: image ? 503 : 422 },
    );
  }

  // 2. AI (foto nota, atau kalimat yang belum terbaca).
  const { used, limit } = await quota(supabase);
  if (limit != null && used >= limit) {
    if (rule) {
      return NextResponse.json({ drafts: [plain(rule)], ai: false });
    }
    return NextResponse.json({ error: `Kuota hari ini (${limit}x) sudah habis. Coba lagi besok.`, limited: true }, { status: 429 });
  }

  const books_txt = [
    `- book_id "pribadi": Keuangan Pribadi (kategori pribadi)`,
    ...active.map((b) => `- book_id "${b.id}": ${b.kind === "business" ? "Usaha" : "Keluarga"} "${b.name}" (kategori ${b.kind === "business" ? "usaha" : "pribadi"})`),
  ].join("\n");
  const pockets_txt = usable
    .map((p) => `- pocket_id "${p.id}": ${p.name}${p.provider ? ` (${providerOf(p.provider)?.label ?? p.provider})` : ""}, jenis ${p.type}, milik book_id "${p.book_id ?? "pribadi"}"`)
    .join("\n");
  const cat = (w: "personal" | "business", k: "in" | "out") => CATEGORIES[w][k].map((c) => `${c.key} (${c.label})`).join(", ");
  const system = `Anda membaca catatan keuangan pengguna aplikasi EClub (Indonesia) dan mengubahnya menjadi transaksi terstruktur. Hari ini ${today()} (WIB).

Buku keuangan:
${books_txt}

Kantong:
${pockets_txt}

Kategori pengeluaran pribadi (kind out): ${cat("personal", "out")}
Kategori pemasukan pribadi (kind in): ${cat("personal", "in")}
Kategori pengeluaran usaha (kind out): ${cat("business", "out")}
Kategori pemasukan usaha (kind in): ${cat("business", "in")}

Aturan:
- amount dalam rupiah, bilangan bulat (5rb = 5000, 1,5jt = 1500000).
- Nota/struk belanja: satu transaksi "out" dengan TOTAL yang dibayar (bukan subtotal sebelum diskon). note = nama toko + 2-4 barang utama, singkat.
- Pilih book_id dari daftar. Kata "kantor", "usaha", "toko", "bisnis", pelanggan, atau nama usaha = buku usaha. "keluarga" = buku keluarga. Selain itu "pribadi". Untuk nota tanpa petunjuk, pakai "pribadi" kecuali isinya jelas kebutuhan usaha (bahan baku, kemasan, ATK kantor).
- pocket_id harus kantong milik buku tersebut. "cash/tunai" = kantong jenis cash, nama bank/e-wallet = kantong tersebut. Kosongkan ("") bila tidak disebut.
- category harus salah satu key dari daftar yang sesuai buku & kind.
- date format YYYY-MM-DD ("kemarin" = sehari sebelum hari ini). Untuk nota, pakai tanggal di nota bila terbaca, selain itu hari ini.
- Bila beberapa transaksi disebut sekaligus, buat beberapa item. Bila tidak ada transaksi yang bisa dibaca, kembalikan transactions kosong.`;

  const content: Anthropic.ContentBlockParam[] = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: media, data: image } });
  content.push({ type: "text", text: image ? `Baca nota ini.${text ? ` Keterangan dari pengguna: ${text}` : ""}` : `Catatan pengguna: ${text}` });

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system,
      messages: [{ role: "user", content }],
    });
    await supabase.from("fin_ai_usage").insert({ kind: image ? "scan" : "chat", input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens });
    if (res.stop_reason === "refusal") throw new Error("refusal");
    const txt = res.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "{}";
    const parsed = JSON.parse(txt) as { transactions?: (Partial<Draft> & { book_id?: string })[] };
    const drafts = (parsed.transactions ?? [])
      .slice(0, 8)
      .map((d) => sanitize({ ...d, book_id: d.book_id === "pribadi" ? null : d.book_id, pocket_id: d.pocket_id || null }, usable, active))
      .filter((d): d is Draft => !!d);
    if (!drafts.length) {
      if (rule) {
        return NextResponse.json({ drafts: [plain(rule)], ai: false });
      }
      return NextResponse.json({ error: image ? "Nota belum terbaca. Pastikan fotonya terang dan total belanja terlihat jelas." : "Belum ada transaksi yang terbaca. Coba sebutkan nominal dan untuk apa." }, { status: 422 });
    }
    return NextResponse.json({ drafts, ai: true, used: used + 1, limit });
  } catch (e) {
    console.error("fin pintar", e);
    if (rule) {
      return NextResponse.json({ drafts: [plain(rule)], ai: false });
    }
    const msg = e instanceof Anthropic.RateLimitError ? "AI sedang ramai. Coba lagi sebentar lagi." : e instanceof Anthropic.AuthenticationError ? "Kunci AI tidak valid. Hubungi admin." : "Belum berhasil membaca. Coba lagi, atau isi manual.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
