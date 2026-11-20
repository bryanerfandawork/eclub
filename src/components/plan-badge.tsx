import { Crown } from "lucide-react";

export function PlanBadge({ plan }: { plan: "free" | "plus" }) {
  return plan === "plus" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-brand-deep">
      <Crown className="h-3 w-3" /> Plus
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-muted">Gratis</span>
  );
}
