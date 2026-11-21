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

export type NavItem = { label: string; href: string; icon: LucideIcon; soon?: boolean };

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
      { label: "My Journey", href: "/journey", icon: Route },
      { label: "My Life", href: "/my-life", icon: Heart },
      { label: "Tes DISC", href: "/disc", icon: PieChart },
      { label: "8 Wheel Entrepreneur", href: "/assessment/8-wheel-entrepreneur", icon: Radar },
      { label: "My Dreams", href: "/goals", icon: Gem },
      { label: "Target Harian", href: "/target", icon: Crosshair },
      { label: "Daily Action", href: "/today", icon: CalendarCheck2 },
      { label: "Kebiasaan & Syukur", href: "/kebiasaan", icon: Sprout },
      { label: "Keuangan", href: "/keuangan", icon: Coins },
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
      { label: "My Progress", href: "/progress", icon: BarChart3 },
      { label: "Affiliate", href: "/affiliate", icon: Gift },
      { label: "Profile & Settings", href: "/profile", icon: User },
    ],
  },
];
