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
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex, Breadcrumb } from "antd";
import ListWells from "./ListWells";

const { Title } = Typography;

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
        marginLeft: 8,
      }}
    />
  </Flex>
));

const HeaderNav = () => {
  const { state, dispatch } = useContext(AppContext);
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    // No es necesario navegar aquí, el AppRouter se encargará
  };

  const moduleName = useMemo(() => {
    const currentPath = location.pathname;
    const menuItem = MENU_ITEMS.find((item) => currentPath.startsWith(item.to));
    return menuItem ? menuItem.label : "Módulo";
  }, [location.pathname]);

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ width: "100%", height: "100%" }}
    >
      <Breadcrumb
        separator=">"
        style={{ fontSize: "16px", fontWeight: 500 }}
        items={[
          {
            title: state.selected_profile?.title || "Punto de Captación",
          },
          {
            title: moduleName,
          },
        ]}
      />
      <Flex align="center" gap="large">
        <ListWells />
        <UserInfo email={state.user?.email} />
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
