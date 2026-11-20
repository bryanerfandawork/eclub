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

export const WHEEL_AREAS = [
  { key: "karier", label: "Karier & Pekerjaan" },
  { key: "keuangan", label: "Keuangan" },
  { key: "kesehatan", label: "Kesehatan" },
  { key: "keluarga", label: "Keluarga" },
  { key: "relasi", label: "Relasi & Sosial" },
  { key: "diri", label: "Pengembangan Diri" },
  { key: "spiritual", label: "Spiritual" },
  { key: "rekreasi", label: "Rekreasi & Lingkungan" },
] as const;

export type WheelKey = (typeof WHEEL_AREAS)[number]["key"];
export type WheelScores = Record<WheelKey, number>;

export type WheelAssessment = {
  id: string;
  scores: WheelScores;
  note: string | null;
  created_at: string;
};

export type DailyAction = {
  id: string;
  title: string;
  action_date: string;
  done: boolean;
  dream_id: string | null;
  created_at: string;
};

export type LifePlan = {
  core_values: string[];
  vision: string | null;
  priorities: string[];
  updated_at: string | null;
};

export const VALUE_OPTIONS = [
  "Iman", "Keluarga", "Kejujuran", "Integritas", "Tanggung jawab", "Kebebasan",
  "Keamanan", "Kesehatan", "Prestasi", "Pertumbuhan", "Kreativitas", "Keberanian",
  "Kemandirian", "Kebermanfaatan", "Kepedulian", "Persahabatan", "Kesederhanaan", "Keadilan",
  "Disiplin", "Kerja keras", "Kolaborasi", "Kepemimpinan", "Inovasi", "Pengetahuan",
  "Kedamaian", "Kebahagiaan", "Kemakmuran", "Pengaruh", "Petualangan", "Rasa syukur",
] as const;
