import {
  Activity,
  Bell,
  Download,
  Droplets,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Map,
  Radio,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { hideAnalysisNav, showDocuments } from "@/utils/userFlags";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  staff?: boolean;
  analysis?: boolean;
  documents?: boolean;
  needsDga?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Centro de control", icon: LayoutDashboard },
  { to: "/mapa", label: "Captaciones", icon: Map },
  { to: "/telemetry", label: "Telemetría", icon: Radio },
  { to: "/dga", label: "Cumplimiento DGA", icon: Droplets },
  { to: "/avisos", label: "Avisos", icon: Inbox },
  { to: "/analysis", label: "Smart Análisis", icon: LineChart, analysis: true },
  { to: "/download", label: "Reportes", icon: Download },
  { to: "/servicio", label: "Estado del servicio", icon: Activity },
  { to: "/documents", label: "Documentos", icon: FolderOpen, documents: true },
  { to: "/alerts", label: "Alertas", icon: Bell },
  { to: "/support", label: "Soporte", icon: LifeBuoy },
  { to: "/profile", label: "Perfil", icon: UserRound },
  { to: "/admin", label: "Administración", icon: Shield, staff: true },
];

type NavUser = { is_staff?: boolean } | null | undefined;
type NavProfile = { dga?: { code_dga?: string } } | null | undefined;

export function visibleNav(user: NavUser, profile: NavProfile) {
  return NAV_ITEMS.filter((item) => {
    if (item.staff && !user?.is_staff) return false;
    if (item.analysis && hideAnalysisNav(user)) return false;
    if (item.documents && !showDocuments()) return false;
    if (item.needsDga && !profile?.dga?.code_dga) return false;
    return true;
  });
}

export function isNavActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function titleForPath(pathname: string) {
  const match = NAV_ITEMS.find((item) => isNavActive(pathname, item.to));
  return match?.label || "Ikolu";
}
