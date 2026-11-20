import { isDemoMode } from "@/lib/supabase/config";
import { eightWheel } from "./eight-wheel";
import type { Assessment } from "./types";

const ALL: Assessment[] = [eightWheel];

/** Assessment yang boleh ditampilkan: yang sudah final, atau semuanya di mode demo. */
export function getAssessment(key: string) {
  const a = ALL.find((x) => x.key === key);
  if (!a) return null;
  return a.ready || isDemoMode ? a : { ...a, questions: [] };
}

export function listAssessments() {
  return ALL;
}
