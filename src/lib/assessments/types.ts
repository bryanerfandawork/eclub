/**
 * Mesin assessment berbasis kuesioner.
 * Setiap pertanyaan dijawab skala 1–5 (Sangat tidak setuju … Sangat setuju),
 * lalu skor tiap dimensi = rata-rata jawabannya, diubah ke skala 0–10.
 */
export type Dimension = {
  key: string;
  label: string;
  short?: string;
  description?: string;
  /** Interpretasi hasil: skor minimal (0–10) → teks. Diurutkan dari tertinggi. */
  levels?: { min: number; text: string }[];
};

export type Question = {
  id: string;
  dimension: string;
  text: string;
  /** true bila pernyataan negatif: jawaban 5 dihitung 1. */
  reverse?: boolean;
};

export type Assessment = {
  key: string;
  title: string;
  subtitle: string;
  intro: string;
  /** false = konten belum final; hanya tampil di mode demo. */
  ready: boolean;
  dimensions: Dimension[];
  questions: Question[];
};

export const LIKERT = [
  { value: 1, label: "Sangat tidak setuju" },
  { value: 2, label: "Tidak setuju" },
  { value: 3, label: "Netral" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat setuju" },
] as const;

export function scoreAssessment(a: Assessment, answers: Record<string, number>) {
  const scores: Record<string, number> = {};
  for (const d of a.dimensions) {
    const vals = a.questions
      .filter((q) => q.dimension === d.key && answers[q.id] >= 1 && answers[q.id] <= 5)
      .map((q) => (q.reverse ? 6 - answers[q.id] : answers[q.id]));
    scores[d.key] = vals.length ? Math.round(((vals.reduce((x, y) => x + y, 0) / vals.length - 1) / 4) * 100) / 10 : 0;
  }
  return scores;
}

export function levelText(d: Dimension, score: number) {
  return [...(d.levels ?? [])].sort((x, y) => y.min - x.min).find((l) => score >= l.min)?.text ?? null;
}
