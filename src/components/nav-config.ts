import {
  Award,
  BarChart3,
  BookOpen,
  Radar,
  Heart,
  CalendarCheck2,
  CalendarDays,
  Crosshair,
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
};

export const mobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Keuangan", href: "/keuangan", icon: Wallet },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
];

export const sidebarNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Perjalanan 5 Langkah", href: "/journey", icon: Route },
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
      { label: "Keuangan", href: "/keuangan", icon: Coins },
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
      { label: "Target Harian", href: "/target", icon: Crosshair },
      { label: "Daily Action", href: "/today", icon: CalendarCheck2 },
      { label: "Kebiasaan", href: "/kebiasaan", icon: Sprout },
    ],
  },
  {
    section: "5 · Evaluasi",
    items: [
      { label: "Bersyukur", href: "/kebiasaan#syukur", icon: HandHeart },
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
