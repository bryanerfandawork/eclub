import { BookOpen } from "lucide-react";

export function CourseCover({ url, title, className = "" }: { url: string | null; title: string; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`aspect-video w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative grid aspect-video w-full place-items-center overflow-hidden bg-brand ${className}`}>
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/30 blur-2xl" />
      <BookOpen className="h-8 w-8 text-gold" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
