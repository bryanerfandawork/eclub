import { hariSingkat } from "@/lib/format";

export function WeekBars({ days }: { days: { date: string; total: number; done: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.total));
  return (
    <div className="flex h-36 items-end gap-2 sm:gap-3">
      {days.map((d, i) => {
        const today = i === days.length - 1;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold text-heading">{d.total ? `${d.done}/${d.total}` : ""}</span>
            <div className="relative flex h-24 w-full max-w-10 items-end overflow-hidden rounded-lg bg-paper">
              <div className="absolute inset-x-0 bottom-0 rounded-lg bg-gold-soft" style={{ height: `${(d.total / max) * 100}%` }} />
              <div className="relative w-full rounded-lg bg-brand" style={{ height: `${(d.done / max) * 100}%` }} />
            </div>
            <span className={`text-[11px] ${today ? "font-bold text-brand" : "text-muted"}`}>{today ? "Hari ini" : hariSingkat(d.date)}</span>
          </div>
        );
      })}
    </div>
  );
}
