import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Flex,
  ConfigProvider,
  theme,
  Drawer,
  Typography,
  Popconfirm,
  Badge,
  Select,
  Spin,
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
} from "@ant-design/icons";
import {
  Outlet,
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import logo from "../assets/images/logozivo.png";
import HeaderNav from "../components/home/HeaderNav";
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import ResponsiveSmartAnalysis from "../components/smart_data/ResponsiveSmartAnalysis";
import ResponsiveDga from "../components/dga/ResponsiveDga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Dash from "../components/support/Dash";
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import ResponsiveAlerts from "../components/alerts/ResponsiveAlerts";
import FormMultiData from "../containers/FormMultiData";
import TableStandarVerySmallResponsive from "../components/mywell/TableStandarVerySmallResponsive";
import { AppContext } from "../App";
import MyGraphics from "../components/graphics/MyGraphics";
import Supp from "../components/home/Supp";
import minLogo from "../assets/images/logo-blanco.png";
import { useResponsive } from "../hooks/useResponsive";
import Documentation from "../components/documentation/Documentation";
import UserDocumentation from "../components/documentation/UserDocumentation";
import UserProfile from "../components/profile/UserProfile";
import AdminDashboard from "../components/admin/AdminDashboard";
import GeoSmart from "../components/geo_smart/GeoSmart";
import GeneralSummary from "../components/geo_smart/GeneralSummary";
import GeneralSummaryUser34 from "../components/geo_smart/GeneralSummaryUser34";
import ListWells from "../components/home/ListWells";
import sh from "../api/sh/endpoints";
import { FcDoughnutChart } from "react-icons/fc";

const { Header, Sider, Content } = Layout;
const { useToken } = theme;
const { Title } = Typography;

// ──────────────────────────────────────────
// Menú agrupado con submenús
// ──────────────────────────────────────────
// ── Items globales: siempre visibles, no dependen de punto seleccionado ──
// ── Items planos (globales o que no necesitan submenú) ──
const GLOBAL_ITEMS = [
  { key: "0", icon: <GlobalOutlined />, label: "Centro de Control", to: "/" },
  { key: "1", icon: <EnvironmentOutlined />, label: "GEO Smart", to: "/geo" },
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

  const renderMainRoute = () => {
    if (!state.selected_profile || !state.selected_profile.id) {
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Cargando información del punto de captación...</p>
        </Flex>
      );
    }
    const hasValidDga =
      state.selected_profile.dga && typeof state.selected_profile.dga === "object";
    const hasValidUser = state.user && typeof state.user === "object";

    if (!hasValidDga) {
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Error: Información DGA no disponible</p>
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

  const renderCentroControl = () => {
    if (state.user && state.user.id === 34) {
      return <GeneralSummaryUser34 profiles={state.profile_client} />;
    }
    return <GeneralSummary profiles={state.profile_client} />;
  };

  return (
    <Routes>
      <Route path="/" element={renderCentroControl()} />
      <Route path="/geo" element={<GeoSmart />} />
      <Route path="/telemetry" element={renderMainRoute()} />
      <Route path="/analysis" element={<ResponsiveSmartAnalysis />} />
      <Route path="/dga" element={<ResponsiveDga />} />
      <Route path="/dga-analysis" element={<GraphisNavDga />} />
      <Route path="/download" element={<Reports />} />
      <Route path="/documents" element={<DocRes />} />
      <Route path="/alerts" element={<ResponsiveAlerts />} />
      <Route path="/support" element={<Dash />} />
      <Route path="/extraction-data" element={<Reports />} />
      <Route path="/registers-pti" element={<DataTable />} />
      <Route path="/well" element={<Well />} />
      <Route path="/sys-data" element={<GraphisNav />} />
      <Route path="/sys-data-dga" element={<GraphisNavDga />} />
      <Route path="/sys-docs" element={<DocRes />} />
      <Route path="/sys-support" element={<Dash />} />
      <Route path="/sys-alerts" element={<ResponsiveAlerts />} />
      <Route path="/charts" element={<MyGraphics />} />
      <Route path="/form-multi-data" element={<FormMultiData />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/supp" element={<Supp />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/user-documentation" element={<UserDocumentation />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
});

// ──────────────────────────────────────────
// Bottom Navigation (móvil)
// ──────────────────────────────────────────
const BOTTOM_NAV_ITEMS = [
  { key: "0", icon: <GlobalOutlined />, label: "Inicio", to: "/" },
  { key: "2", icon: <WifiOutlined />, label: "Telemetría", to: "/telemetry" },
  { key: "3", icon: <BarChartOutlined />, label: "Análisis", to: "/analysis" },
  { key: "5", icon: <DownloadOutlined />, label: "Descarga", to: "/download" },
];

const BottomNav = ({ onMoreClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = findActiveKey(location.pathname, ALL_MENU_ITEMS);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
        zIndex: 100,
        padding: "6px 0",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
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
              color: isActive ? "#1F3461" : "#8c8c8c",
              background: isActive ? "#f0f5ff" : "transparent",
              borderRadius: "8px",
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
          color: "#8c8c8c",
          borderRadius: "8px",
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
  const { token } = useToken();
  const { isMobile } = useResponsive();
  const { state, dispatch } = useContext(AppContext);

  const [alertCount, setAlertCount] = useState(0);
  const [openKeys, setOpenKeys] = useState(["analisis", "gestion"]);

  // ── Admin: proyectos y clientes ──
  const isAdmin = state.user?.is_staff || false;
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const loadAdminData = async () => {
      setAdminLoading(true);
      try {
        const [cRes, pRes] = await Promise.all([
          sh.admin.clients(),
          sh.admin.projects(),
        ]);
        setClients(cRes.results || cRes || []);
        setProjects(pRes.results || pRes || []);
      } catch (e) {
        console.error("Error cargando datos admin:", e);
      } finally {
        setAdminLoading(false);
      }
    };
    loadAdminData();
  }, [isAdmin]);

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    if (!projectId) return;
    setAdminLoading(true);
    try {
      const res = await sh.admin.catchmentPoints({ project: projectId });
      const points = res.results || res || [];
      dispatch({
        type: "SET_PROFILE_CLIENT",
        payload: {
          profile_client: points,
          selected_profile: points.length > 0 ? { ...points[0], key: points[0].id } : null,
        },
      });
    } catch (e) {
      console.error("Error cargando puntos del proyecto:", e);
    } finally {
      setAdminLoading(false);
    }
  };

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

  // Badge en Alertas
  const menuItemsWithBadge = useMemo(() => {
    return filteredMenuItems.map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map((child) => {
            if (child.key === "7" && alertCount > 0) {
              return {
                ...child,
                label: (
                  <Link to={child.to}>
                    <Flex justify="space-between" align="center">
                      {child.label}
                      <Badge count={alertCount} size="small" style={{ background: "#FF6B35" }} />
                    </Flex>
                  </Link>
                ),
              };
            }
            return {
              ...child,
              label: <Link to={child.to}>{child.label}</Link>,
            };
          }),
        };
      }
      return {
        ...item,
        label: <Link to={item.to}>{item.label}</Link>,
      };
    });
  }, [filteredMenuItems, alertCount]);

  return (
    <Flex vertical style={{ height: "100%" }} justify="space-between">
      <div>
        {/* Logo */}
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

        {/* Selects de Admin: Cliente / Proyecto */}
        {isAdmin && (
          <div style={{ padding: "0 12px 12px 12px", minWidth: 0 }}>
            <Spin spinning={adminLoading} size="small">
              <Flex vertical gap="small">
                <Select
                  placeholder="Seleccionar proyecto"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                  dropdownStyle={{ zIndex: 1001 }}
                >
                  {projects.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name || p.title || `Proyecto ${p.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Flex>
            </Spin>
          </div>
        )}

        {/* Selector de pozo */}
        <div style={{ padding: "0 12px 16px 12px", minWidth: 0 }}>
          <ListWells />
        </div>

        {/* Items globales: arriba, fuera de submenús */}
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
          items={GLOBAL_ITEMS.filter((item) => {
            if (item.key === "4") return !!state.selected_profile?.dga?.code_dga;
            return true;
          }).map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.to}>{item.label}</Link>,
          }))}
        />

        {/* Menú agrupado por categorías */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => {
            // Solo un submenu abierto a la vez
            const latest = keys.find((k) => !openKeys.includes(k));
            setOpenKeys(latest ? [latest] : []);
          }}
          onClick={onLinkClick}
          style={{
            background: "transparent",
            border: "none",
          }}
          items={buildMenuItems(menuItemsWithBadge, onLinkClick)}
        />
      </div>

      {/* Footer del menú */}
      <div style={{ padding: "12px" }}>
        <Flex gap="small" vertical>
          <Button
            block
            size="small"
            icon={<BookOutlined />}
            onClick={() => window.location.assign("/documentation")}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              border: "none",
            }}
          >
            Docs
          </Button>
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
                style={{ borderRadius: "8px" }}
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
          width={240}
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
      <Layout style={{ marginLeft: isMobile ? 0 : 240 }}>
        <Header
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            height: 52,
            lineHeight: "52px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <HeaderNav onMenuClick={() => setDrawerVisible(true)} />
          </div>
        </Header>
        <Content
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
            width={240}
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1F3461",
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: "#ffffff",
            bodyBg: "#f5f5f5",
            siderBg: "#1F3461",
          },
          Menu: {
            darkItemBg: "#1F3461",
            darkItemColor: "rgba(255, 255, 255, 0.75)",
            darkItemSelectedBg: "rgba(255,255,255,0.15)",
            darkItemSelectedColor: "#ffffff",
            darkItemHoverBg: "rgba(255, 255, 255, 0.1)",
            darkSubMenuItemBg: "#1a2d55",
          },
          Button: {
            primaryShadow: "none",
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >

      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ConfigProvider>
  );
};

export default Home;
