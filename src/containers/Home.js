import React, { useContext, useMemo } from "react";
import { Layout, Menu, Button, Flex } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  WifiOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  Outlet,
  Link,
  Routes,
  Route,
  useLocation,
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
import ResponsiveGeoSmart from "../components/geo_smart/ResponsiveGeoSmart";

const { Header, Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: "1", icon: <EnvironmentOutlined />, label: "GEO Smart", to: "/geo" },
  { key: "2", icon: <WifiOutlined />, label: "Telemetría", to: "/telemetria" },
  {
    key: "3",
    icon: <BarChartOutlined />,
    label: "Smart Análisis",
    to: "/analisis",
  },
  { key: "4", icon: <FileTextOutlined />, label: "DGA - MEE", to: "/dga" },
  { key: "5", icon: <DownloadOutlined />, label: "Descarga", to: "/descarga" },
  {
    key: "6",
    icon: <FileTextOutlined />,
    label: "Documentos",
    to: "/documentos",
  },
  { key: "7", icon: <AlertOutlined />, label: "Alertas", to: "/alertas" },
  {
    key: "8",
    icon: <CustomerServiceOutlined />,
    label: "Soporte",
    to: "/soporte",
  },
];

const AppRoutes = React.memo(() => {
  const { state } = useContext(AppContext);

  // Función para renderizar el componente de la ruta principal con validaciones
  const renderMainRoute = () => {
    // Validar que tengamos un selected_profile válido
    if (!state.selected_profile || !state.selected_profile.id) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Cargando información del punto de captación...</p>
        </div>
      );
    }

    // Validar que tengamos las propiedades necesarias
    const hasValidDga =
      state.selected_profile.dga &&
      typeof state.selected_profile.dga === "object";
    const hasValidUser = state.user && typeof state.user === "object";

    if (!hasValidDga) {
      console.warn(
        "Selected profile sin datos DGA válidos:",
        state.selected_profile
      );
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Error: Información DGA no disponible</p>
        </div>
      );
    }

    try {
      if (state.selected_profile.dga.type_dga === "SUBTERRANEO") {
        if (state.selected_profile.dga.standard === "CAUDALES_MUY_PEQUENOS") {
          return (
            <TableStandarVerySmallResponsive data={state.selected_profile} />
          );
        } else {
          return <MyWell />;
        }
      } else if (hasValidUser && state.user.username === "arrocerospti") {
        return <PrototypeUmi />;
      } else {
        return <Sma />;
      }
    } catch (error) {
      console.error("Error renderizando ruta principal:", error);
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Error cargando el componente principal</p>
        </div>
      );
    }
  };

  return (
    <Routes>
      <Route path="/geo" element={<ResponsiveGeoSmart />} />
      <Route path="/telemetria" element={renderMainRoute()} />
      <Route path="/analisis" element={<ResponsiveSmartAnalysis />} />
      <Route path="/dga" element={<ResponsiveDga />} />
      <Route path="/dga-analisis" element={<GraphisNavDga />} />
      <Route path="/descarga" element={<Reports />} />
      <Route path="/documentos" element={<DocRes />} />
      <Route path="/alertas" element={<ResponsiveAlerts />} />
      <Route path="/soporte" element={<Dash />} />
      <Route path="/extraction_data" element={<Reports />} />
      <Route path="/registers_pti" element={<DataTable />} />
      <Route path="/well" element={<Well />} />
      <Route path="/sys_data" element={<GraphisNav />} />
      <Route path="/sys_data_dga" element={<GraphisNavDga />} />
      <Route path="/sys_docs" element={<DocRes />} />
      <Route path="/sys_support" element={<Dash />} />
      <Route path="/sys_alerts" element={<ResponsiveAlerts />} />
      <Route path="/graficos" element={<MyGraphics />} />
      <Route path="/formmultidata" element={<FormMultiData />} />
      <Route path="/reportes" element={<Reports />} />
      <Route path="/supp" element={<Supp />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/user-documentation" element={<UserDocumentation />} />
      <Route path="/" element={<Navigate to="/geo" replace />} />
    </Routes>
  );
});

const DesktopLayout = ({ children }) => {
  const location = useLocation();

  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    const menuItem = MENU_ITEMS.find((item) => item.to === currentPath);
    return menuItem ? menuItem.key : "1";
  }, [location.pathname]);

  return (
    <>
      <style>{`
        .ant-layout-sider .ant-menu-item::after {
          border-right: none !important;
        }

        .ant-layout-sider .ant-menu-item-selected {
          background-color: white !important;
          color: #1F3461 !important;
          font-weight: 600;
          border-radius: 8px;
          margin: 4px 8px !important;
          width: calc(100% - 16px);
        }
        
        .ant-layout-sider .ant-menu-item-selected .ant-menu-item-icon,
        .ant-layout-sider .ant-menu-item-selected a {
          color: #1F3461 !important;
        }

        .ant-layout-sider .ant-menu-item:not(.ant-menu-item-selected):hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px;
          margin: 4px 8px !important;
          width: calc(100% - 16px);
        }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            background: "#1F3461",
            minHeight: "100vh",
            position: "fixed",
            left: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "20px 0 0 0",
            }}
          >
            <div style={{ textAlign: "center", paddingBottom: "20px" }}>
              <img
                src={logo}
                alt="Logo"
                style={{ width: 60, marginBottom: 8 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                style={{ background: "#1F3461", border: "none" }}
              >
                {MENU_ITEMS.map((item) => (
                  <Menu.Item key={item.key} icon={item.icon}>
                    <Link to={item.to}>{item.label}</Link>
                  </Menu.Item>
                ))}
              </Menu>
            </div>
            <div
              style={{
                flexShrink: 0,
                textAlign: "center",
                padding: "20px 16px 15px 16px",
                marginTop: "100%",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                src={minLogo}
                alt="Smart Hydro"
                style={{ width: "75%", maxWidth: "120px", opacity: 0.9 }}
              />
            </div>
          </div>
        </Sider>
        <Layout style={{ marginLeft: 200, background: "#f0f2f5" }}>
          <Header
            style={{
              padding: 0,
              background: "#f0f2f5",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <HeaderNav />
          </Header>
          <Content
            style={{
              margin: window.innerWidth > 768 ? "24px 16px" : "0px",
              overflow: "initial",
              width: "100%",
            }}
          >
            <div style={{ padding: 24, background: "#fff", borderRadius: 16 }}>
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

const MobileLayout = ({ children }) => (
  <>
    <style>{`
      body { overflow-x: hidden !important; }
      .mobile-content {
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
        padding-top: 105px;
        min-height: 100vh;
        background: #f0f2f5;
      }
    `}</style>
    <HeaderNav />
    <div className="mobile-content">
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          marginTop: "50px",
          padding: 4,
          minHeight: "calc(100vh - 86px)",
        }}
      >
        <div style={{ borderRadius: "10px", minHeight: "calc(100vh - 94px)" }}>
          {children}
        </div>
      </div>
    </div>
  </>
);

const Home = () => {
  const { isMobile } = useResponsive();

  const LayoutComponent = isMobile ? MobileLayout : DesktopLayout;

  return (
    <LayoutComponent>
      <AppRoutes />
    </LayoutComponent>
  );
};

export default Home;
