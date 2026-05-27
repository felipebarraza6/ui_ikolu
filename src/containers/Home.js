import React, { useContext, useMemo, useState, useEffect, Suspense, lazy } from "react";
import {
  Layout,
  Menu,
  Button,
  Flex,
  theme,
  Drawer,
  Typography,
  Popconfirm,
  Badge,
  Select,
  Spin,
  Skeleton,
  Tag,
  notification,
} from "antd";

import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  WifiOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  GlobalOutlined,
  LogoutOutlined,
  BookOutlined,
  DashboardOutlined,
  FolderOutlined,
  UserOutlined,
  PushpinOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import logo from "../assets/images/logozivo.png";
import minLogo from "../assets/images/logo-blanco.png";
import HeaderNav from "../components/home/HeaderNav";
import ModuleTour from "../components/common/ModuleTour";
import { generalTour } from "../config/tours";
import ListWells from "../components/home/ListWells";
import sh from "../api/sh/endpoints";
import { FcDoughnutChart } from "react-icons/fc";
import { useLazyProfile } from "../hooks/useLazyProfile";
import { useResponsive } from "../hooks/useResponsive";
import { ikoluTokens } from "../theme";
import { AppContext } from "../App";
import PointDetailGuard from "../components/common/PointDetailGuard";
import "../styles/admin-select.css";

// Lazy loaded route components
const MyWell = lazy(() => import("../components/mywell/MyWell"));
const GraphisNav = lazy(() => import("../components/smart_data/GraphisNav"));
const ResponsiveSmartAnalysis = lazy(() => import("../components/smart_data/ResponsiveSmartAnalysis"));
const ResponsiveDga = lazy(() => import("../components/dga/ResponsiveDga"));
const Sma = lazy(() => import("../components/Sma"));
const DataTable = lazy(() => import("../components/prototype_umi/DataTable"));
const Reports = lazy(() => import("../components/reports/Reports"));
const Dash = lazy(() => import("../components/support/Dash"));
const Well = lazy(() => import("../components/mywell/Well"));
const GraphisNavDga = lazy(() => import("../components/smart_data/GraphisNavDga"));
const DocRes = lazy(() => import("../components/docres/DocRes"));
const ResponsiveAlerts = lazy(() => import("../components/alerts/ResponsiveAlerts"));
const FormMultiData = lazy(() => import("../containers/FormMultiData"));
const TableStandarVerySmallResponsive = lazy(() => import("../components/mywell/TableStandarVerySmallResponsive"));
const MyGraphics = lazy(() => import("../components/graphics/MyGraphics"));
const Supp = lazy(() => import("../components/home/Supp"));
const Documentation = lazy(() => import("../components/documentation/Documentation"));
const UserDocumentation = lazy(() => import("../components/documentation/UserDocumentation"));
const UserProfile = lazy(() => import("../components/profile/UserProfile"));
const AdminRoot = lazy(() => import("../components/admin/AdminRoot"));
const GeoSmart = lazy(() => import("../components/geo_smart/GeoSmart"));
const GeneralSummaryUser34 = lazy(() => import("../components/geo_smart/GeneralSummaryUser34"));
const ControlCenter = lazy(() => import("../components/geo_smart/ControlCenter"));
const WaterIKPage = lazy(() => import("../components/water_ik/WaterIKPage"));

const { Header, Sider, Content } = Layout;
const { useToken } = theme;
const { Title, Text } = Typography;

const RouteLoader = ({ children }) => (
  <Suspense fallback={
    <Flex align="center" justify="center" style={{ minHeight: "60vh" }}>
      <Spin size="large" tip="Cargando modulo..." />
    </Flex>
  }>
    {children}
  </Suspense>
);

// ──────────────────────────────────────────
// Menú agrupado con submenús
// ──────────────────────────────────────────
// ── Items globales: siempre visibles, no dependen de punto seleccionado ──
// ── Items planos (globales o que no necesitan submenú) ──
const GLOBAL_ITEMS = [
  { key: "0", icon: <GlobalOutlined />, label: "Centro de Control", to: "/control_center" },
  { key: "1", icon: <EnvironmentOutlined />, label: "GEO Smart", to: "/geo" },
  { key: "water-ik", icon: <RobotOutlined />, label: "WaterIK", to: "/water-ik" },
  { key: "2", icon: <WifiOutlined />, label: "Telemetría", to: "/telemetry" },
  { key: "4", icon: <FileTextOutlined />, label: "DGA - MEE", to: "/dga" },
];

// ── Items agrupados por categoría ──
const MENU_ITEMS = [
  {
    key: "analisis",
    icon: <BarChartOutlined />,
    label: "Análisis",
    children: [
      { key: "3", icon: <BarChartOutlined />, label: "Smart Análisis", to: "/analysis" },
      { key: "5", icon: <DownloadOutlined />, label: "Descarga", to: "/download" },
    ],
  },
  {
    key: "gestion",
    icon: <FolderOutlined />,
    label: "Gestión",
    children: [
      { key: "6", icon: <FileTextOutlined />, label: "Documentos", to: "/documents" },
      { key: "7", icon: <AlertOutlined />, label: "Alertas", to: "/alerts" },
    ],
  },
  { key: "8", icon: <CustomerServiceOutlined />, label: "Soporte", to: "/support" },
];

// ── Todos los items para búsqueda de ruta activa ──
const ALL_MENU_ITEMS = [...GLOBAL_ITEMS, ...MENU_ITEMS];

// Helper: obtener ruta de un item
const getItemPath = (item) => item.to || "";

// Helper: flatten items para búsqueda de ruta activa
const flattenItems = (items) => {
  const result = [];
  items.forEach((item) => {
    if (item.children) {
      result.push(...item.children);
    } else {
      result.push(item);
    }
  });
  return result;
};

// Helper: build Menu items para Ant Design
const buildMenuItems = (items, onLinkClick) => {
  return items.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: <Link to={child.to}>{child.label}</Link>,
        })),
      };
    }
    return {
      key: item.key,
      icon: item.icon,
      label: <Link to={item.to}>{item.label}</Link>,
    };
  });
};

// Helper: encontrar key activo (busca en todos los items)
const findActiveKey = (pathname, items) => {
  const flat = flattenItems(items).sort((a, b) => getItemPath(b).length - getItemPath(a).length);
  const found = flat.find((item) => pathname === getItemPath(item) || pathname.startsWith(getItemPath(item) + "/"));
  return found ? found.key : "0";
};

// Helper: encontrar el padre (submenu) de un item activo
const findParentKey = (childKey, items) => {
  for (const item of items) {
    if (item.children) {
      if (item.children.some((c) => c.key === childKey)) {
        return item.key;
      }
    }
  }
  return null;
};

// Helper: filtrar items por condiciones (ej: ocultar DGA si no hay código)
const filterMenuItems = (items, selectedProfile) => {
  return items
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          if (child.key === "4") {
            return !!selectedProfile?.dga?.code_dga;
          }
          return true;
        });
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean);
};

// ──────────────────────────────────────────
// Rutas
// ──────────────────────────────────────────
const AppRoutes = React.memo(() => {
  const { state } = useContext(AppContext);
  // 🆕 Lazy loading: cargar lista de puntos (SIN auto-seleccionar)
  const { loading } = useLazyProfile();

  const renderMainRoute = () => {
    if (!state.selected_profile || !state.selected_profile.id) {
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Selecciona un punto de captacion para ver la telemetria</p>
        </Flex>
      );
    }

    const hasValidDga =
      state.selected_profile.dga && typeof state.selected_profile.dga === "object";

    if (!hasValidDga) {
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Error: Informacion DGA no disponible</p>
        </Flex>
      );
    }

    try {
      if (state.selected_profile.profile_ikolu?.entry_by_form) {
        return <TableStandarVerySmallResponsive data={state.selected_profile} />;
      } else if (state.selected_profile.dga.type_dga === "SUBTERRANEO") {
        return <MyWell />;
      } else {
        return <Sma />;
      }
    } catch (error) {
      console.error("Error renderizando ruta principal:", error);
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Error cargando el componente principal</p>
        </Flex>
      );
    }
  };

  const renderHome = () => {
    // Admin sin punto seleccionado: mostrar AdminRoot (dashboard del sistema)
    if (!state.selected_profile?.id && (state.user?.is_staff || state.user?.is_superuser)) {
      return <AdminRoot />;
    }
    // Todos los demás (admin con punto o usuarios normales) van a /control_center
    return <Navigate to="/control_center" replace />;
  };

  // Componente estático para rutas que necesitan detalle completo del punto
  // Se define fuera del render para evitar desmontajes innecesarios
  const WithDetail = ({ children }) => <PointDetailGuard>{children}</PointDetailGuard>;

  const isAdmin = state.user?.is_staff || state.user?.is_superuser;
  const hasPoint = !!state.selected_profile?.id;

  const location = useLocation();
  return (
    <div key={location.pathname} className="route-fade-in">
    <Routes>
      {/* Rutas SIEMPRE visibles */}
      <Route path="/" element={renderHome()} />
      <Route path="/control_center" element={
        <RouteLoader>
          {state.user?.id === 34 ? (
            <GeneralSummaryUser34 profiles={state.selected_profile?.id ? [state.selected_profile] : (state.points_list || [])} />
          ) : (
            <ControlCenter />
          )}
        </RouteLoader>
      } />
      <Route path="/documentation" element={<RouteLoader><Documentation /></RouteLoader>} />
      <Route path="/user-documentation" element={<RouteLoader><UserDocumentation /></RouteLoader>} />
      <Route path="/profile" element={<RouteLoader><UserProfile /></RouteLoader>} />
      <Route path="/admin" element={isAdmin ? <RouteLoader><AdminRoot /></RouteLoader> : <Navigate to="/" />} />

      {/* Rutas disponibles SIN punto: Centro de Control + Geo Smart + Admin + Documentación */}
      <Route path="/geo" element={<RouteLoader><GeoSmart /></RouteLoader>} />
      <Route path="/water-ik/*" element={<RouteLoader><WaterIKPage /></RouteLoader>} />

      {/* Rutas que REQUIEREN punto seleccionado */}
      {hasPoint && (
        <>
          <Route path="/support" element={<RouteLoader><Dash /></RouteLoader>} />
          <Route path="/supp" element={<RouteLoader><Supp /></RouteLoader>} />
          <Route path="/form-multi-data" element={<RouteLoader><FormMultiData /></RouteLoader>} />
          <Route path="/telemetry" element={<WithDetail><RouteLoader>{renderMainRoute()}</RouteLoader></WithDetail>} />
          <Route path="/analysis" element={<WithDetail><RouteLoader><ResponsiveSmartAnalysis /></RouteLoader></WithDetail>} />
          <Route path="/dga" element={<WithDetail><RouteLoader><ResponsiveDga /></RouteLoader></WithDetail>} />
          <Route path="/dga-analysis" element={<WithDetail><RouteLoader><GraphisNavDga /></RouteLoader></WithDetail>} />
          <Route path="/download" element={<WithDetail><RouteLoader><Reports /></RouteLoader></WithDetail>} />
          <Route path="/documents" element={<WithDetail><RouteLoader><DocRes /></RouteLoader></WithDetail>} />
          <Route path="/alerts" element={<WithDetail><RouteLoader><ResponsiveAlerts /></RouteLoader></WithDetail>} />
          <Route path="/extraction-data" element={<WithDetail><RouteLoader><Reports /></RouteLoader></WithDetail>} />
          <Route path="/registers-pti" element={<WithDetail><RouteLoader><DataTable /></RouteLoader></WithDetail>} />
          <Route path="/well" element={<WithDetail><RouteLoader><Well /></RouteLoader></WithDetail>} />
          <Route path="/sys-data" element={<WithDetail><RouteLoader><GraphisNav /></RouteLoader></WithDetail>} />
          <Route path="/sys-data-dga" element={<WithDetail><RouteLoader><GraphisNavDga /></RouteLoader></WithDetail>} />
          <Route path="/sys-docs" element={<WithDetail><RouteLoader><DocRes /></RouteLoader></WithDetail>} />
          <Route path="/sys-support" element={<RouteLoader><Dash /></RouteLoader>} />
          <Route path="/sys-alerts" element={<WithDetail><RouteLoader><ResponsiveAlerts /></RouteLoader></WithDetail>} />
          <Route path="/charts" element={<WithDetail><RouteLoader><MyGraphics /></RouteLoader></WithDetail>} />
          <Route path="/reports" element={<WithDetail><RouteLoader><Reports /></RouteLoader></WithDetail>} />
        </>
      )}

      {/* Ruta comodín: bloquear rutas que requieren punto cuando no hay punto */}
      {!hasPoint && (
        <Route path="*" element={
          <Flex align="center" justify="center" style={{ height: "50vh" }} vertical>
            <Text strong style={{ fontSize: 18, color: ikoluTokens.colorCorporateBlue, marginBottom: 8 }}>
              Debes elegir un punto de captación
            </Text>
            <Text type="secondary" style={{ marginBottom: 16 }}>
              Selecciona un proyecto y un punto desde el menú lateral
            </Text>
            <Tag color="blue">
              {isAdmin ? "Cliente → Proyecto → Punto" : "Usa el selector en el menú lateral"}
            </Tag>
          </Flex>
        } />
      )}
    </Routes>
    </div>
  );
});

// ──────────────────────────────────────────
// Bottom Navigation (móvil)
// ──────────────────────────────────────────
const BottomNav = ({ onMoreClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const activeKey = findActiveKey(location.pathname, ALL_MENU_ITEMS);

  const hasPoint = !!state.selected_profile?.id;

  // Items disponibles según estado
  const navItems = [
    { key: "0", icon: <GlobalOutlined />, label: "Inicio", to: "/control_center" },
    ...(hasPoint ? [
      { key: "2", icon: <WifiOutlined />, label: "Telemetría", to: "/telemetry" },
      { key: "3", icon: <BarChartOutlined />, label: "Análisis", to: "/analysis" },
      { key: "5", icon: <DownloadOutlined />, label: "Descarga", to: "/download" },
    ] : []),
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: ikoluTokens.colorWhite,
        borderTop: `1px solid ${ikoluTokens.colorBorderLight}`,
        zIndex: 100,
        padding: "6px 0",
        boxShadow: ikoluTokens.shadowNav,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <Button
            key={item.key}
            type="text"
            onClick={() => navigate(item.to)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "auto",
              padding: "4px 8px",
              color: isActive ? ikoluTokens.colorCorporateBlue : ikoluTokens.colorGreyText,
              background: isActive ? ikoluTokens.colorBlueBg : "transparent",
              borderRadius: ikoluTokens.radiusDefault,
            }}
          >
            <span style={{ fontSize: 18, marginBottom: 2 }}>{item.icon}</span>
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </Button>
        );
      })}
      <Button
        type="text"
        onClick={onMoreClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "auto",
          padding: "4px 8px",
          color: ikoluTokens.colorGreyText,
          borderRadius: ikoluTokens.radiusDefault,
        }}
      >
        <span style={{ fontSize: 18, marginBottom: 2 }}><MenuOutlined /></span>
        <span style={{ fontSize: 10 }}>Más</span>
      </Button>
    </div>
  );
};

// ──────────────────────────────────────────
// Sidebar Menu
// ──────────────────────────────────────────
const SideMenu = ({ inDrawer = false, onLinkClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { state, dispatch } = useContext(AppContext);

  const [alertCount, setAlertCount] = useState(0);
  const [openKeys, setOpenKeys] = useState(["analisis", "gestion"]);

  // ── Admin: clientes + proyectos juntos (nuevo endpoint optimizado) ──
  const isAdmin = state.user?.is_staff || false;
  const [clientTree, setClientTree] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectPoints, setProjectPoints] = useState([]);
  const [selectedProjectPoint, setSelectedProjectPoint] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Cargar árbol cliente→proyecto de una sola llamada
  useEffect(() => {
    if (!isAdmin) return;
    const loadAdminData = async () => {
      setAdminLoading(true);
      try {
        const res = await sh.admin.clientsWithProjects();
        const tree = Array.isArray(res) ? res : (res.results || []);
        setClientTree(tree);
      } catch (e) {
        console.error("Error cargando datos admin:", e);
        // Fallback a endpoints separados si el nuevo no existe aún
        try {
          const [cRes, pRes] = await Promise.all([
            sh.admin.clients(),
            sh.admin.projects(),
          ]);
          setClientTree([{ id: 0, name: "Todos", projects: (pRes.results || pRes || []) }]);
        } catch (e2) {
          console.error("Fallback también falló:", e2);
        }
      } finally {
        setAdminLoading(false);
      }
    };
    loadAdminData();
  }, [isAdmin]);

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId || null);
    setSelectedProject(null);
    setSelectedProjectPoint(null);
    setProjectPoints([]);
    // 🚫 Limpiar todo al cambiar de cliente
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: null },
    });
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    setSelectedProjectPoint(null);
    setProjectPoints([]);
    // 🚫 Limpiar punto seleccionado al cambiar de proyecto
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: null },
    });
    if (!projectId) return;
    setAdminLoading(true);

    try {
      // ✅ Endpoint que filtra por proyecto: /api/catchment_point/all/?project={id}
      const res = await sh.admin.pointsByProject(projectId);
      const points = res.results || res || [];

      console.log(`Proyecto ${projectId}: ${points.length} puntos`);

      setProjectPoints(points);

      // 🚫 NO auto-seleccionar primer punto — admin debe elegir manualmente
      // Solo guardar la lista de puntos disponibles para el proyecto
      if (points.length > 0) {
        dispatch({
          type: "SET_POINTS_LIST",
          payload: { points_list: points },
        });
      }
    } catch (e) {
      console.error("Error cargando puntos del proyecto:", e);
      notification.error({
        message: "Error cargando puntos",
        description: "No se pudieron cargar los puntos del proyecto seleccionado. Intenta con otro proyecto.",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleProjectPointChange = (pointId) => {
    const numericId = pointId ? Number(pointId) : null;
    console.log('[Admin] handleProjectPointChange:', { pointId, numericId, projectPointsCount: projectPoints.length });
    setSelectedProjectPoint(numericId);
    if (!numericId) {
      // Clear: limpiar punto seleccionado
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: { selected_profile: null },
      });
      return;
    }
    // Buscar en projectPoints
    const point = projectPoints.find((p) => p.id === numericId || String(p.id) === String(numericId));
    console.log('[Admin] Punto encontrado:', point);
    if (point) {
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: {
          selected_profile: { ...point, key: point.id },
        },
      });
    } else {
      console.warn('[Admin] No se encontró punto con id:', numericId);
    }
  };

  // Proyectos del cliente seleccionado
  const availableProjects = useMemo(() => {
    if (!selectedClient) return [];
    const client = clientTree.find((c) => c.id === selectedClient);
    return client?.projects || [];
  }, [selectedClient, clientTree]);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!state.selected_profile?.id) return;
      try {
        const res = await sh.notifications.actives(state.selected_profile.id, 1, "ALERT");
        setAlertCount(res.count || res.results?.length || 0);
      } catch (e) {
        // silent
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [state.selected_profile?.id]);

  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(MENU_ITEMS, state.selected_profile);
  }, [state.selected_profile?.dga?.code_dga]);

  const selectedKey = useMemo(() => {
    return findActiveKey(location.pathname, [...GLOBAL_ITEMS, ...filteredMenuItems]);
  }, [location.pathname, filteredMenuItems]);

  const activeParentKey = useMemo(() => {
    return findParentKey(selectedKey, filteredMenuItems);
  }, [selectedKey, filteredMenuItems]);

  // Abre automáticamente el submenu de la ruta actual (solo uno a la vez)
  useEffect(() => {
    if (activeParentKey) {
      setOpenKeys([activeParentKey]);
    } else {
      setOpenKeys([]);
    }
  }, [activeParentKey]);

  // Badge en Alertas — se inyecta directamente en groupedItems durante el render

  return (
    <Flex vertical style={{ height: "100%" }} justify="space-between">
      <div>
        {/* Logo — SOLO para usuarios normales */}
        {!isAdmin && (
          <Flex
            align="center"
            justify="center"
            style={{ padding: "16px 0 12px 0", gap: 10 }}
          >
            <img src={logo} alt="Logo Zivo" style={{ width: "28px" }} />
            <span
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 1,
              }}
            >
              Ikolu App
            </span>
          </Flex>
        )}

        {/* Breadcrumb IKOLU_ROOT para admin */}
        {isAdmin && (
          <div style={{ padding: "12px 12px 8px 12px" }}>
            <Tag
              color="blue"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              IKOLU_ROOT
            </Tag>
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                marginLeft: 8,
                display: "block",
                marginTop: 4,
              }}
            >
              {selectedClient
                ? `${clientTree.find((c) => c.id === selectedClient)?.name || "Cliente"} / ${selectedProject ? (availableProjects.find((p) => p.id === selectedProject)?.name || "Proyecto") : "..."}`
                : "Selecciona un cliente para comenzar"}
            </Text>
          </div>
        )}

        {/* Selects de Admin: Cliente / Proyecto / Punto */}
        {isAdmin && (
          <div style={{ padding: "0 12px 12px 12px", minWidth: 0 }}>
            {/* Estilos admin-select movidos a index.css */}
            <Spin spinning={adminLoading} size="small">
              <Flex id="point-selector" vertical gap="small">
                {/* Select Cliente */}
                <Select
                  className="admin-select"
                  placeholder="Seleccionar cliente"
                  value={selectedClient}
                  onChange={handleClientChange}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  allowClear
                  prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }} />}
                  popupMatchSelectWidth
                  listHeight={280}
                  dropdownStyle={{ borderRadius: 8 }}
                >
                  {clientTree.map((c) => (
                    <Select.Option key={c.id} value={c.id} label={c.name || `Cliente ${c.id}`}>
                      <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                        <span style={{ fontWeight: 500 }}>{c.name || `Cliente ${c.id}`}</span>
                        <Tag
                          size="small"
                          style={{
                            fontSize: 10,
                            background: ikoluTokens.colorCorporateBlue,
                            color: ikoluTokens.colorWhite,
                            border: "none",
                            marginLeft: 8,
                          }}
                        >
                          {c.projects?.length || 0} proyectos
                        </Tag>
                      </Flex>
                    </Select.Option>
                  ))}
                </Select>

                {/* Select Proyecto (filtrado por cliente) */}
                <Select
                  className="admin-select"
                  placeholder="Seleccionar proyecto"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  disabled={!selectedClient}
                  allowClear
                  prefix={<FolderOutlined style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }} />}
                  popupMatchSelectWidth
                  listHeight={280}
                  dropdownStyle={{ borderRadius: 8 }}
                >
                  {availableProjects.map((p) => (
                    <Select.Option
                      key={p.id}
                      value={p.id}
                      label={p.name || p.title || `Proyecto ${p.id}`}
                    >
                      <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 500 }}>{p.name || p.title || `Proyecto ${p.id}`}</span>
                          {p.code_internal && (
                            <span style={{ fontSize: 11, color: "#888" }}>
                              Código: {p.code_internal}
                            </span>
                          )}
                        </Flex>
                      </Flex>
                    </Select.Option>
                  ))}
                </Select>

                {/* Select Punto (puntos del proyecto seleccionado) */}
                <Select
                  className="admin-select"
                  placeholder="Seleccionar punto"
                  value={selectedProjectPoint}
                  onChange={handleProjectPointChange}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="label"
                  optionLabelProp="label"
                  disabled={!selectedProject || projectPoints.length === 0}
                  allowClear
                  prefix={<PushpinOutlined style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }} />}
                  popupMatchSelectWidth
                  listHeight={280}
                  dropdownStyle={{ borderRadius: 8 }}
                >
                  {projectPoints.map((p) => (
                    <Select.Option
                      key={p.id}
                      value={p.id}
                      label={p.title || `Punto ${p.id}`}
                    >
                      <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 500 }}>{p.title || `Punto ${p.id}`}</span>
                          {p.frecuency && (
                            <span style={{ fontSize: 11, color: "#888" }}>
                              Frec: {p.frecuency} min
                            </span>
                          )}
                        </Flex>
                        <Flex gap="small">
                          {p.dga?.code_dga && (
                            <Tag
                              size="small"
                              color="green"
                              style={{ fontSize: 10, margin: 0 }}
                            >
                              {p.dga.code_dga}
                            </Tag>
                          )}
                          {p.lat && p.lon && (
                            <Tag
                              size="small"
                              style={{
                                fontSize: 10,
                                background: ikoluTokens.colorCorporateBlue,
                                color: ikoluTokens.colorWhite,
                                border: "none",
                                margin: 0,
                              }}
                            >
                              GPS
                            </Tag>
                          )}
                        </Flex>
                      </Flex>
                    </Select.Option>
                  ))}
                </Select>
              </Flex>
            </Spin>
          </div>
        )}

        {/* Selector de pozo — SOLO para usuarios normales (no admin/staff) */}
        {!isAdmin && (
          <div id="point-selector" style={{ padding: "0 12px 16px 12px", minWidth: 0 }}>
            <ListWells />
          </div>
        )}

        {/* MENÚ UNIFICADO: siempre visible, bloqueado si no hay punto */}
        {(() => {
          const hasPoint = !!state.selected_profile?.id;
          const isAdminUser = state.user?.is_staff || state.user?.is_superuser;

          const blockMsg = "Debes seleccionar un punto de captación";

          // Helper: crear item de menú con soporte para bloqueo
          const mkItem = (key, icon, label, to, requiresPoint = false) => ({
            key,
            icon,
            label: requiresPoint && !hasPoint ? (
              <span style={{ opacity: 0.45 }}>{label}</span>
            ) : (
              <Link to={to}>{label}</Link>
            ),
            disabled: requiresPoint && !hasPoint,
            title: requiresPoint && !hasPoint ? blockMsg : undefined,
          });

          // Items que SIEMPRE están disponibles
          const alwaysItems = [
            {
              key: "0",
              icon: <GlobalOutlined />,
              label: "Centro de Control",
              onClick: () => {
                dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: null } });
                if (isAdminUser) {
                  navigate("/");
                } else {
                  navigate("/control_center");
                }
                if (onLinkClick) onLinkClick();
              },
            },
            {
              key: "1",
              icon: <EnvironmentOutlined />,
              label: "GEO Smart",
              onClick: () => {
                dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: null } });
                navigate("/geo");
                if (onLinkClick) onLinkClick();
              },
            },
            {
              key: "water-ik",
              icon: <RobotOutlined />,
              label: (
                <span>
                  WaterIK <Tag color="orange" style={{ fontSize: 9, padding: "0 4px", lineHeight: "16px", marginLeft: 4 }}>Beta</Tag>
                </span>
              ),
              onClick: () => {
                navigate("/water-ik");
                if (onLinkClick) onLinkClick();
              },
            },
          ];

          // Items que REQUIEREN punto seleccionado
          const pointItems = [
            mkItem("2", <WifiOutlined />, "Telemetría", "/telemetry", true),
            ...(state.selected_profile?.dga?.code_dga ? [mkItem("4", <FileTextOutlined />, "DGA - MEE", "/dga", true)] : []),
          ];

          // Submenú Análisis
          const analisisChildren = [
            mkItem("3", <BarChartOutlined />, "Smart Análisis", "/analysis", true),
            mkItem("5", <DownloadOutlined />, "Descarga", "/download", true),
          ];

          // Submenú Gestión
          const gestionChildren = [
            mkItem("6", <FileTextOutlined />, "Documentos", "/documents", true),
            mkItem("7", <AlertOutlined />, "Alertas", "/alerts", true),
          ];

          // Admin siempre ve Admin
          const adminItem = isAdminUser
            ? [mkItem("admin", <DashboardOutlined />, "Admin", "/admin")]
            : [];

          // Documentación siempre visible
          const docsItem = [mkItem("docs", <BookOutlined />, "Documentación", "/documentation")];

          // Soporte solo para usuarios normales
          const soporteItem = !isAdminUser
            ? [mkItem("8", <CustomerServiceOutlined />, "Soporte", "/support", true)]
            : [];

          // Items globales (siempre visibles)
          const globalMenuItems = [
            ...alwaysItems,
            ...pointItems,
          ];

          // Items agrupados
          const groupedItems = [
            {
              key: "analisis",
              icon: <BarChartOutlined />,
              label: "Análisis",
              children: analisisChildren,
            },
            {
              key: "gestion",
              icon: <FolderOutlined />,
              label: "Gestión",
              children: gestionChildren,
            },
            ...soporteItem,
            ...adminItem,
            ...docsItem,
          ];

          return (
            <>
              {/* Items globales */}
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={onLinkClick}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: 8,
                  marginBottom: 8,
                }}
                items={globalMenuItems}
              />

              {/* Menú agrupado */}
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                openKeys={openKeys}
                onOpenChange={(keys) => {
                  const latest = keys.find((k) => !openKeys.includes(k));
                  setOpenKeys(latest ? [latest] : []);
                }}
                onClick={onLinkClick}
                style={{
                  background: "transparent",
                  border: "none",
                }}
                items={groupedItems}
              />
            </>
          );
        })()}
      </div>

      {/* Footer del menú */}
      <div style={{ padding: "12px" }}>
        <Flex gap="small" vertical>
          {state.user && state.user.username === "demosmart" && (
            <Button
              block
              size="small"
              icon={<FcDoughnutChart />}
              onClick={() => window.location.assign("/form-multi-data")}
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "none",
              }}
            >
              Cert B
            </Button>
          )}
        </Flex>
        <div style={{ padding: "12px 0 0 0", textAlign: "center" }}>
          <img
            src={minLogo}
            alt="Smart Hydro"
            style={{ width: "70%", maxWidth: "100px", opacity: 0.6 }}
          />
        </div>
        {isMobile && (
          <div style={{ paddingTop: 8 }}>
            <Popconfirm
              title="¿Cerrar sesión?"
              onConfirm={() => window.location.assign("/")}
              okText="Sí"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                block
                size="small"
                icon={<LogoutOutlined />}
                style={{ borderRadius: ikoluTokens.radiusDefault }}
              >
                Salir
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Flex>
  );
};

// ──────────────────────────────────────────
// Layout principal
// ──────────────────────────────────────────
const AppLayout = ({ children }) => {
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token } = useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          id="app-sider"
          width={320}
          style={{
            background: token.colorPrimary,
            position: "fixed",
            height: "100%",
            left: 0,
            top: 0,
            flex: 1,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <SideMenu />
        </Sider>
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : 320 }}>
        <Header
          id="app-header"
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: ikoluTokens.shadowNav,
            height: 52,
            lineHeight: "52px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <HeaderNav onMenuClick={() => setDrawerVisible(true)} />
          </div>
        </Header>
        <Content
          id="app-content"
          style={{
            margin: isMobile ? "52px 0 64px 0" : "12px 12px 12px 12px",
            padding: isMobile ? 8 : 12,
            minHeight: 280,
            background: "#f5f5f5",
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
      {isMobile && (
        <>
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={320}
            bodyStyle={{ padding: 0, background: token.colorPrimary }}
          >
            <SideMenu inDrawer onLinkClick={() => setDrawerVisible(false)} />
          </Drawer>
          <BottomNav onMoreClick={() => setDrawerVisible(true)} />
        </>
      )}
    </Layout>
  );
};

const Home = () => {
  return (
    <>
      <ModuleTour
        tourKey={generalTour.key}
        steps={generalTour.steps}
        requiresPoint={generalTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1500}
      />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </>
  );
};

export default Home;
