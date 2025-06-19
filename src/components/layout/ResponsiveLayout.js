import React, { useState, useContext, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Row,
  Col,
  Typography,
  Popconfirm,
  Badge,
  Dropdown,
} from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  LogoutOutlined,
  BuildFilled,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import logo from "../../assets/images/logozivo.png";
import logoSmall from "../../assets/images/logo-blanco.png";
import ListWells from "../home/ListWells";
import minLogo from "../../assets/images/SmartHydro-Logo.png";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const ResponsiveLayout = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { state, dispatch } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Configuración del menú
  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Telemetría",
      path: "/",
    },
    {
      key: "/sys_data",
      icon: <BarChartOutlined />,
      label: "Smart Análisis",
      path: "/sys_data",
    },
    {
      key: "/dga",
      icon: <FileTextOutlined />,
      label: "DGA - MEE",
      path: "/dga",
    },
    {
      key: "/sys_data_dga",
      icon: <BarChartOutlined />,
      label: "DGA Análisis",
      path: "/sys_data_dga",
    },
    {
      key: "/extraction_data",
      icon: <DownloadOutlined />,
      label: "Descarga",
      path: "/extraction_data",
    },
    {
      key: "/sys_docs",
      icon: <FileTextOutlined />,
      label: "Documentos",
      path: "/sys_docs",
    },
    {
      key: "/sys_alerts",
      icon: <AlertOutlined />,
      label: "Alertas",
      path: "/sys_alerts",
    },
    {
      key: "/sys_support",
      icon: <CustomerServiceOutlined />,
      label: "Soporte",
      path: "/sys_support",
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    window.location.assign("/");
  };

  // Menu de usuario para dropdown
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Header responsivo
  const renderHeader = () => (
    <Header
      style={{
        background: "#fff",
        padding: isMobile ? "0 16px" : "0 24px",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Row align="middle" justify="space-between" style={{ height: "100%" }}>
        {/* Logo y botón de menú móvil */}
        <Col>
          <Row align="middle" gutter={16}>
            {isMobile && (
              <Col>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  style={{
                    fontSize: "18px",
                    width: 40,
                    height: 40,
                  }}
                />
              </Col>
            )}
            <Col>
              <img
                src={isMobile ? logoSmall : logo}
                alt="Logo"
                style={{
                  height: isMobile ? 30 : 40,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              />
            </Col>
            {!isMobile && (
              <Col>
                <Title level={4} style={{ color: "#1F3461", margin: 0 }}>
                  {state.user?.first_name?.toUpperCase() || "IKOLU"}
                </Title>
              </Col>
            )}
          </Row>
        </Col>

        {/* Selector de pozos (centro) */}
        {!isMobile && (
          <Col
            flex="auto"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <ListWells />
          </Col>
        )}

        {/* Acciones del usuario */}
        <Col>
          <Row align="middle" gutter={8}>
            {isMobile && (
              <Col>
                <ListWells />
              </Col>
            )}
            <Col>
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  shape="circle"
                  style={{
                    fontSize: "18px",
                    width: 40,
                    height: 40,
                  }}
                />
              </Badge>
            </Col>
            <Col>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  shape="circle"
                  style={{
                    backgroundColor: "#1F3461",
                    borderColor: "#1F3461",
                    width: 40,
                    height: 40,
                  }}
                />
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );

  // Sidebar para desktop
  const renderSidebar = () =>
    !isMobile && (
      <Layout.Sider
        width={240}
        style={{
          background: "#1F3461",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 99,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: "#1F3461", border: "none" }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => handleMenuClick(item.path),
          }))}
        />
        <img src={minLogo} width={"70%"} alt="logo" />
      </Layout.Sider>
    );

  // Drawer para móvil
  const renderMobileDrawer = () => (
    <Drawer
      title={
        <Row align="middle" gutter={16}>
          <Col>
            <img src={logo} alt="Logo" style={{ height: 30 }} />
          </Col>
          <Col>
            <Text strong style={{ color: "#1F3461" }}>
              Ikolu App
            </Text>
          </Col>
        </Row>
      }
      placement="left"
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
      bodyStyle={{ padding: 0 }}
      width={280}
    >
      {/* Información del usuario */}
      <div
        style={{
          background: "#1F3461",
          color: "white",
          padding: "20px 16px",
          marginBottom: "16px",
        }}
      >
        <Row align="middle" gutter={12}>
          <Col>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserOutlined style={{ fontSize: "18px" }} />
            </div>
          </Col>
          <Col flex="auto">
            <div>
              <Text strong style={{ color: "white", fontSize: "16px" }}>
                {state.user?.first_name || "Usuario"}
              </Text>
              <br />
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}
              >
                {state.user?.email || "usuario@smarthydro.cl"}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Menú de navegación */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ border: "none" }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => handleMenuClick(item.path),
        }))}
      />

      {/* Acciones del usuario */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
        <Popconfirm
          title="¿Estás seguro de cerrar sesión?"
          onConfirm={handleLogout}
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
    </Drawer>
  );

  // Bottom Navigation para móvil
  const renderBottomNavigation = () => {
    const mainItems = menuItems.slice(0, 4); // Mostrar solo los 4 principales

    return (
      isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
            zIndex: 100,
            padding: "8px 0",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row justify="space-around" align="middle">
            {mainItems.map((item) => (
              <Col key={item.key} style={{ textAlign: "center" }}>
                <Button
                  type="text"
                  onClick={() => handleMenuClick(item.path)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "auto",
                    padding: "4px 8px",
                    color:
                      location.pathname === item.key ? "#1F3461" : "#8c8c8c",
                    background:
                      location.pathname === item.key
                        ? "#f0f8ff"
                        : "transparent",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "2px" }}>
                    {item.icon}
                  </div>
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "inherit",
                    }}
                  >
                    {item.label.split(" ")[0]}
                  </Text>
                </Button>
              </Col>
            ))}
            <Col style={{ textAlign: "center" }}>
              <Button
                type="text"
                onClick={() => setDrawerVisible(true)}
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
                <div style={{ fontSize: "18px", marginBottom: "2px" }}>
                  <MenuOutlined />
                </div>
                <Text style={{ fontSize: "10px", color: "inherit" }}>Más</Text>
              </Button>
            </Col>
          </Row>
        </div>
      )
    );
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {renderSidebar()}

      <Layout style={{ marginLeft: isMobile ? 0 : 240 }}>
        {renderHeader()}

        <Content
          style={{
            margin: isMobile ? "16px 16px 80px 16px" : "24px",
            background: "#fff",
            borderRadius: isMobile ? 0 : 8,
            minHeight: "calc(100vh - 140px)",
            padding: isMobile ? 16 : 24,
          }}
        >
          {children}
        </Content>

        {!isMobile && (
          <Footer
            style={{
              textAlign: "center",
              background: "#fff",
              borderTop: "1px solid #f0f0f0",
              marginLeft: 0,
            }}
          >
            Smart Hydro ©{new Date().getFullYear()}
          </Footer>
        )}
      </Layout>

      {renderMobileDrawer()}
      {renderBottomNavigation()}
    </Layout>
  );
};

export default ResponsiveLayout;
