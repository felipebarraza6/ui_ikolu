import {
  BarChartOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  BuildOutlined,
  CloudOutlined,
  AlertOutlined,
  NotificationOutlined,
  FireOutlined,
  FileProtectOutlined,
  UserOutlined,
  CalendarOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export const ADMIN_MENU = [
  { key: "/admin/performance", icon: BarChartOutlined, label: "Rendimiento" },
  { key: "/admin/operational", icon: ToolOutlined, label: "Operacional" },
  {
    key: "/admin/support",
    icon: CustomerServiceOutlined,
    label: "Soporte",
    children: [
      { key: "/admin/support/my-desk", icon: CalendarOutlined, label: "Mi Escritorio" },
      { key: "/admin/support/tickets", icon: CustomerServiceOutlined, label: "Tickets" },
      { key: "/admin/support/indicators", icon: BarChartOutlined, label: "Métricas SLA" },
      { key: "/admin/support/categories", icon: TagsOutlined, label: "Categorías" },
      { key: "/admin/support/sla-configs", icon: SettingOutlined, label: "Configuración SLA" },
    ],
  },
  { key: "/admin/clients", icon: TeamOutlined, label: "Clientes" },
  { key: "/admin/projects", icon: ProjectOutlined, label: "Proyectos" },
  { key: "/admin/points", icon: EnvironmentOutlined, label: "Puntos" },
  { key: "/admin/schemes", icon: BuildOutlined, label: "Esquemas y Variables" },
  { key: "/admin/providers", icon: CloudOutlined, label: "Proveedores" },
  {
    key: "/admin/alerts",
    icon: AlertOutlined,
    label: "Alertas",
    children: [
      { key: "/admin/alerts", icon: AlertOutlined, label: "Resumen" },
      { key: "/admin/alerts/rules", icon: AlertOutlined, label: "Reglas" },
      { key: "/admin/alerts/channels", icon: NotificationOutlined, label: "Canales" },
      { key: "/admin/alerts/triggers", icon: FireOutlined, label: "Disparos" },
    ],
  },
  { key: "/admin/compliance", icon: FileProtectOutlined, label: "Cumplimiento" },
  { key: "/admin/users", icon: UserOutlined, label: "Usuarios" },
];

export default ADMIN_MENU;
