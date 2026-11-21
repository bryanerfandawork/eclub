import { CONVERT_LEAST, CONVERT_MOST, DISC_CODES, DISC_QUESTIONS } from "./data";

export type Factor = "D" | "I" | "S" | "C";
export const FACTORS: Factor[] = ["D", "I", "S", "C"];
export type DiscAnswers = { most: number[]; least: number[] }; // indeks 0-3 (a-d) per pertanyaan
export type DiscGraph = { counts: Record<Factor, number>; values: Record<Factor, number>; code: string; type: string | null; primary: Factor };
export type DiscResult = { adapted: DiscGraph; natural: DiscGraph };

const LETTER = ["A", "B", "C", "D"];

/** VLOOKUP persis; bila nilai tidak ada di tabel (sel #N/A di Excel), pakai baris terdekat. */
function convert(table: [number, number][], n: number) {
  const exact = table.find(([k]) => k === n);
  if (exact) return exact[1];
  return [...table].sort((a, b) => Math.abs(a[0] - n) - Math.abs(b[0] - n))[0][1];
}

function graph(picks: string[], table: Record<string, [number, number][]>): DiscGraph {
  const counts = { D: 0, I: 0, S: 0, C: 0 } as Record<Factor, number>;
  for (const p of picks) if (p in counts) counts[p as Factor]++;
  const values = Object.fromEntries(FACTORS.map((f) => [f, convert(table[f], counts[f])])) as Record<Factor, number>;
  // Seperti RANK di Excel: urut nilai tertinggi; jika sama, urutan D, I, S, C.
  const ranked = [...FACTORS].sort((a, b) => values[b] - values[a]);
  const code = ranked.map((f) => (values[f] > 50 ? "H" : "L") + f).join("");
  // Kode yang tidak ada di tabel Excel: cocokkan dua faktor teratas, lalu satu faktor teratas.
  const type = DISC_CODES[code] ?? Object.entries(DISC_CODES).find(([c]) => c.startsWith(code.slice(0, 4)))?.[1] ?? Object.entries(DISC_CODES).find(([c]) => c.startsWith("H" + ranked[0]))?.[1] ?? null;
  return { counts, values, code, type, primary: ranked[0] };
}

export function validDisc(a: unknown): DiscAnswers | null {
  const x = a as DiscAnswers;
  if (!x || !Array.isArray(x.most) || !Array.isArray(x.least)) return null;
  if (x.most.length !== DISC_QUESTIONS.length || x.least.length !== DISC_QUESTIONS.length) return null;
  for (let i = 0; i < DISC_QUESTIONS.length; i++) {
    const m = x.most[i], l = x.least[i];
    if (![0, 1, 2, 3].includes(m) || ![0, 1, 2, 3].includes(l) || m === l) return null;
  }
  return { most: x.most.map(Number), least: x.least.map(Number) };
}

/** Grafik I (MOST, "Adapted") dan Grafik II (LEAST, "Natural"), sesuai Lembar Periksa di Excel. */
export function scoreDisc(a: DiscAnswers): DiscResult {
  const most = a.most.map((i, q) => DISC_QUESTIONS[q].most["ABCD".indexOf(LETTER[i])]);
  const least = a.least.map((i, q) => DISC_QUESTIONS[q].least["ABCD".indexOf(LETTER[i])]);
  return { adapted: graph(most, CONVERT_MOST), natural: graph(least, CONVERT_LEAST) };
}
