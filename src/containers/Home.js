import React, { useContext, useMemo, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Flex,
  ConfigProvider,
  theme,
  Drawer,
  Avatar,
  Typography,
  Popconfirm,
  Divider,
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
  UserOutlined,
  GlobalOutlined,
  LogoutOutlined,
  BookOutlined,
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
import GeoSmart from "../components/geo_smart/GeoSmart";
import GeneralSummary from "../components/geo_smart/GeneralSummary";
import GeneralSummaryUser34 from "../components/geo_smart/GeneralSummaryUser34";
import ListWells from "../components/home/ListWells";
import { FcDoughnutChart } from "react-icons/fc";

const { Header, Sider, Content } = Layout;
const { useToken } = theme;
const { Title } = Typography;

const MENU_ITEMS = [
  { key: "0", icon: <GlobalOutlined />, label: "Centro de Control", to: "/" },
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
  { key: "7", icon: <AlertOutlined />, label: "Centro de Alertas", to: "/alertas" },
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
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Cargando información del punto de captación...</p>
        </Flex>
      );
    }

    // Validar que tengamos las propiedades necesarias
    const hasValidDga =
      state.selected_profile.dga &&
      typeof state.selected_profile.dga === "object";
    const hasValidUser = state.user && typeof state.user === "object";

    if (!hasValidDga) {
      console.log(
        "Selected profile sin datos DGA válidos:",
        state.selected_profile
      );
      return (
        <Flex align="center" justify="center" style={{ height: "50vh" }}>
          <p>Error: Información DGA no disponible</p>
        </Flex>
      );
    }

    try {
      console.log("🔍 DEBUG - profile_ikolu:", state.selected_profile.profile_ikolu);
      console.log("🔍 DEBUG - entry_by_form:", state.selected_profile.profile_ikolu?.entry_by_form);

      if (state.selected_profile.profile_ikolu?.entry_by_form) {
        console.log("✅ Mostrando FORMULARIO MANUAL");
        return (
          <TableStandarVerySmallResponsive data={state.selected_profile} />
        );
      } else if (state.selected_profile.dga.type_dga === "SUBTERRANEO") {
        console.log("✅ Mostrando TELEMETRÍA (MyWell)");
        return <MyWell />;
      } else {
        console.log("✅ Mostrando SMA");
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

  // Función para determinar qué componente de centro de control usar
  const renderCentroControl = () => {
    // Si el usuario tiene ID 34, usar el componente personalizado
    if (state.user && state.user.id === 34) {
      return <GeneralSummaryUser34 profiles={state.profile_client} />;
    }
    // Si no, usar el componente original
    return <GeneralSummary profiles={state.profile_client} />;
  };

  return (
    <Routes>
      <Route path="/" element={renderCentroControl()} />
      <Route path="/geo" element={<GeoSmart />} />
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
    </Routes>
  );
});

const SideMenu = ({ inDrawer = false, onLinkClick }) => {
  const location = useLocation();
  const { token } = useToken();
  const { isMobile } = useResponsive();
  const { state } = useContext(AppContext);

  // Filtrar elementos del menú basado en el perfil seleccionado
  // Ocultar DGA - MEE (key "4") cuando el selected_profile no tenga código DGA
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Si es DGA - MEE (key "4") y el perfil seleccionado no tiene código DGA, ocultarlo
      if (item.key === "4") {
        const hasDgaCode = state.selected_profile?.dga?.code_dga;
        if (!hasDgaCode) {
          return false;
        }
      }
      return true;
    });
  }, [state.selected_profile?.dga?.code_dga]);

  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    // Ordena de mayor a menor longitud de 'to'
    const sortedItems = [...filteredMenuItems].sort(
      (a, b) => b.to.length - a.to.length
    );
    const menuItem = sortedItems.find(
      (item) => currentPath === item.to || currentPath.startsWith(item.to + "/")
    );
    return menuItem ? menuItem.key : "0";
  }, [location.pathname, filteredMenuItems]);

  return (
    <Flex vertical style={{ height: "100%" }} justify="space-around">
      <Flex
        align="center"
        justify="center"
        style={{ padding: "12px 0 8px 0", gap: 10, marginBottom: 10 }}
      >
        <img src={logo} alt="Logo Zivo" style={{ width: "30px" }} />
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: 18,
            marginTop: 10,
            letterSpacing: 1,
          }}
        >
          Ikolu App
        </span>
      </Flex>

      {/* Menú principal: Centro de Control y GEO Smart */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={onLinkClick}
        style={{
          background: "transparent",
          border: "none",
          marginBottom: 4,
        }}
        items={filteredMenuItems
          .filter((item) => item.key === "0" || item.key === "1")
          .map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.to}>{item.label}</Link>,
          }))}
      />
      <Divider
        style={{
          margin: "20px 0",
          color: "white",
          fontSize: 16,
          fontWeight: 600,
          borderColor: "white",
        }}
        children="Por punto de captación"
      />
      <div
        style={{
          padding: isMobile ? "0 12px 8px 12px" : "0 8px 8px 8px",
          minWidth: 0,
        }}
      >
        <ListWells />
      </div>

      {/* Menú secundario: resto de opciones */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={onLinkClick}
        style={{
          background: "transparent",
          border: "none",
          flex: 1,
          overflowY: "auto",
        }}
        items={filteredMenuItems
          .filter((item) => item.key !== "0" && item.key !== "1")
          .map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.to}>{item.label}</Link>,
          }))}
      />
      <Flex
        gap={"small"}
        wrap={"wrap"}
        style={{ paddingLeft: 5, paddingRight: 5 }}
      >
        <Button
          block
          icon={<BookOutlined />}
          onClick={() => window.location.assign("/documentation")}
        >
          Docs
        </Button>
        {state.user && state.user.username === "demosmart" && (
          <Button
            block
            icon={<FcDoughnutChart />}
            style={{ marginBottom: 8 }}
            onClick={() => window.location.assign("/formmultidata")}
          >
            Cert B
          </Button>
        )}
      </Flex>
      <div style={{ padding: "16px", textAlign: "center" }}>
        <img
          src={minLogo}
          alt="Smart Hydro"
          style={{ width: "80%", maxWidth: "120px", opacity: 0.8 }}
        />
      </div>
      {isMobile && (
        <div style={{ padding: "16px" }}>
          <Popconfirm
            title="¿Estás seguro de cerrar sesión?"
            onConfirm={() => window.location.assign("/")}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              block
              style={{ borderRadius: "8px" }}
            >
              Cerrar Sesión
            </Button>
          </Popconfirm>
        </div>
      )}
    </Flex>
  );
};

const AppLayout = ({ children }) => {
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token } = useToken();

  const handleDrawerToggle = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          width={250}
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
      <Layout style={{ marginLeft: isMobile ? 0 : 250 }}>
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <HeaderNav
              onMenuClick={isMobile ? handleDrawerToggle : undefined}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? "80px 4px 8px 4px" : "16px 12px",
            padding: isMobile ? 12 : 16,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={handleDrawerToggle}
          open={drawerVisible}
          width={250}
          bodyStyle={{ padding: 0, background: token.colorPrimary }}
        >
          <SideMenu inDrawer onLinkClick={handleDrawerToggle} />
        </Drawer>
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
            bodyBg: "#f0f2f5",
            siderBg: "#1F3461",
          },
          Menu: {
            darkItemBg: "#1F3461",
            darkItemColor: "rgba(255, 255, 255, 0.75)",
            darkItemSelectedBg: "#ffffff",
            darkItemSelectedColor: "#1F3461",
            darkItemHoverBg: "rgba(255, 255, 255, 0.1)",
          },
          Button: {
            primaryShadow: "none",
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
