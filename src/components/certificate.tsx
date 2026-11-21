import { Logo } from "./logo";

export function Certificate({ name, stepName, phase, no, code, issued }: { name: string; stepName: string; phase: string; no: number; code: string; issued: string }) {
  return (
    <div className="relative mx-auto aspect-[1.414] w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-white p-[5%] shadow-lift print:rounded-none print:border-0 print:shadow-none">
      <div className="pointer-events-none absolute inset-[2.5%] rounded-xl border-2 border-gold/60" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/10" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-gold/15" />
      <div className="relative flex h-full flex-col items-center justify-between text-center">
        <Logo />
        <div>
          <p className="text-[clamp(9px,1.4vw,13px)] font-semibold tracking-[0.3em] text-gold uppercase">Sertifikat Penyelesaian</p>
          <p className="mt-[2%] text-[clamp(10px,1.5vw,14px)] text-muted">Diberikan kepada</p>
          <p className="mt-[1%] font-serif text-[clamp(22px,5vw,52px)] leading-tight font-bold text-heading">{name}</p>
          <div className="mx-auto mt-[2%] h-px w-2/3 bg-line" />
          <p className="mx-auto mt-[2%] max-w-xl text-[clamp(10px,1.6vw,15px)] leading-relaxed text-ink">
            atas keberhasilan menyelesaikan seluruh materi <b>Langkah {no}: {stepName}</b> pada fase <b>{phase}</b> dalam program Sustainable Entrepreneur Framework (SEF) EClub.
          </p>
        </div>
        <div className="flex w-full items-end justify-between text-left text-[clamp(8px,1.2vw,12px)] text-muted">
          <div>
            <p>Tanggal terbit</p>
            <p className="font-semibold text-heading">{issued}</p>
          </div>
          <div className="text-center">
            <div className="mx-auto grid h-[clamp(40px,7vw,72px)] w-[clamp(40px,7vw,72px)] place-items-center rounded-full bg-brand text-[clamp(8px,1.1vw,11px)] font-bold text-gold">SEF</div>
          </div>
          <div className="text-right">
            <p>No. sertifikat</p>
            <p className="font-semibold text-heading">{code}</p>
            <p>Cek keaslian: eclub.co.id/cek-sertifikat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
