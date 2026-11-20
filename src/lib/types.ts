export type Profile = {
  id: string;
  full_name: string | null;
  segment: string | null;
  success_definition: string | null;
};

export type Dream = {
  id: string;
  title: string;
  category: string;
  why: string | null;
  target_amount: number | null;
  saved_amount: number;
  target_date: string | null;
  status: "active" | "achieved" | "paused";
  created_at: string;
};

export type DreamAction = {
  id: string;
  dream_id: string;
  title: string;
  done: boolean;
  created_at: string;
};

export const SEGMENTS = [
  "Pelajar / Mahasiswa",
  "Fresh Graduate",
  "Karyawan",
  "Profesional",
  "Freelancer",
  "Entrepreneur",
  "Pemilik Bisnis",
] as const;

export const DREAM_CATEGORIES = [
  "Karier",
  "Bisnis",
  "Keuangan",
  "Keluarga",
  "Pendidikan",
  "Kesehatan",
  "Perjalanan",
  "Spiritual",
  "Sosial",
  "Lainnya",
] as const;
