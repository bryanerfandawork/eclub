import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { AI_MODEL, aiConfigured, aiQuota, buildUserContext, SYSTEM_PROMPT } from "@/lib/ai";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Riwayat singkat + sisa kuota hari ini. */
export async function GET() {
  if (isDemoMode) return NextResponse.json({ configured: false, history: [], used: 0, limit: 5 });
  const { supabase, user } = await authed();
  if (!user) return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  const [{ data }, quota] = await Promise.all([
    supabase.from("ai_messages").select("role, content").order("created_at", { ascending: false }).limit(20),
    aiQuota(supabase),
  ]);
  return NextResponse.json({ configured: aiConfigured(), history: (data ?? []).reverse(), ...quota });
}

export async function POST(req: Request) {
  if (isDemoMode || !aiConfigured()) return NextResponse.json({ error: "AI Companion belum diaktifkan oleh admin." }, { status: 503 });
  const { supabase, user } = await authed();
  if (!user) return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { message?: unknown; useContext?: unknown };
  const message = String(body.message ?? "").trim().slice(0, 2000);
  if (!message) return NextResponse.json({ error: "Pesan kosong." }, { status: 400 });

  const { used, limit } = await aiQuota(supabase);
  if (limit != null && used >= limit)
    return NextResponse.json({ error: `Kuota ${limit} pesan hari ini sudah habis. Coba lagi besok, atau upgrade ke EClub Plus untuk kuota lebih besar.` }, { status: 429 });

  // Ambil 10 pesan terakhir sebagai ingatan percakapan.
  const { data: past } = await supabase.from("ai_messages").select("role, content").order("created_at", { ascending: false }).limit(10);
  const history = (past ?? []).reverse() as { role: "user" | "assistant"; content: string }[];
  while (history.length && history[0].role !== "user") history.shift();

  // Catat pesan pengguna lebih dulu agar kuota tidak bisa diakali dengan kirim bersamaan.
  const { error: insErr } = await supabase.from("ai_messages").insert({ role: "user", content: message });
  if (insErr) return NextResponse.json({ error: "Gagal menyimpan pesan. Pastikan SQL tahap 8 sudah dijalankan." }, { status: 500 });

  const context = body.useContext === true ? await buildUserContext() : "";
  const system = context ? `${SYSTEM_PROMPT}\n\nData pengguna (izin diberikan, gunakan untuk personalisasi):\n${context}` : SYSTEM_PROMPT;

  const messages: Anthropic.MessageParam[] = [];
  for (const m of history) {
    const last = messages[messages.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else messages.push({ role: m.role, content: m.content });
  }
  if (messages.length && messages[messages.length - 1].role === "user") messages[messages.length - 1].content += "\n\n" + message;
  else messages.push({ role: "user", content: message });

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      try {
        const s = client.messages.stream({
          model: AI_MODEL,
          max_tokens: 2048,
          output_config: { effort: "low" },
          system,
          messages,
        });
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            text += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal" && !text) {
          text = "Maaf, saya tidak bisa membantu untuk permintaan itu. Coba ceritakan dengan cara lain ya.";
          controller.enqueue(encoder.encode(text));
        }
        await supabase.from("ai_messages").insert({
          role: "assistant",
          content: text || "(kosong)",
          input_tokens: final.usage.input_tokens,
          output_tokens: final.usage.output_tokens,
        });
      } catch (e) {
        const msg =
          e instanceof Anthropic.RateLimitError
            ? "AI sedang ramai. Coba lagi sebentar lagi."
            : e instanceof Anthropic.AuthenticationError
              ? "Kunci AI tidak valid. Hubungi admin."
              : e instanceof Anthropic.APIError
                ? "AI sedang tidak tersedia. Coba lagi nanti."
                : "Terjadi kesalahan.";
        console.error("AI error", e);
        controller.enqueue(encoder.encode((text ? "\n\n" : "") + "⚠️ " + msg));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
