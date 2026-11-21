export default function Loading() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Memuat">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-gold-soft" />
        <div className="h-8 w-64 max-w-full rounded-xl bg-line/70" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-line/50" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 rounded-2xl bg-brand/10" />
        <div className="h-36 rounded-2xl bg-line/50" />
        <div className="hidden h-36 rounded-2xl bg-line/50 lg:block" />
      </div>
      <div className="h-64 rounded-2xl bg-line/40" />
    </div>
  );
}
