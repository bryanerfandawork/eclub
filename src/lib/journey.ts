import { SEF_STEPS, SPARK, phaseName, type Tool } from "./sef";

export type Stage = {
  id: string;
  no: string;
  name: string;
  phase: string;
  desc: string;
  tools: Tool[];
};

/** Perjalanan EClub: Spark (menemukan cita-cita) lalu 5 langkah Sustainable Entrepreneur Framework. */
export const STAGES: Stage[] = [
  { id: "spark", no: "00", name: SPARK.name, phase: "Awal perjalanan", desc: SPARK.sub + ": temukan kembali cita-cita Anda.", tools: SPARK.tools },
  ...SEF_STEPS.map((s) => ({
    id: s.key,
    no: String(s.no).padStart(2, "0"),
    name: s.name,
    phase: `Fase ${phaseName(s.phase)}`,
    desc: s.desc,
    tools: [...s.tools, { label: "Kelas " + s.name, href: "/learn" }],
  })),
];
