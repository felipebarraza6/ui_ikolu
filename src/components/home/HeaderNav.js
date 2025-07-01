import React, { useContext, useMemo } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  WifiOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex, Breadcrumb } from "antd";
import ListWells from "./ListWells";
import { useResponsive } from "../../hooks/useResponsive";
import logo from "../../assets/images/logozivo.png";

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
  { key: "7", icon: <AlertOutlined />, label: "Alertas", to: "/alertas" },
  {
    key: "8",
    icon: <CustomerServiceOutlined />,
    label: "Soporte",
    to: "/soporte",
  },
];

const UserInfo = React.memo(({ state, onlyIcons }) => (
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
    {!onlyIcons && (
      <span style={{ color: "#1F3461", fontSize: "14px", fontWeight: "500" }}>
        @{state.user?.username || "Usuario"}
      </span>
    )}
  </Flex>
));

const HeaderNav = ({ onMenuClick }) => {
  const { state, dispatch } = useContext(AppContext);
  const location = useLocation();
  const { isMobile } = useResponsive();

  const isDocOrEmpresas =
    location.pathname.startsWith("/documentation") ||
    location.pathname.startsWith("/user-documentation") ||
    location.pathname.startsWith("/empresas-b");

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    // No es necesario navegar aquí, el AppRouter se encargará
  };

  const moduleName = useMemo(() => {
    const currentPath = location.pathname;
    // Buscar el item de menú más largo que haga match con la ruta
    const sortedItems = [...MENU_ITEMS].sort(
      (a, b) => b.to.length - a.to.length
    );
    const menuItem = sortedItems.find(
      (item) => currentPath === item.to || currentPath.startsWith(item.to + "/")
    );
    return menuItem ? menuItem.label : "Módulo";
  }, [location.pathname]);

  // Breadcrumb dinámico: nombre del pozo/sector y módulo
  const breadcrumbItems = [
    {
      title: state.selected_profile?.title || "Punto de Captación",
    },
    {
      title: moduleName,
    },
  ];

  // Estilos para el header y breadcrumb en mobile
  const headerMobileStyle = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        background: "#1F3461",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        padding: "0 0 0 0",
        minHeight: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : {};

  const breadcrumbMobileStyle = isMobile
    ? {
        flex: 1,
        textAlign: "center",
        color: "white",
        fontSize: 18,
        fontWeight: 600,
        background: "transparent",
        padding: "0 8px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }
    : { fontSize: "16px", fontWeight: 500 };

  return isMobile ? (
    <div style={headerMobileStyle}>
      <Button
        type="text"
        icon={<MenuOutlined style={{ color: "white", fontSize: 18 }} />}
        onClick={onMenuClick}
        style={{ marginLeft: 4, marginRight: 8 }}
      />
      <img src={logo} alt="Logo" style={{ height: 32, marginRight: 8 }} />
      <div style={breadcrumbMobileStyle}>
        <span style={{ color: "white", opacity: 0.85 }}>
          {state.selected_profile?.title || "Punto de Captación"}
        </span>
        <span style={{ color: "white", opacity: 0.5, margin: "0 8px" }}>
          {">"}
        </span>
        <span style={{ color: "white" }}>{moduleName}</span>
      </div>
      <Popconfirm
        cancelText="Volver"
        okText="SALIR"
        title="¿Estás seguro de querer cerrar la sesión?"
        onConfirm={handleLogout}
      >
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: "white", fontSize: 20 }} />}
          style={{ marginRight: 8 }}
        />
      </Popconfirm>
    </div>
  ) : (
    <Flex align="center" justify="space-between" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          gap: 16,
        }}
      >
        <Breadcrumb
          separator=">"
          style={{ fontSize: "16px", fontWeight: 500 }}
          items={breadcrumbItems}
        />
      </div>
      <Flex align="center" gap={8}>
        <UserInfo state={state} onlyIcons={false} />
        <Popconfirm
          cancelText="Volver"
          okText="SALIR"
          title="¿Estás seguro de querer cerrar la sesión?"
          onConfirm={handleLogout}
        >
          <Button type="text" icon={<LogoutOutlined />} />
        </Popconfirm>
      </Flex>
    </Flex>
  );
};

export default HeaderNav;
