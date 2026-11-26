import {
  Award,
  BarChart3,
  BookOpen,
  Radar,
  Heart,
  CalendarCheck2,
  CalendarDays,
  Crosshair,
  FolderKanban,
  Coins,
  PieChart,
  Gem,
  Gift,
  Compass,
  Sparkles,
  HandHeart,
  TrendingUp,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Route,
  Sprout,
  Target,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
  /** Hanya tampil bila member punya / tergabung di ruang kerja tim (atau Plus). */
  team?: boolean;
};

export const mobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Hari ini", href: "/today", icon: CalendarCheck2 },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
];

export const sidebarNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Perjalanan 5 Langkah", href: "/journey", icon: Route },
      { label: "Ruang Kerja Tim", href: "/tim", icon: FolderKanban, team: true },
    ],
  },
  {
    section: "1 · Mimpi",
    items: [
      { label: "My Dreams", href: "/goals", icon: Gem },
      { label: "My Life", href: "/my-life", icon: Heart },
    ],
  },
  {
    section: "2 · Kondisi Saat Ini",
    items: [
      { label: "Cek Posisi", href: "/posisi", icon: Compass },
      { label: "Peta Income", href: "/income", icon: TrendingUp },
      { label: "Keuangan", href: "/keuangan", icon: Wallet },
    ],
  },
  {
    section: "3 · Potensi Diri",
    items: [
      { label: "Potensi Diri", href: "/potensi", icon: Sparkles },
      { label: "Tes Gaya Diri", href: "/gaya-diri", icon: PieChart },
      {
        label: "8 Wheel Entrepreneur",
        href: "/assessment/8-wheel-entrepreneur",
        icon: Radar,
      },
    ],
  },
  {
    section: "4 · Action Plan",
    items: [
      { label: "Rencana Income", href: "/rencana", icon: Coins },
      { label: "Target Harian", href: "/target", icon: Crosshair },
      { label: "Rutinitas Harian", href: "/rutinitas", icon: Sprout },
    ],
  },
  {
    section: "5 · Evaluasi",
    items: [
      { label: "Laporan Harian", href: "/today", icon: CalendarCheck2 },
      { label: "Jurnal Syukur", href: "/kebiasaan", icon: HandHeart },
      { label: "Evaluasi Berkala", href: "/evaluasi", icon: Route },
      { label: "My Progress", href: "/progress", icon: BarChart3 },
    ],
  },
  {
    section: "Belajar",
    items: [
      { label: "Learning Center", href: "/learn", icon: GraduationCap },
      { label: "Artikel", href: "/artikel", icon: Newspaper },
      { label: "Mentoring", href: "/mentoring", icon: Users },
      { label: "Event & Webinar", href: "/event", icon: CalendarDays },
      { label: "Komunitas", href: "/komunitas", icon: MessagesSquare },
      { label: "Sertifikat", href: "/sertifikat", icon: Award },
    ],
  },
  {
    section: "Akun",
    items: [
      { label: "Ajak Teman · Komisi", href: "/affiliate", icon: Gift },
      { label: "Profile & Settings", href: "/profile", icon: User },
    ],
  },
];

/** Tampilan sederhana untuk member yang bergabung lewat undangan tim (belum menyusun mimpi). */
export const simpleMobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Hari ini", href: "/today", icon: CalendarCheck2 },
  { label: "Tim", href: "/tim", icon: FolderKanban },
  { label: "5 Langkah", href: "/journey", icon: Route },
  { label: "Profile", href: "/profile", icon: User },
];

export const simpleSidebarNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Pekerjaan",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Laporan Harian", href: "/today", icon: CalendarCheck2 },
      { label: "Ruang Kerja Tim", href: "/tim", icon: FolderKanban },
    ],
  },
  {
    section: "Kenali EClub",
    items: [
      { label: "Susun Masa Depan (5 Langkah)", href: "/journey", icon: Route },
      { label: "Learning Center", href: "/learn", icon: GraduationCap },
    ],
  },
  {
    section: "Akun",
    items: [{ label: "Profile & Settings", href: "/profile", icon: User }],
  },
];
