import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  WifiOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex, Drawer, Menu } from "antd";
import ListWells from "./ListWells";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import { Link } from "react-router-dom";
import { useResponsive } from "../../hooks/useResponsive";

const { Title } = Typography;

const MENU_ITEMS = [
  { key: "1", icon: <WifiOutlined />, label: "Telemetría", to: "/" },
  {
    key: "2",
    icon: <BarChartOutlined />,
    label: "Smart Análisis",
    to: "/analisis",
  },
  { key: "3", icon: <FileTextOutlined />, label: "DGA - MEE", to: "/dga" },
  {
    key: "4",
    icon: <BarChartOutlined />,
    label: "DGA Análisis",
    to: "/dga-analisis",
  },
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

const UserInfo = React.memo(({ email }) => (
  <Flex align="center" gap="small">
    <UserOutlined
      style={{
        color: "#1F3461",
        fontSize: "14px",
        backgroundColor: "#F0F2F5",
        padding: "4px",
        borderRadius: "50%",
      }}
    />
    <span style={{ color: "#1F3461", fontSize: "14px", fontWeight: "500" }}>
      {email || "Usuario"}
    </span>
    <div
      style={{
        backgroundColor: "#52C41A",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
      }}
    />
  </Flex>
));

const MobileHeader = ({ onMenuClick, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          background: "#1F3461",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "70px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          style={{ color: "white" }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            margin: "0 12px",
          }}
        >
          {pathname === "/formmultidata" ? (
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
              Volver
            </Button>
          ) : (
            <div style={{ width: "100%", maxWidth: "300px" }}>
              <ListWells />
            </div>
          )}
        </div>
        <Popconfirm
          cancelText="Volver"
          okText="SALIR"
          title="¿Estás seguro de querer cerrar la sesión?"
          onConfirm={onLogout}
        >
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: "white" }}
          />
        </Popconfirm>
      </div>
    </>
  );
};

const DesktopHeader = ({ user, onLogout }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "100%",
      padding: "0 24px",
    }}
  >
    <Title level={4} style={{ margin: 0 }}>
      PC
    </Title>
    <Flex align="center" gap="large">
      <ListWells />
    </Flex>
    <Flex align="center" gap="middle">
      <UserInfo email={user.email} />
      <Popconfirm
        cancelText="Volver"
        okText="SALIR"
        title="¿Estás seguro de querer cerrar la sesión?"
        onConfirm={onLogout}
      >
        <Button type="text" icon={<LogoutOutlined />} />
      </Popconfirm>
    </Flex>
  </div>
);

const NavDrawer = ({ visible, onClose }) => (
  <Drawer
    title={<img src={logo} alt="Logo" style={{ height: 50 }} />}
    placement="left"
    onClose={onClose}
    open={visible}
    closable={false}
    width={280}
    bodyStyle={{ padding: 0 }}
  >
    <Menu mode="vertical" style={{ border: "none" }} onClick={onClose}>
      {MENU_ITEMS.map((item) => (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          style={{
            margin: "8px 0",
            borderRadius: "8px",
            height: "48px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link to={item.to}>{item.label}</Link>
        </Menu.Item>
      ))}
    </Menu>
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: "center",
      }}
    >
      <img
        src={minLogo}
        alt="Smart Hydro"
        style={{ width: "60%", opacity: 0.8 }}
      />
    </div>
  </Drawer>
);

const HeaderNav = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    window.location.assign("/");
  };

  if (isMobile) {
    return (
      <>
        <MobileHeader
          onMenuClick={() => setDrawerVisible(true)}
          onLogout={handleLogout}
        />
        <NavDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      </>
    );
  }

  return <DesktopHeader user={state.user} onLogout={handleLogout} />;
};

export default HeaderNav;
