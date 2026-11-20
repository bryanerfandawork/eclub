import { BookOpen, PlayCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Learning Center" };

const items = [
  { id: "kelas", icon: PlayCircle, title: "EClub Academy", desc: "Kelas video terstruktur mengikuti enam tahap Success Framework." },
  { id: "artikel", icon: BookOpen, title: "Artikel", desc: "Bacaan singkat tentang pengembangan diri, karier, dan bisnis." },
  { id: "mentoring", icon: Users, title: "Mentoring", desc: "Sesi bersama mentor untuk membahas rencana dan tantangan Anda." },
];

export default function LearnPage() {
  return (
    <>
      <PageHeader eyebrow="Learning Center" title="Belajar dan bertumbuh" desc="Materi pembelajaran sedang kami siapkan. Berikut yang akan hadir." />
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ id, icon: Icon, title, desc }, i) => (
          <div key={id} id={id} className="card animate-rise p-6" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-bold text-heading">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
            <span className="mt-4 inline-block rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">Segera hadir</span>
          </div>
        ))}
      </div>
    </>
  );
}
