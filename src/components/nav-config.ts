import {
  BarChart3,
  BookOpen,
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
  { label: "Journey", href: "/journey", icon: Route },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
];

export const sidebarNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Journey", href: "/journey", icon: Route },
      { label: "Personal Mapping", href: "/journey#discover", icon: Compass, soon: true },
      { label: "My Dreams", href: "/goals", icon: Gem },
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
      { label: "My Progress", href: "/dashboard#progress", icon: BarChart3, soon: true },
      { label: "Profile & Settings", href: "/profile", icon: User },
    ],
  },
];
