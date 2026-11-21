import {
  BarChart3,
  BookOpen,
  Radar,
  Heart,
  CalendarCheck2,
  Coins,
  PieChart,
  Compass,
  Gem,
  GraduationCap,
  Home,
  LayoutDashboard,
  Newspaper,
  Route,
  Target,
  User,
  Users,
  Wallet,
  Wrench,
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
      { label: "Personal Mapping", href: "/journey#discover", icon: Compass, soon: true },
      { label: "8 Wheel Entrepreneur", href: "/assessment/8-wheel-entrepreneur", icon: Radar },
      { label: "My Dreams", href: "/goals", icon: Gem },
      { label: "Daily Action", href: "/today", icon: CalendarCheck2 },
      { label: "Keuangan", href: "/keuangan", icon: Coins },
      { label: "Revenue Streams", href: "/journey#choose", icon: Wallet, soon: true },
    ],
  },
  {
    section: "Belajar",
    items: [
      { label: "Learning Center", href: "/learn", icon: GraduationCap },
      { label: "Articles", href: "/learn#artikel", icon: Newspaper, soon: true },
      { label: "My Tools", href: "/journey#tools", icon: Wrench, soon: true },
      { label: "Mentoring", href: "/learn#mentoring", icon: Users, soon: true },
    ],
  },
  {
    section: "Akun",
    items: [
      { label: "My Progress", href: "/progress", icon: BarChart3 },
      { label: "Profile & Settings", href: "/profile", icon: User },
    ],
  },
];
