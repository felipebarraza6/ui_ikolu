import {
  AppstoreOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  BuildOutlined,
  CloudOutlined,
  AlertOutlined,
  NotificationOutlined,
  FireOutlined,
  UserOutlined,
  CalendarOutlined,
  TagsOutlined,
  SettingOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  WifiOutlined,
} from "@ant-design/icons";

export const ADMIN_MENU = [
  {
    key: "/admin/monitoreo",
    icon: EyeOutlined,
    label: "Monitoreo",
    children: [
      { key: "/admin/performance", icon: BarChartOutlined, label: "Rendimiento" },
      { key: "/admin/compliance", icon: SafetyCertificateOutlined, label: "Cumplimiento" },
    ],
  },
  {
    key: "/admin/crm",
    icon: TeamOutlined,
    label: "CRM",
    children: [
      { key: "/admin/clients", icon: TeamOutlined, label: "Clientes" },
      { key: "/admin/projects", icon: ProjectOutlined, label: "Proyectos" },
    ],
  },
  {
    key: "/admin/iot",
    icon: WifiOutlined,
    label: "IOT",
    children: [
      { key: "/admin/points", icon: EnvironmentOutlined, label: "Puntos" },
      { key: "/admin/schemes", icon: BuildOutlined, label: "Esquemas y Variables" },
      { key: "/admin/providers", icon: CloudOutlined, label: "Proveedores" },
      { key: "/admin/alerts", icon: AlertOutlined, label: "Alertas", children: [
        { key: "/admin/alerts", icon: AlertOutlined, label: "Resumen" },
        { key: "/admin/alerts/rules", icon: NotificationOutlined, label: "Reglas" },
        { key: "/admin/alerts/channels", icon: FireOutlined, label: "Canales" },
        { key: "/admin/alerts/triggers", icon: FireOutlined, label: "Disparos" },
      ]},
    ],
  },
  {
    key: "/admin/support",
    icon: CustomerServiceOutlined,
    label: "Soporte",
    children: [
      { key: "/admin/support/my-desk", icon: CalendarOutlined, label: "Mi Escritorio" },
      { key: "/admin/support/tickets", icon: CustomerServiceOutlined, label: "Tickets" },
      { key: "/admin/support/indicators", icon: BarChartOutlined, label: "Métricas SLA" },
      { key: "/admin/support/files", icon: FolderOpenOutlined, label: "Archivos" },
      { key: "/admin/support/categories", icon: TagsOutlined, label: "Categorías" },
      { key: "/admin/support/sla-configs", icon: SettingOutlined, label: "Config. SLA" },
    ],
  },
  {
    key: "/admin/operations",
    icon: AppstoreOutlined,
    label: "Operaciones",
    children: [
      { key: "/admin/operations/my-desk", icon: CalendarOutlined, label: "Mi Escritorio" },
      { key: "/admin/operations/tasks", icon: AppstoreOutlined, label: "Tareas" },
      { key: "/admin/operations/indicators", icon: BarChartOutlined, label: "Métricas SLA" },
      { key: "/admin/operations/files", icon: FolderOpenOutlined, label: "Archivos" },
      { key: "/admin/operations/categories", icon: TagsOutlined, label: "Categorías" },
      { key: "/admin/operations/sla-configs", icon: SettingOutlined, label: "Config. SLA" },
    ],
  },
  {
    key: "/admin/administracion",
    icon: SettingOutlined,
    label: "Administración",
    children: [
      { key: "/admin/users", icon: UserOutlined, label: "Usuarios" },
    ],
  },
];

export default ADMIN_MENU;
