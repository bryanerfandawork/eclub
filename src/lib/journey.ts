export type Stage = {
  id: string;
  no: string;
  name: string;
  desc: string;
  tools: { label: string; href?: string }[];
};

/** EClub Success Framework (usulan metodologi di brief, masih bisa difinalisasi). */
export const STAGES: Stage[] = [
  {
    id: "define",
    no: "01",
    name: "Define",
    desc: "Menentukan arti sukses, nilai, dan prioritas.",
    tools: [{ label: "Definisi Sukses", href: "/profile#sukses" }, { label: "Wheel of Life" }, { label: "Personal Values" }],
  },
  {
    id: "discover",
    no: "02",
    name: "Discover",
    desc: "Memahami diri, potensi, dan kompetensi.",
    tools: [{ label: "Personal Mapping" }, { label: "Strength Mapping" }],
  },
  {
    id: "design",
    no: "03",
    name: "Design",
    desc: "Membangun visi, tujuan, dan life plan.",
    tools: [{ label: "Dream Planner", href: "/goals" }, { label: "Life Vision" }],
  },
  {
    id: "choose",
    no: "04",
    name: "Choose",
    desc: "Memilih kendaraan menuju sukses.",
    tools: [{ label: "Revenue Streams" }, { label: "Career & Business Path" }],
  },
  {
    id: "develop",
    no: "05",
    name: "Develop",
    desc: "Membangun kompetensi dan sumber daya.",
    tools: [{ label: "Learning Path" }, { label: "Mentoring" }],
  },
  {
    id: "execute",
    no: "06",
    name: "Execute",
    desc: "Melakukan tindakan dan mengevaluasi hasil.",
    tools: [{ label: "Langkah Aksi", href: "/goals" }, { label: "Daily Action" }, { label: "Review Mingguan" }],
  },
];
